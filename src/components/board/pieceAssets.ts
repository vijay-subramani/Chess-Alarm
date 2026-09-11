import type { ImageSourcePropType } from 'react-native';

export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type PieceVisual = { type: PieceType; white: boolean };

export const PIECE_IMAGES: Record<string, ImageSourcePropType> = {
  wp: require('../../../assets/chess-pieces/neo/wp.png'),
  wn: require('../../../assets/chess-pieces/neo/wn.png'),
  wb: require('../../../assets/chess-pieces/neo/wb.png'),
  wr: require('../../../assets/chess-pieces/neo/wr.png'),
  wq: require('../../../assets/chess-pieces/neo/wq.png'),
  wk: require('../../../assets/chess-pieces/neo/wk.png'),
  bp: require('../../../assets/chess-pieces/neo/bp.png'),
  bn: require('../../../assets/chess-pieces/neo/bn.png'),
  bb: require('../../../assets/chess-pieces/neo/bb.png'),
  br: require('../../../assets/chess-pieces/neo/br.png'),
  bq: require('../../../assets/chess-pieces/neo/bq.png'),
  bk: require('../../../assets/chess-pieces/neo/bk.png'),
};

export function pieceImageSource(piece: PieceVisual): ImageSourcePropType {
  const color = piece.white ? 'w' : 'b';
  return PIECE_IMAGES[`${color}${piece.type.toLowerCase()}`];
}
