import type { Puzzle } from '@/types/puzzle';

/** Bundled seed puzzles used on first launch or when offline with no cache. */
export const fallbackPuzzlePack: Puzzle[] = [
  {
    id: 'fallback-m1-backrank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    mateIn: 1,
    difficulty: 'beginner',
    goal: 'White to move — Mate in 1',
    solutionUci: ['e1e8'],
    hintPieceSquare: 'e1',
    hintTargetSquare: 'e8',
    hintText: 'Back-rank mate with the rook.',
  },
  {
    id: 'fallback-m1-corridor',
    fen: '7k/5Rpp/8/8/8/8/8/6K1 w - - 0 1',
    mateIn: 1,
    difficulty: 'beginner',
    goal: 'White to move — Mate in 1',
    solutionUci: ['f7f8'],
    hintPieceSquare: 'f7',
    hintTargetSquare: 'f8',
    hintText: 'The g- and h-pawns trap the king — deliver on f8.',
  },
  {
    id: 'fallback-m2-rook-lift',
    fen: '6k1/8/8/8/8/8/1R4R1/5K2 w - - 0 1',
    mateIn: 2,
    difficulty: 'club',
    goal: 'White to move — Mate in 2',
    solutionUci: ['g2g3', 'b2h2'],
    replyUci: ['g8h8'],
    hintPieceSquare: 'g2',
    hintTargetSquare: 'g3',
    hintText: 'Lift the g-rook, then slide the b-rook to h2.',
  },
];
