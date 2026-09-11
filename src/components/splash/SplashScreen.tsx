import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppIcon } from '@/components/AppIcon';
import { AlarmClockArt } from '@/components/splash/SplashArt';
import { PieceComponent } from '@/components/board/ChessPieces';
import { fonts, getSplashPalette, navTypography } from '@/theme/tokens';
import { useTheme } from '@/theme/ThemeContext';

type Stage = 'ringing' | 'incoming' | 'impact' | 'reveal' | 'done';

type Props = {
  onDone: () => void;
  /** Keep the reveal frame visible while bootstrap finishes. */
  waiting?: boolean;
};

const SPLASH = {
  clock: 120,
  knight: 82,
  icon: 100,
  wave: 148,
  impact: 170,
} as const;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

export function SplashScreen({ onDone, waiting = false }: Props) {
  const { colors, colorScheme } = useTheme();
  const dark = colorScheme === 'dark';
  const insets = useSafeAreaInsets();
  const palette = useMemo(() => getSplashPalette(colors), [colors]);

  const [stage, setStage] = useState<Stage>('ringing');

  const ringing = stage === 'ringing' || stage === 'incoming';
  const incoming = stage === 'incoming';
  const impact = stage === 'impact';
  const reveal = stage === 'reveal' || stage === 'done';

  useEffect(() => {
    const t1 = setTimeout(() => setStage('incoming'), 1800);
    const t2 = setTimeout(() => setStage('impact'), 2650);
    const t3 = setTimeout(() => setStage('reveal'), 3200);
    const t4 = setTimeout(() => {
      setStage('done');
      onDone();
    }, 5000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onDone]);

  const bgOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const clockScale = useSharedValue(0.3);
  const clockOpacity = useSharedValue(0);
  const clockRotation = useSharedValue(0);
  const clockExitScale = useSharedValue(1);
  const clockExitOpacity = useSharedValue(1);
  const knightX = useSharedValue(260);
  const knightY = useSharedValue(40);
  const knightExitScale = useSharedValue(1);
  const knightExitOpacity = useSharedValue(1);
  const impactScale = useSharedValue(0.4);
  const impactOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const iconOpacity = useSharedValue(0);
  const titleY = useSharedValue(20);
  const titleOpacity = useSharedValue(0);
  const tagOpacity = useSharedValue(0);

  useEffect(() => {
    bgOpacity.value = withTiming(1, { duration: 400 });
  }, [bgOpacity]);

  useEffect(() => {
    if (ringing || impact) {
      glowOpacity.value = withTiming(1, { duration: 600 });
    } else {
      glowOpacity.value = withTiming(0, { duration: 600 });
    }
  }, [ringing, impact, glowOpacity]);

  useEffect(() => {
    if (stage === 'ringing') {
      clockOpacity.value = withTiming(1, { duration: 650 });
      clockScale.value = withSequence(
        withTiming(1.12, { duration: 455, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 195 }),
      );
    }
  }, [stage, clockOpacity, clockScale]);

  useEffect(() => {
    if (stage === 'ringing' || stage === 'incoming') {
      clockRotation.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 90 }),
          withTiming(14, { duration: 90 }),
          withTiming(-9, { duration: 90 }),
          withTiming(9, { duration: 90 }),
          withTiming(-4, { duration: 90 }),
          withTiming(0, { duration: 90 }),
        ),
        -1,
        false,
      );
      return () => cancelAnimation(clockRotation);
    }

    clockRotation.value = withTiming(0, { duration: 120 });
    return undefined;
  }, [stage, clockRotation]);

  useEffect(() => {
    if (stage === 'incoming') {
      knightX.value = withTiming(0, { duration: 750, easing: Easing.linear });
      knightY.value = withSequence(
        withTiming(-105, { duration: 300, easing: Easing.out(Easing.quad) }),
        withTiming(0, { duration: 450, easing: Easing.in(Easing.quad) }),
      );
    }
  }, [stage, knightX, knightY]);

  useEffect(() => {
    if (stage === 'impact') {
      clockExitScale.value = withTiming(0.08, { duration: 450, easing: Easing.in(Easing.ease) });
      clockExitOpacity.value = withTiming(0, { duration: 450 });
      knightExitScale.value = withDelay(
        50,
        withTiming(0.08, { duration: 450, easing: Easing.in(Easing.ease) }),
      );
      knightExitOpacity.value = withDelay(50, withTiming(0, { duration: 450 }));
      impactOpacity.value = withSequence(
        withTiming(1, { duration: 90 }),
        withTiming(0, { duration: 410 }),
      );
      impactScale.value = withSequence(
        withTiming(1.6, { duration: 90 }),
        withTiming(3.4, { duration: 410 }),
      );
    }
  }, [
    stage,
    clockExitScale,
    clockExitOpacity,
    knightExitScale,
    knightExitOpacity,
    impactOpacity,
    impactScale,
  ]);

  useEffect(() => {
    if (stage === 'reveal' || stage === 'done') {
      iconOpacity.value = withTiming(1, { duration: 750 });
      iconScale.value = withSequence(
        withTiming(1.28, { duration: 410, easing: Easing.out(Easing.cubic) }),
        withTiming(0.93, { duration: 150 }),
        withTiming(1, { duration: 190 }),
      );
      titleOpacity.value = withDelay(300, withTiming(1, { duration: 500 }));
      titleY.value = withDelay(300, withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }));
      tagOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    }
  }, [stage, iconOpacity, iconScale, titleOpacity, titleY, tagOpacity]);

  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glowOpacity.value }));
  const clockStyle = useAnimatedStyle(() => ({
    opacity: clockOpacity.value * clockExitOpacity.value,
    transform: [
      { scale: clockScale.value * clockExitScale.value },
      { rotate: `${clockRotation.value}deg` },
    ],
  }));
  const knightOuterStyle = useAnimatedStyle(() => ({
    opacity: knightExitOpacity.value,
    transform: [{ translateX: knightX.value }, { scale: knightExitScale.value }],
  }));
  const knightInnerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: knightY.value }],
  }));
  const impactStyle = useAnimatedStyle(() => ({
    opacity: impactOpacity.value,
    transform: [{ scale: impactScale.value }],
  }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [{ scale: iconScale.value }],
  }));
  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));
  const tagStyle = useAnimatedStyle(() => ({ opacity: tagOpacity.value }));

  const waveColor = palette.wave;

  const skip = () => {
    setStage('done');
    onDone();
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle={dark ? 'light-content' : 'dark-content'} />

      <Animated.View style={[StyleSheet.absoluteFill, bgStyle]}>
        <Svg width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <LinearGradient id="splashBg" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={palette.bg0} />
              <Stop offset="40%" stopColor={palette.bg1} />
              <Stop offset="100%" stopColor={palette.bg2} />
            </LinearGradient>
          </Defs>
          <Rect width={SCREEN_W} height={SCREEN_H} fill="url(#splashBg)" />
        </Svg>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.glow,
          { backgroundColor: palette.glow },
          glowStyle,
        ]}
      />

      {(ringing || impact) && (
        <View style={styles.centerStage} pointerEvents="none">
          {ringing &&
            [0, 0.42, 0.84].map(delay => (
              <SoundWave key={delay} delay={delay} color={waveColor} />
            ))}
          <Animated.View style={clockStyle}>
            <AlarmClockArt
              size={SPLASH.clock}
              faceTop={palette.clockFaceTop}
              faceBottom={palette.clockFaceBottom}
            />
          </Animated.View>
        </View>
      )}

      {(incoming || impact) && (
        <Animated.View style={[styles.knightWrap, knightOuterStyle]} pointerEvents="none">
          <Animated.View style={knightInnerStyle}>
            <View style={styles.knightShadow}>
              <PieceComponent type="N" white />
            </View>
          </Animated.View>
        </Animated.View>
      )}

      {impact && (
        <Animated.View
          pointerEvents="none"
          style={[styles.impact, { backgroundColor: palette.impact }, impactStyle]}
        />
      )}

      {reveal && (
        <View style={styles.reveal}>
          <Animated.View style={iconStyle}>
            <AppIcon size={SPLASH.icon} />
          </Animated.View>

          <Animated.View style={titleStyle}>
            <Text style={[styles.title, { color: palette.title }]}>Chess Alarm</Text>
          </Animated.View>

          <Animated.View style={tagStyle}>
            <Text style={[styles.tagline, { color: palette.tagline }]}>Wake up. Solve. Conquer.</Text>
          </Animated.View>

          <Animated.View style={[styles.dots, tagStyle]}>
            {[0, 1, 2].map(i => (
              <PulseDot key={i} delay={i * 220} color={palette.dot} />
            ))}
          </Animated.View>

          {waiting && (
            <View style={styles.waiting}>
              <ActivityIndicator color={palette.dot} />
            </View>
          )}
        </View>
      )}

      {!reveal && (
        <Pressable
          onPress={skip}
          hitSlop={12}
          style={[styles.skip, { bottom: insets.bottom + 40, borderColor: palette.skipBorder }]}
        >
          <Text style={[styles.skipText, { color: palette.skipText }]}>Skip</Text>
        </Pressable>
      )}
    </View>
  );
}

