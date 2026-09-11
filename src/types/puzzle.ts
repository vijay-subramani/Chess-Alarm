export type PuzzleDifficulty = 'beginner' | 'club' | 'master';

export type Puzzle = {
  id: string;
  fen: string;
  mateIn: 1 | 2 | 3;
  difficulty: PuzzleDifficulty;
  goal: string;
  /** Player (side-to-move) moves only, in order */
  solutionUci: string[];
  /** Opponent replies after each player move except the last */
  replyUci?: string[];
  hintPieceSquare: string;
  hintTargetSquare: string;
  hintText: string;
  /** Lichess puzzle rating when sourced from API */
  rating?: number;
};

export type CachedPuzzlePack = {
  fetchedAt: string;
  source: 'lichess' | 'fallback';
  puzzles: Puzzle[];
  /** Set when the fixed download plan finishes (or max count is reached). */
  fullSyncComplete?: boolean;
  /** Lichess fetch steps already merged into this pack (for resume after app restart). */
  completedStepKeys?: string[];
};
