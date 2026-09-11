import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { PieceComponent, PieceType } from '@/components/board/ChessPieces';
import type { AppColors } from '@/theme/tokens';
import { fonts } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';

type Props = {
  visible: boolean;
  blockKey: number;
  piece: PieceType;
  message: string;
};

export function BlockerOverlay({ visible, blockKey, piece, message }: Props) {
  const styles = useThemedStyles(createStyles);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-8)).current;

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    translateY.setValue(-8);
    const anim = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, friction: 8, tension: 120 }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [visible, blockKey, opacity, translateY]);

  if (!visible) return null;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View style={{ alignItems: 'center', opacity, transform: [{ translateY }] }}>
        <View style={styles.piece}>
          <PieceComponent type={piece} white />
        </View>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{message}</Text>
        </View>
      </Animated.View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    wrap: {
      width: '100%',
      alignItems: 'center',
      marginTop: 10,
      zIndex: 20,
    },
    bubble: {
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      marginTop: 4,
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    bubbleText: {
      color: colors.ink,
      fontFamily: fonts.uiSemi,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'center',
    },
    piece: {
      width: 36,
      height: 36,
    },
  });
}

export function useButtonShake() {
  const shake = useRef(new Animated.Value(0)).current;

  const run = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 45, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 45, useNativeDriver: true }),
    ]).start();
  };

  const translateX = shake.interpolate({
    inputRange: [-1, 1],
    outputRange: [-4, 4],
  });

  return { translateX, run };
}
