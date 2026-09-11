import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { Chess, Square } from 'chess.js';
import { PieceComponent, PieceType } from '@/components/board/ChessPieces';
import { SquareGlow } from '@/components/board/SquareGlow';
import {
  ArcadePieceLayer,
  ARCADE_MOVE_MS,
  REJECT_MOVE_MS_MAX,
  type ArcadePieceLayerRef,
} from '@/components/board/ArcadePieceLayer';
import type { PieceVisual } from '@/components/board/pieceAssets';
import { findMoveBetweenFens, squarePosition } from '@/components/board/boardUtils';
import { boardColors, spacing } from '@/theme/tokens';

/** Symmetric gutter so full-width boards don't hug one screen edge. */
const FULL_WIDTH_INSET = spacing.sm;

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;

type Props = {
  fen: string;
  orientation?: 'white' | 'black';
  hintFrom?: string | null;
  hintTo?: string | null;
  onUserMove: (uci: string, nextFen: string) => boolean;
  interactive?: boolean;
  maxSize?: number;
  fullWidth?: boolean;
  showCoordinates?: boolean;
};

type LastMove = { from: string; to: string };
type ActiveMove = { from: string; to: string };

function pieceCode(type: string, color: 'w' | 'b'): PieceVisual {
  const map: Record<string, PieceType> = {
    p: 'P',
    n: 'N',
    b: 'B',
    r: 'R',
    q: 'Q',
    k: 'K',
  };
  return { type: map[type], white: color === 'w' };
}

const START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function createChess(fen: string): Chess | null {
  if (!fen.trim()) return null;
  try {
    return new Chess(fen);
  } catch {
    return null;
  }
}

