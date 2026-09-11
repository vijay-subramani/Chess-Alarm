import { Chess } from 'chess.js';

export type BoardMove = {
  from: string;
  to: string;
  promotion?: string;
};

/** Find the single legal move that transforms `before` into `after`. */
export function findMoveBetweenFens(before: string, after: string): BoardMove | null {
  if (before === after) return null;

  try {
    const game = new Chess(before);
    for (const move of game.moves({ verbose: true })) {
      const trial = new Chess(before);
      trial.move(move);
      if (trial.fen() === after) {
        return { from: move.from, to: move.to, promotion: move.promotion };
      }
    }
  } catch {
    return null;
  }

  return null;
}

export function squarePosition(
  square: string,
  orientation: 'white' | 'black',
  sqSize: number,
): { left: number; top: number } {
  const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
  const rank = Number.parseInt(square[1], 10);

  let col: number;
  let row: number;
  if (orientation === 'white') {
    col = file;
    row = 8 - rank;
  } else {
    col = 7 - file;
    row = rank - 1;
  }

  return { left: col * sqSize, top: row * sqSize };
}