function SoundWave({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.65);

  useEffect(() => {
    scale.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(
          withTiming(3.2, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 0 }),
        ),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay * 1000,
      withRepeat(
        withSequence(withTiming(0, { duration: 1500 }), withTiming(0.65, { duration: 0 })),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[styles.wave, { borderColor: color }, style]}
    />
  );
}

function PulseDot({ delay, color }: { delay: number; color: string }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1.5, { duration: 650 }), withTiming(1, { duration: 650 })),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(withTiming(1, { duration: 650 }), withTiming(0.4, { duration: 650 })),
        -1,
        false,
      ),
    );
  }, [delay, opacity, scale]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
    backgroundColor: color,
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
  },
  glow: {
    position: 'absolute',
    width: 380,
    height: 380,
    borderRadius: 190,
    top: '50%',
    left: '50%',
    marginTop: -190,
    marginLeft: -190,
  },
  centerStage: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: SPLASH.wave,
    height: SPLASH.wave,
    borderRadius: SPLASH.wave / 2,
    borderWidth: 2.5,
  },
  knightWrap: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -SPLASH.knight / 2 + 8,
    marginLeft: -SPLASH.knight / 2 + 28,
  },
  knightShadow: {
    width: SPLASH.knight,
    height: SPLASH.knight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 12,
  },
  impact: {
    position: 'absolute',
    width: SPLASH.impact,
    height: SPLASH.impact,
    borderRadius: SPLASH.impact / 2,
    top: '50%',
    left: '50%',
    marginTop: -SPLASH.impact / 2,
    marginLeft: -SPLASH.impact / 2,
  },
  reveal: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: navTypography.brandTitle,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.ui,
    fontSize: 22,
    fontWeight: '500',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  waiting: {
    marginTop: 8,
  },
  skip: {
    position: 'absolute',
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  skipText: {
    fontFamily: fonts.ui,
    fontSize: 12,
    fontWeight: '500',
  },
});