export function ChessBoard({
  fen,
  orientation = 'white',
  hintFrom,
  hintTo,
  onUserMove,
  interactive = true,
  maxSize = 320,
  fullWidth = false,
  showCoordinates = true,
}: Props) {
  const { width } = useWindowDimensions();
  const boardSize = fullWidth
    ? width - FULL_WIDTH_INSET * 2
    : Math.min(width - 48, maxSize);
  const sq = Math.floor(boardSize / 8);
  const size = sq * 8;
  const pieceSize = sq * 0.92;
  const pieceInset = (sq - pieceSize) / 2;
  const coordSize = Math.max(9, Math.round(sq * 0.22));
  const bottomRank = orientation === 'white' ? 1 : 8;
  const leftFile = orientation === 'white' ? 'a' : 'h';

  const arcadeRef = useRef<ArcadePieceLayerRef>(null);

  const [displayFen, setDisplayFen] = useState(fen);
  const [selected, setSelected] = useState<Square | null>(null);
  const [lastMove, setLastMove] = useState<LastMove | null>(null);
  const [errorSquares, setErrorSquares] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [activeMove, setActiveMove] = useState<ActiveMove | null>(null);

  const errorPulse = useRef(new Animated.Value(0)).current;
  const selectPulse = useRef(new Animated.Value(0.55)).current;

  useEffect(() => {
    if (!selected || busy) {
      selectPulse.setValue(0.55);
      return;
    }

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(selectPulse, {
          toValue: 1,
          duration: 650,
          useNativeDriver: true,
        }),
        Animated.timing(selectPulse, {
          toValue: 0.4,
          duration: 650,
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [selected, busy, selectPulse]);

  const animatingRef = useRef(false);
  const displayFenRef = useRef(fen);
  displayFenRef.current = displayFen;

  const ranks = orientation === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = orientation === 'white' ? [...FILES] : [...FILES].reverse();
  const chess = useMemo(
    () => createChess(displayFen) ?? createChess(START_FEN)!,
    [displayFen],
  );

  const legalTargets = useMemo(() => {
    if (!selected || !interactive || busy) return new Set<string>();
    const game = createChess(displayFen);
    if (!game) return new Set<string>();
    try {
      return new Set(game.moves({ square: selected, verbose: true }).map(m => m.to));
    } catch {
      return new Set<string>();
    }
  }, [selected, displayFen, interactive, busy]);

  const pieceCoordsFor = useCallback(
    (square: string) => {
      const { left, top } = squarePosition(square, orientation, sq);
      return { x: left + pieceInset, y: top + pieceInset };
    },
    [orientation, sq, pieceInset],
  );

  const cellCoordsFor = useCallback(
    (square: string) => {
      const { left, top } = squarePosition(square, orientation, sq);
      return { x: left, y: top };
    },
    [orientation, sq],
  );

  const runArcadeMove = useCallback(
    async (
      from: string,
      to: string,
      piece: PieceVisual,
      rejecting = false,
      skipTrailFade = false,
      keepActive = false,
    ) => {
      const layer = arcadeRef.current;
      if (!layer) return;

      setActiveMove({ from, to });
      await layer.runMove({
        piece,
        from: pieceCoordsFor(from),
        to: pieceCoordsFor(to),
        fromCell: cellCoordsFor(from),
        toCell: cellCoordsFor(to),
        sqSize: sq,
        rejecting,
        skipTrailFade,
      });
      if (!keepActive) setActiveMove(null);
    },
    [cellCoordsFor, pieceCoordsFor, sq],
  );

  const pulseErrorSquares = useCallback(
    (squares: string[], durationMs = REJECT_MOVE_MS_MAX) => {
      setErrorSquares(new Set(squares));
      errorPulse.setValue(0);
      Animated.sequence([
        Animated.timing(errorPulse, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(errorPulse, {
          toValue: 0.45,
          duration: durationMs,
          useNativeDriver: true,
        }),
      ]).start();
    },
    [errorPulse],
  );

  const playExternalMove = useCallback(
    async (fromFen: string, toFen: string) => {
      const move = findMoveBetweenFens(fromFen, toFen);
      if (!move) {
        setDisplayFen(toFen);
        setLastMove(null);
        setSelected(null);
        setErrorSquares(new Set());
        return;
      }

      const game = createChess(fromFen);
      const piece = game?.get(move.from as Square);
      if (!piece) {
        setDisplayFen(toFen);
        return;
      }

      animatingRef.current = true;
      setBusy(true);
      await runArcadeMove(move.from, move.to, pieceCode(piece.type, piece.color));
      setDisplayFen(toFen);
      setLastMove({ from: move.from, to: move.to });
      animatingRef.current = false;
      setBusy(false);
    },
    [runArcadeMove],
  );

  useEffect(() => {
    if (animatingRef.current) return;
    if (fen === displayFenRef.current) return;

    const move = findMoveBetweenFens(displayFenRef.current, fen);
    if (move) {
      playExternalMove(displayFenRef.current, fen).catch(() => {
        setDisplayFen(fen);
        animatingRef.current = false;
        setBusy(false);
      });
      return;
    }

    setDisplayFen(fen);
    setLastMove(null);
    setSelected(null);
    setErrorSquares(new Set());
  }, [fen, playExternalMove]);

  const onSquare = async (square: Square) => {
    if (!interactive || busy || animatingRef.current) return;

    const game = createChess(displayFen);
    if (!game) return;
    const piece = game.get(square);

    if (selected) {
      if (selected === square) {
        setSelected(null);
        return;
      }

      try {
        const move = game.move({ from: selected, to: square, promotion: 'q' });
        if (!move) {
          if (piece && piece.color === game.turn()) setSelected(square);
          else setSelected(null);
          return;
        }

        const uci = `${move.from}${move.to}${move.promotion ?? ''}`;
        const nextFen = game.fen();
        const moving = pieceCode(move.piece, move.color);
        const from = move.from;
        const to = move.to;

        setSelected(null);
        animatingRef.current = true;
        setBusy(true);

        await runArcadeMove(from, to, moving, false, true, true);

        const accepted = onUserMove(uci, nextFen);

        if (!accepted) {
          pulseErrorSquares([from, to]);
          setLastMove(null);
          await runArcadeMove(to, from, moving, true);
          setActiveMove(null);
          setErrorSquares(new Set());
          errorPulse.setValue(0);
          animatingRef.current = false;
          setBusy(false);
          return;
        }

        setDisplayFen(nextFen);
        setLastMove({ from, to });
        animatingRef.current = false;
        setBusy(false);
      } catch {
        if (piece && piece.color === game.turn()) setSelected(square);
        else setSelected(null);
      }
      return;
    }

    if (piece && piece.color === game.turn()) setSelected(square);
  };

  const hidePieceOn = (square: string) =>
    activeMove !== null && (square === activeMove.from || square === activeMove.to);

  return (
    <View
      style={[
        styles.board,
        fullWidth && styles.boardFullWidth,
        { width: size, height: size, borderColor: boardColors.border },
      ]}
    >
      {ranks.map(rank => (
        <View key={rank} style={styles.row}>
          {files.map((file, fi) => {
            const square = `${file}${rank}` as Square;
            const light = (fi + rank) % 2 === 0;
            const piece = chess.get(square);
            const isSel = selected === square;
            const isLegal = legalTargets.has(square);
            const isHintFrom = hintFrom === square;
            const isHintTo = hintTo === square;
            const isLastMove = lastMove?.from === square || lastMove?.to === square;
            const isError = errorSquares.has(square);

            let bg: string = light ? boardColors.light : boardColors.dark;
            if (!isError && isHintFrom) bg = boardColors.hintFrom;
            else if (!isError && isHintTo) bg = boardColors.hintTo;

            const showError = isError;
            const showSelected = !showError && isSel && !activeMove;
            const showHintFrom = !showError && !showSelected && isHintFrom && !activeMove;
            const showHintTo = !showError && !showSelected && isHintTo && !activeMove;
            const showLastMove = !showError && !showSelected && !showHintFrom && !showHintTo && isLastMove && !activeMove;
            const showFileLabel = showCoordinates && rank === bottomRank;
            const showRankLabel = showCoordinates && file === leftFile;
            const coordColor = light ? 'rgba(40, 40, 40, 0.55)' : 'rgba(255, 255, 255, 0.72)';

            return (
              <Pressable
                key={square}
                onPress={() => onSquare(square)}
                style={[
                  styles.square,
                  { width: sq, height: sq, backgroundColor: bg, overflow: 'visible' },
                ]}
              >
                {showHintFrom ? (
                  <SquareGlow
                    color={boardColors.hintFromBorder}
                    opacity={1}
                    squareBg={bg}
                    glowRadius={8}
                    width={3}
                  />
                ) : null}
                {showHintTo ? (
                  <SquareGlow
                    color={boardColors.hintToBorder}
                    opacity={1}
                    squareBg={bg}
                    glowRadius={8}
                    width={3}
                  />
                ) : null}
                {showLastMove ? (
                  <SquareGlow
                    color={boardColors.lastMoveBorder}
                    opacity={0.85}
                    squareBg={bg}
                    glowRadius={6}
                  />
                ) : null}
                {showSelected ? (
                  <SquareGlow
                    color={boardColors.selectedBorder}
                    opacity={selectPulse}
                    squareBg={bg}
                    glowRadius={10}
                  />
                ) : null}
                {showError ? (
                  <SquareGlow
                    color={boardColors.errorBorder}
                    opacity={errorPulse}
                    squareBg={bg}
                    glowRadius={10}
                  />
                ) : null}
                {isLegal && !piece ? <View style={styles.dot} /> : null}
                {isLegal && piece ? <View style={styles.captureRing} /> : null}
                {piece && !hidePieceOn(square) ? (
                  <View
                    pointerEvents="none"
                    style={[styles.piece, { width: pieceSize, height: pieceSize }]}
                  >
                    <PieceComponent {...pieceCode(piece.type, piece.color)} />
                  </View>
                ) : null}
                {showFileLabel ? (
                  <Text
                    pointerEvents="none"
                    style={[
                      styles.coord,
                      styles.coordFile,
                      { color: coordColor, fontSize: coordSize },
                    ]}
                  >
                    {file}
                  </Text>
                ) : null}
                {showRankLabel ? (
                  <Text
                    pointerEvents="none"
                    style={[
                      styles.coord,
                      styles.coordRank,
                      { color: coordColor, fontSize: coordSize },
                    ]}
                  >
                    {rank}
                  </Text>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}

      <ArcadePieceLayer ref={arcadeRef} width={size} height={size} pieceSize={pieceSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    borderRadius: 4,
    overflow: 'visible',
    borderWidth: 3,
    alignSelf: 'center',
    position: 'relative',
  },
  boardFullWidth: {
    borderRadius: 0,
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  piece: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  captureRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 3,
    borderColor: 'rgba(0,0,0,0.15)',
    borderRadius: 999,
    margin: 4,
  },
  coord: {
    position: 'absolute',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  coordFile: {
    left: 3,
    bottom: 1,
  },
  coordRank: {
    left: 3,
    top: 1,
  },
});
