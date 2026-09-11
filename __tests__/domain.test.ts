import { Chess } from 'chess.js';
import { selectPuzzle } from '@/domain/puzzle';
import { advanceSolution, createSolutionState, solutionProgressIndex } from '@/domain/solution';
import { hintBannerText, hintLevelFromFailures, hintSquaresForMove } from '@/domain/hints';
import { fallbackPuzzlePack } from '@/puzzles/fallbackPack';
import {
  lichessItemToPuzzle,
  mateInFromThemes,
  ratingToDifficulty,
} from '@/services/puzzleFetcher';

describe('selectPuzzle', () => {
  it('should pick a puzzle matching difficulty and mate-in from the pack', () => {
    const puzzle = selectPuzzle(fallbackPuzzlePack, { difficulty: 'easy', mateIn: 1 });

    expect(puzzle.mateIn).toEqual(1);
    expect(puzzle.difficulty).toEqual('beginner');
  });

  it('should prefer puzzles not seen recently', () => {
    const pack = fallbackPuzzlePack.filter(p => p.mateIn === 1 && p.difficulty === 'beginner');
    const first = pack[0];
    const second = selectPuzzle(pack, { difficulty: 'easy', mateIn: 1 }, [first.id]);

    expect(second.id).not.toEqual(first.id);
  });
});

describe('advanceSolution', () => {
  it('should accept the next correct UCI move', () => {
    const state = createSolutionState();
    const { next, correct } = advanceSolution(state, ['e1e8'], 'E1E8');

    expect(correct).toEqual(true);
    expect(next).toEqual({ index: 1, solved: true });
  });
});

describe('solutionProgressIndex', () => {
  it('should advance the hint index after each correct segment of the line', () => {
    const puzzle = fallbackPuzzlePack.find(p => p.id === 'fallback-m2-rook-lift')!;

    expect(solutionProgressIndex(puzzle.fen, puzzle.solutionUci, puzzle.fen, puzzle.replyUci)).toBe(
      0,
    );

    const afterFirst = new Chess(puzzle.fen);
    afterFirst.move({ from: 'g2', to: 'g3' });
    expect(
      solutionProgressIndex(
        puzzle.fen,
        puzzle.solutionUci,
        afterFirst.fen(),
        puzzle.replyUci,
      ),
    ).toBe(1);

    const afterReply = new Chess(afterFirst.fen());
    afterReply.move({ from: 'g8', to: 'h8' });
    expect(
      solutionProgressIndex(
        puzzle.fen,
        puzzle.solutionUci,
        afterReply.fen(),
        puzzle.replyUci,
      ),
    ).toBe(1);
  });
});

describe('hintLevelFromFailures', () => {
  it('should escalate hints after the configured threshold', () => {
    expect(hintLevelFromFailures(3, 3)).toEqual('piece');
    expect(hintLevelFromFailures(5, 3)).toEqual('text');
  });
});

describe('hintSquaresForMove', () => {
  it('should return from/to squares for the move at the current index', () => {
    expect(hintSquaresForMove(['e1e8', 'a1a8'], 0)).toEqual({ from: 'e1', to: 'e8' });
    expect(hintSquaresForMove(['e1e8', 'a1a8'], 1)).toEqual({ from: 'a1', to: 'a8' });
    expect(hintSquaresForMove(['e1e8'], 1)).toBeNull();
  });
});

describe('hintBannerText', () => {
  const move = { from: 'e1', to: 'e8' };

  it('should include coordinates for piece and target hints', () => {
    expect(hintBannerText('piece', move, '')).toEqual('Move the piece on E1.');
    expect(hintBannerText('target', move, '')).toEqual('Move E1 to E8.');
  });

  it('should show puzzle text at the final hint tier', () => {
    expect(hintBannerText('text', move, 'Back-rank mate with the rook.')).toEqual(
      'Back-rank mate with the rook.',
    );
  });
});

describe('lichess transforms', () => {
  it('should map rating bands to difficulty', () => {
    expect(ratingToDifficulty(1200)).toEqual('beginner');
    expect(ratingToDifficulty(1600)).toEqual('club');
    expect(ratingToDifficulty(2100)).toEqual('master');
  });

  it('should convert a lichess puzzle with fen into app puzzle format', () => {
    const puzzle = lichessItemToPuzzle({
      game: { pgn: 'e4 e5' },
      puzzle: {
        id: 'CXEwb',
        rating: 1721,
        solution: ['b1f1'],
        themes: ['mateIn1', 'oneMove'],
        initialPly: 62,
        fen: '4rk2/p5RR/2B5/1p6/3P3p/2P3nP/P4KP1/1r6 b - - 1 1',
      },
    });

    expect(puzzle?.id).toEqual('lichess-CXEwb');
    expect(puzzle?.solutionUci).toEqual(['b1f1']);
    expect(puzzle?.mateIn).toEqual(1);
    expect(mateInFromThemes(['mateIn2'])).toEqual(2);
  });
});
