import type { Difficulty, MateIn } from '@/types/alarm';
import type { Puzzle, PuzzleDifficulty } from '@/types/puzzle';

const DIFFICULTY_MAP: Record<Difficulty, PuzzleDifficulty> = {
  easy: 'beginner',
  medium: 'club',
  hard: 'master',
};

export function selectPuzzle(
  pack: Puzzle[],
  filters: { difficulty: Difficulty; mateIn: MateIn },
  seenIds: string[] = [],
): Puzzle {
  const puzzleDifficulty = DIFFICULTY_MAP[filters.difficulty];
  const pool = pack.filter(
    p => p.difficulty === puzzleDifficulty && p.mateIn === filters.mateIn,
  );
  const unused = pool.filter(p => !seenIds.includes(p.id));
  let list = unused.length ? unused : pool;

  if (!list.length) {
    list = pack.filter(p => p.mateIn === filters.mateIn);
  }
  if (!list.length) {
    list = pack;
  }

  return list[Math.floor(Math.random() * list.length)];
}
