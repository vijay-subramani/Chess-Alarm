import { Image, StyleSheet } from 'react-native';
import { PIECE_IMAGES } from '@/components/board/pieceAssets';
import type { PieceType } from '@/components/board/pieceAssets';

export type { PieceType };

function pieceKey(type: PieceType, white: boolean): string {
  const color = white ? 'w' : 'b';
  return `${color}${type.toLowerCase()}`;
}

export function PieceComponent({ type, white }: { type: PieceType; white: boolean }) {
  const source = PIECE_IMAGES[pieceKey(type, white)];
  return <Image source={source} style={styles.piece} resizeMode="contain" />;
}

const styles = StyleSheet.create({
  piece: {
    width: '100%',
    height: '100%',
  },
});
