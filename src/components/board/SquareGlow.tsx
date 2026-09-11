import { Animated, Platform, StyleSheet } from 'react-native';
import { boardColors } from '@/theme/tokens';

type Props = {
  opacity?: Animated.Value | Animated.AnimatedInterpolation<number> | number;
  color?: string;
  width?: number;
  squareBg?: string;
  glowRadius?: number;
};

export function SquareGlow({
  opacity = 1,
  color = boardColors.arcade,
  width = 2,
  squareBg = 'transparent',
  glowRadius = 8,
}: Props) {
  const opacityStyle = typeof opacity === 'number' ? { opacity } : { opacity };
  const glow = {
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.95,
    shadowRadius: glowRadius,
    elevation: glowRadius,
    backgroundColor: squareBg,
  };

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outlineOuter,
          glow,
          { borderColor: color, borderWidth: width },
          opacityStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          styles.outlineEdge,
          { borderColor: color, borderWidth: width, backgroundColor: squareBg },
          opacityStyle,
        ]}
      />
    </>
  );
}

/** Halo behind a moving piece during arcade animation. */
export function PieceGlow({
  opacity,
  scale,
  color = boardColors.arcadeBright,
}: {
  opacity: Animated.AnimatedInterpolation<number> | Animated.Value;
  scale: Animated.AnimatedInterpolation<number> | Animated.Value;
  color?: string;
}) {
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pieceGlow,
        {
          borderColor: color,
          backgroundColor: boardColors.arcadeSoft,
          opacity,
          transform: [{ scale }],
          shadowColor: color,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: Platform.OS === 'android' ? 10 : 14,
          elevation: 10,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  /** Sits on the square edge — no inset so the border traces the cell outline. */
  outlineEdge: {
    ...StyleSheet.absoluteFill,
  },
  /** Slightly larger halo so glow reads outside the cell. */
  outlineOuter: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
  },
  pieceGlow: {
    position: 'absolute',
    width: '108%',
    height: '108%',
    borderRadius: 999,
    borderWidth: 2,
  },
});
