import { Chess } from 'chess.js';
import { seedPuzzlePack } from '@/puzzles/seedPack';
import { APP_DIFFICULTIES, TARGET_PER_BUCKET } from '@/services/puzzleFetcher';

/** Interleaves the player moves with the opponent replies back into one line. */
function fullLine(solutionUci: string[], replyUci: string[] = []): string[] {
  const line: string[] = [];
  for (let i = 0; i < solutionUci.length; i++) {
    line.push(solutionUci[i]);
    if (replyUci[i]) line.push(replyUci[i]);
  }
  return line;
}

function playLine(fen: string, line: string[]) {
  const board = new Chess(fen);
  for (const uci of line) {
    board.move({
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    });
  }
  return board;
}

describe('seedPuzzlePack', () => {
  it('should fill every mate-in and difficulty bucket to target', () => {
    for (const mateIn of [1, 2, 3] as const) {
      for (const difficulty of APP_DIFFICULTIES) {
        const bucket = seedPuzzlePack.filter(p => p.mateIn === mateIn && p.difficulty === difficulty);

        expect(bucket).toHaveLength(TARGET_PER_BUCKET);
      }
    }
  });

  it('should hold no duplicate ids', () => {
    const ids = seedPuzzlePack.map(puzzle => puzzle.id);

    expect(new Set(ids).size).toEqual(ids.length);
  });

  it('should end every solution in checkmate', () => {
    const broken = seedPuzzlePack.filter(puzzle => {
      try {
        return !playLine(puzzle.fen, fullLine(puzzle.solutionUci, puzzle.replyUci)).isCheckmate();
      } catch {
        return true;
      }
    });

    expect(broken.map(puzzle => puzzle.id)).toEqual([]);
  });

  it('should need exactly mateIn moves from the player', () => {
    const wrongLength = seedPuzzlePack.filter(
      puzzle => puzzle.solutionUci.length !== puzzle.mateIn,
    );

    expect(wrongLength.map(puzzle => puzzle.id)).toEqual([]);
  });

  it('should point each hint at the first solution move', () => {
    const mismatched = seedPuzzlePack.filter(
      puzzle =>
        puzzle.hintPieceSquare !== puzzle.solutionUci[0].slice(0, 2) ||
        puzzle.hintTargetSquare !== puzzle.solutionUci[0].slice(2, 4),
    );

    expect(mismatched.map(puzzle => puzzle.id)).toEqual([]);
  });

  it('should describe the side to move in the goal', () => {
    const wrongSide = seedPuzzlePack.filter(puzzle => {
      const turn = new Chess(puzzle.fen).turn() === 'w' ? 'White' : 'Black';
      return !puzzle.goal.startsWith(turn);
    });

    expect(wrongSide.map(puzzle => puzzle.id)).toEqual([]);
  });
});
