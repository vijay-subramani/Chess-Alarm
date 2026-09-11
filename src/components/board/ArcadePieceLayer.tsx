import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BlurMask,
  Canvas,
  Group,
  Image,
  LinearGradient,
  Path,
  Rect,
  Skia,
  useImage,
  vec,
} from '@shopify/react-native-skia';
import {
  cancelAnimation,
  Easing,
  runOnJS,
  useDerivedValue,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { pieceImageSource, type PieceVisual } from '@/components/board/pieceAssets';
import { boardColors } from '@/theme/tokens';

export const ARCADE_MOVE_MS = 250;
export const REJECT_MOVE_MS_MIN = 380;
export const REJECT_MOVE_MS_MAX = 560;
const REJECT_MS_PER_SQUARE = 48;
const ARCADE_EASING = Easing.out(Easing.cubic);
const REJECT_EASING = Easing.inOut(Easing.cubic);

const ARCADE_CYAN = '#00f0ff';
const ARCADE_RED = '#FF4D6A';
const TRAIL_BLUR = 8;
const MAX_TRAIL_LENGTH_CELLS = 1.8;
const THRUST_BASE_WIDTH_RATIO = 0.8;

type ExhaustCone = {
  tipX: number;
  tipY: number;
  baseLeftX: number;
  baseLeftY: number;
  baseRightX: number;
  baseRightY: number;
  frontX: number;
  frontY: number;
  length: number;
};

function exhaustConeGeometry(
  moveStartX: number,
  moveStartY: number,
  headX: number,
  headY: number,
  maxLength: number,
  baseWidth: number,
): ExhaustCone {
  'worklet';

  const fullDx = headX - moveStartX;
  const fullDy = headY - moveStartY;
  const fullDist = Math.hypot(fullDx, fullDy);
  const halfW = baseWidth / 2;

  if (fullDist <= 0.001) {
    return {
      tipX: moveStartX,
      tipY: moveStartY,
      baseLeftX: headX,
      baseLeftY: headY,
      baseRightX: headX,
      baseRightY: headY,
      frontX: headX,
      frontY: headY,
      length: 0,
    };
  }

  const ux = fullDx / fullDist;
  const uy = fullDy / fullDist;
  const px = -uy;
  const py = ux;

  const frontX = headX;
  const frontY = headY;

  let tipX = moveStartX;
  let tipY = moveStartY;
  if (fullDist > maxLength) {
    tipX = frontX - ux * maxLength;
    tipY = frontY - uy * maxLength;
  }

  const length = Math.hypot(frontX - tipX, frontY - tipY);
  if (length <= 0.001) {
    return {
      tipX,
      tipY,
      baseLeftX: frontX,
      baseLeftY: frontY,
      baseRightX: frontX,
      baseRightY: frontY,
      frontX,
      frontY,
      length: 0,
    };
  }

  return {
    tipX,
    tipY,
    baseLeftX: frontX + px * halfW,
    baseLeftY: frontY + py * halfW,
    baseRightX: frontX - px * halfW,
    baseRightY: frontY - py * halfW,
    frontX,
    frontY,
    length,
  };
}

function rejectMoveDuration(from: Point, to: Point, sqSize: number): number {
  const squares = Math.hypot(to.x - from.x, to.y - from.y) / Math.max(sqSize, 1);
  return Math.min(
    REJECT_MOVE_MS_MAX,
    Math.max(REJECT_MOVE_MS_MIN, REJECT_MOVE_MS_MIN + squares * REJECT_MS_PER_SQUARE),
  );
}

export type Point = { x: number; y: number };

export type ArcadeMoveRequest = {
  piece: PieceVisual;
  from: Point;
  to: Point;
  fromCell: Point;
  toCell: Point;
  sqSize: number;
  rejecting?: boolean;
  /** Skip the post-move trail fade so another move can chain immediately. */
  skipTrailFade?: boolean;
};

export type ArcadePieceLayerRef = {
  runMove: (request: ArcadeMoveRequest) => Promise<void>;
  progress: SharedValue<number>;
};

type Props = {
  width: number;
  height: number;
  pieceSize: number;
};

export const ArcadePieceLayer = forwardRef<ArcadePieceLayerRef, Props>(
  function ArcadePieceLayer({ width, height, pieceSize }, ref) {
    const [activePiece, setActivePiece] = useState<PieceVisual | null>(null);
    const image = useImage(
      activePiece ? (pieceImageSource(activePiece) as number) : null,
    );

    const pieceX = useSharedValue(0);
    const pieceY = useSharedValue(0);
    const progress = useSharedValue(0);
    const trailAlpha = useSharedValue(0);
    const layerOpacity = useSharedValue(0);

    const fromCellX = useSharedValue(0);
    const fromCellY = useSharedValue(0);
    const toCellX = useSharedValue(0);
    const toCellY = useSharedValue(0);
    const cellSize = useSharedValue(0);
    const trailColor = useSharedValue<string>(ARCADE_CYAN);
    const fromCellColor = useSharedValue<string>(boardColors.arcadeBright);
    const toCellColor = useSharedValue<string>(boardColors.arcade);

    const moveStartX = useSharedValue(0);
    const moveStartY = useSharedValue(0);

    const moveToken = useSharedValue(0);

    const half = pieceSize / 2;

    const pieceCenterX = useDerivedValue(() => pieceX.value + half);
    const pieceCenterY = useDerivedValue(() => pieceY.value + half);

    const maxTrailLength = useDerivedValue(() => cellSize.value * MAX_TRAIL_LENGTH_CELLS);

    const thrustBaseWidth = useDerivedValue(() => cellSize.value * THRUST_BASE_WIDTH_RATIO);

    const exhaustCone = useDerivedValue(() =>
      exhaustConeGeometry(
        moveStartX.value,
        moveStartY.value,
        pieceCenterX.value,
        pieceCenterY.value,
        maxTrailLength.value,
        thrustBaseWidth.value,
      ),
    );

    const trailLength = useDerivedValue(() => exhaustCone.value.length);

    const exhaustPath = useDerivedValue(() => {
      const cone = exhaustCone.value;
      const path = Skia.Path.Make();
      if (cone.length <= 0.5) return path;

      path.moveTo(cone.tipX, cone.tipY);
      path.lineTo(cone.baseLeftX, cone.baseLeftY);
      path.lineTo(cone.baseRightX, cone.baseRightY);
      path.close();
      return path;
    });

    const trailGradientStart = useDerivedValue(() => {
      const cone = exhaustCone.value;
      return vec(cone.tipX, cone.tipY);
    });

    const trailGradientEnd = useDerivedValue(() => {
      const cone = exhaustCone.value;
      return vec(cone.frontX, cone.frontY);
    });

    /** Sharp exhaust tip → solid neon thrust base under the piece. */
    const trailGradientColors = useDerivedValue(() => {
      const c = trailColor.value;
      return [`${c}00`, `${c}40`, c];
    });

    const trailGradientPositions = [0, 0.5, 1];

    const trailOpacity = useDerivedValue(() =>
      trailLength.value > 0.5 ? trailAlpha.value : 0,
    );

    const fromGlow = useDerivedValue(() => {
      const p = progress.value;
      if (p <= 0) return 0;
      return 1 - p * 0.85;
    });

    const toGlow = useDerivedValue(() => {
      const p = progress.value;
      if (p <= 0) return 0;
      return Math.min(1, p * 1.35);
    });

    const finishMove = useCallback(
      (token: number, resolve: () => void) => {
        if (token !== moveToken.value) {
          resolve();
          return;
        }
        setActivePiece(null);
        resolve();
      },
      [moveToken],
    );

    const onMoveFinished = useCallback(
      (token: number, resolve: () => void, skipTrailFade: boolean) => {
        if (skipTrailFade) {
          trailAlpha.value = 0;
          resolve();
          return;
        }

        trailAlpha.value = withTiming(0, { duration: 120 }, done => {
          if (!done || token !== moveToken.value) return;
          layerOpacity.value = 0;
          runOnJS(finishMove)(token, resolve);
        });
      },
      [finishMove, layerOpacity, moveToken, trailAlpha],
    );

    const onMoveCancelled = useCallback(
      (token: number, resolve: () => void) => {
        trailAlpha.value = 0;
        layerOpacity.value = 0;
        finishMove(token, resolve);
      },
      [finishMove, layerOpacity, trailAlpha],
    );

    const runMove = useCallback(
      (request: ArcadeMoveRequest) =>
        new Promise<void>(resolve => {
          const token = moveToken.value + 1;
          moveToken.value = token;

          const {
            piece,
            from,
            to,
            fromCell: fc,
            toCell: tc,
            sqSize: sq,
            rejecting = false,
            skipTrailFade = false,
          } = request;

          setActivePiece(piece);

          const moveMs = rejecting ? rejectMoveDuration(from, to, sq) : ARCADE_MOVE_MS;
          const moveEasing = rejecting ? REJECT_EASING : ARCADE_EASING;

          cancelAnimation(pieceX);
          cancelAnimation(pieceY);
          cancelAnimation(progress);
          cancelAnimation(trailAlpha);

          pieceX.value = from.x;
          pieceY.value = from.y;
          fromCellX.value = fc.x;
          fromCellY.value = fc.y;
          toCellX.value = tc.x;
          toCellY.value = tc.y;
          cellSize.value = sq;
          layerOpacity.value = 1;

          moveStartX.value = from.x + half;
          moveStartY.value = from.y + half;

          if (rejecting) {
            trailColor.value = ARCADE_RED;
            fromCellColor.value = boardColors.arcadeRejectBright;
            toCellColor.value = boardColors.arcadeReject;
          } else {
            trailColor.value = ARCADE_CYAN;
            fromCellColor.value = boardColors.arcadeBright;
            toCellColor.value = boardColors.arcade;
          }

          progress.value = 0;
          trailAlpha.value = 0;
          trailAlpha.value = withTiming(1, { duration: 35 });
          progress.value = withTiming(1, { duration: moveMs, easing: moveEasing });

          const deltaX = Math.abs(to.x - from.x);
          const deltaY = Math.abs(to.y - from.y);
          const finishOnX = deltaX >= deltaY;

          const finish = (finished?: boolean) => {
            'worklet';
            if (token !== moveToken.value) return;

            if (!finished) {
              runOnJS(onMoveCancelled)(token, resolve);
              return;
            }

            runOnJS(onMoveFinished)(token, resolve, skipTrailFade);
          };

          const timingConfig = { duration: moveMs, easing: moveEasing };

          pieceX.value = withTiming(
            to.x,
            timingConfig,
            finishOnX ? finish : undefined,
          );
          pieceY.value = withTiming(
            to.y,
            timingConfig,
            finishOnX ? undefined : finish,
          );
        }),
      [
        cellSize,
        fromCellX,
        fromCellY,
        half,
        layerOpacity,
        onMoveCancelled,
        onMoveFinished,
        moveToken,
        pieceX,
        pieceY,
        progress,
        toCellX,
        toCellY,
        trailAlpha,
        trailColor,
        moveStartX,
        moveStartY,
        fromCellColor,
        toCellColor,
      ],
    );

    useImperativeHandle(ref, () => ({ runMove, progress }), [runMove, progress]);

    const canvasStyle = useMemo(
      () => [styles.canvas, { width, height }],
      [width, height],
    );

    if (width <= 0 || height <= 0) return null;

    return (
      <View style={[styles.wrap, { width, height }]} pointerEvents="none">
        <Canvas style={canvasStyle}>
          <Group opacity={layerOpacity}>
            <Group opacity={fromGlow}>
              <Rect
                x={fromCellX}
                y={fromCellY}
                width={cellSize}
                height={cellSize}
                style="stroke"
                strokeWidth={2}
                color={fromCellColor}
              />
            </Group>
            <Group opacity={toGlow}>
              <Rect
                x={toCellX}
                y={toCellY}
                width={cellSize}
                height={cellSize}
                style="stroke"
                strokeWidth={2}
                color={toCellColor}
              />
            </Group>

            <Group opacity={trailOpacity}>
              <Path path={exhaustPath} style="fill">
                <LinearGradient
                  start={trailGradientStart}
                  end={trailGradientEnd}
                  colors={trailGradientColors}
                  positions={trailGradientPositions}
                />
                <BlurMask blur={TRAIL_BLUR} style="normal" />
              </Path>
            </Group>

            {image ? (
              <Image
                image={image}
                x={pieceX}
                y={pieceY}
                width={pieceSize}
                height={pieceSize}
                fit="contain"
              />
            ) : null}
          </Group>
        </Canvas>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    top: 0,
    zIndex: 12,
  },
  canvas: {
    flex: 1,
  },
});
