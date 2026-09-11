import { Chess } from 'chess.js';

export type SolutionState = {
  index: number;
  solved: boolean;
};

export function createSolutionState(): SolutionState {
  return { index: 0, solved: false };
}

/** Position key — ignores halfmove/fullmove counters. */
export function fenKey(fen: string): string {
  return fen.split(' ').slice(0, 4).join(' ');
}

function applyUci(game: Chess, uci: string): boolean {
  try {
    const move = game.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    });
    return move !== null;
  } catch {
    return false;
  }
}

/**
 * Index of the next player move to play, derived from how far the current
 * board position has progressed through the solution line.
 */
export function solutionProgressIndex(
  startFen: string,
  solutionUci: string[],
  currentFen: string,
  replyUci?: string[],
): number {
  const target = fenKey(currentFen);
  const game = new Chess(startFen);
  if (fenKey(game.fen()) === target) return 0;

  for (let i = 0; i < solutionUci.length; i++) {
    if (!applyUci(game, solutionUci[i])) break;

    if (fenKey(game.fen()) === target) {
      return Math.min(i + 1, solutionUci.length);
    }

    const reply = replyUci?.[i];
    if (reply) {
      if (!applyUci(game, reply)) break;
      if (fenKey(game.fen()) === target) {
        return Math.min(i + 1, solutionUci.length);
      }
    }
  }

  return 0;
}

export function solutionStateFromFen(
  startFen: string,
  solutionUci: string[],
  currentFen: string,
  replyUci?: string[],
): SolutionState {
  const index = solutionProgressIndex(startFen, solutionUci, currentFen, replyUci);
  return { index, solved: index >= solutionUci.length };
}

/** Compare a user UCI move against the next solution move (case-insensitive). */
export function advanceSolution(
  state: SolutionState,
  solutionUci: string[],
  moveUci: string,
): { next: SolutionState; correct: boolean } {
  const expected = solutionUci[state.index]?.toLowerCase();
  const got = moveUci.toLowerCase();
  if (!expected || got !== expected) {
    return { next: state, correct: false };
  }
  const index = state.index + 1;
  const solved = index >= solutionUci.length;
  return { next: { index, solved }, correct: true };
}

export function uciFromSquares(from: string, to: string, promotion?: string) {
  return `${from}${to}${promotion ?? ''}`;
}
