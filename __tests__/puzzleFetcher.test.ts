import {
  applyStepDifficulty,
  fetchPuzzleStep,
  fetchStepAppDifficulty,
  FULL_SYNC_FETCH_PLAN,
  groupStepsByAppDifficulty,
  isPackUndersized,
  mergePuzzlesIntoPack,
  mergeWithBucketCaps,
  PuzzleRateLimitError,
  puzzleRateLimitWaitMs,
  resetPuzzleRateLimitForTests,
  stepKey,
  TARGET_PER_BUCKET,
  TOTAL_SYNC_STEPS,
} from '@/services/puzzleFetcher';
import type { Puzzle } from '@/types/puzzle';

function makePuzzle(id: string, mateIn: 1 | 2 | 3, difficulty: Puzzle['difficulty']): Puzzle {
  return {
    id,
    fen: '4k3/8/8/8/8/8/8/4K2R w - - 0 1',
    mateIn,
    difficulty,
    goal: 'White to move',
    solutionUci: ['h1h8'],
    hintPieceSquare: 'h1',
    hintTargetSquare: 'h8',
    hintText: 'Mate.',
  };
}

describe('mergePuzzlesIntoPack', () => {
  it('should merge new puzzles and replace duplicates by id', () => {
    const merged = mergePuzzlesIntoPack(
      [makePuzzle('a', 1, 'beginner')],
      [makePuzzle('b', 1, 'beginner'), makePuzzle('a', 2, 'club')],
    );

    expect(merged).toHaveLength(2);
    expect(merged.find(p => p.id === 'a')?.mateIn).toEqual(2);
    expect(merged.find(p => p.id === 'b')).toBeTruthy();
  });
});

describe('mergeWithBucketCaps', () => {
  it('should cap puzzles per mate-in and difficulty bucket', () => {
    const existing = Array.from({ length: TARGET_PER_BUCKET }, (_, i) =>
      makePuzzle(`existing-${i}`, 1, 'beginner'),
    );
    const incoming = Array.from({ length: 10 }, (_, i) =>
      makePuzzle(`new-${i}`, 1, 'beginner'),
    );

    const merged = mergeWithBucketCaps(existing, incoming);

    expect(merged).toHaveLength(TARGET_PER_BUCKET);
  });

  it('should cap total puzzles per app difficulty', () => {
    const existing: Puzzle[] = [];
    for (const mateIn of [1, 2, 3] as const) {
      for (let i = 0; i < TARGET_PER_BUCKET; i++) {
        existing.push(makePuzzle(`club-${mateIn}-${i}`, mateIn, 'club'));
      }
    }

    const merged = mergeWithBucketCaps(existing, [makePuzzle('extra', 1, 'club')]);

    expect(merged).toHaveLength(TARGET_PER_BUCKET * 3);
  });
});

describe('applyStepDifficulty', () => {
  it('should tag puzzles with the fetch step difficulty instead of rating', () => {
    const puzzles = applyStepDifficulty([makePuzzle('a', 2, 'beginner')], {
      theme: 'mateIn2',
      difficulty: 'hardest',
    });

    expect(puzzles[0]?.difficulty).toEqual(fetchStepAppDifficulty({ theme: 'mateIn2', difficulty: 'hardest' }));
  });
});

describe('FULL_SYNC_FETCH_PLAN', () => {
  it('should request one batch per mate-in and difficulty bucket', () => {
    expect(TOTAL_SYNC_STEPS).toEqual(9);
  });

  it('should never request the same batch twice', () => {
    const keys = FULL_SYNC_FETCH_PLAN.map(stepKey);

    expect(new Set(keys).size).toEqual(keys.length);
  });

  it('should cover every app difficulty evenly', () => {
    const grouped = groupStepsByAppDifficulty(FULL_SYNC_FETCH_PLAN);

    expect(grouped.beginner).toHaveLength(3);
    expect(grouped.club).toHaveLength(3);
    expect(grouped.master).toHaveLength(3);
  });
});

describe('fetchPuzzleStep', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    resetPuzzleRateLimitForTests();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('should raise a rate limit error when Lichess replies 429', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: false, status: 429 }) as unknown as typeof fetch;

    await expect(fetchPuzzleStep({ theme: 'mateIn1', difficulty: 'normal' })).rejects.toThrow(
      PuzzleRateLimitError,
    );
  });

  it('should park later requests for the cooldown instead of retrying immediately', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: false, status: 429 });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    await expect(fetchPuzzleStep({ theme: 'mateIn1', difficulty: 'normal' })).rejects.toThrow();
    await expect(fetchPuzzleStep({ theme: 'mateIn2', difficulty: 'normal' })).rejects.toThrow(
      PuzzleRateLimitError,
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(puzzleRateLimitWaitMs()).toBeGreaterThan(0);
  });
});

describe('isPackUndersized', () => {
  it('should flag small packs as undersized', () => {
    expect(isPackUndersized([makePuzzle('a', 1, 'beginner')])).toEqual(true);
  });

  it('should accept a pack with enough puzzles per bucket', () => {
    const puzzles: Puzzle[] = [];
    for (const mateIn of [1, 2, 3] as const) {
      for (const difficulty of ['beginner', 'club', 'master'] as const) {
        for (let i = 0; i < TARGET_PER_BUCKET; i++) {
          puzzles.push(makePuzzle(`${mateIn}-${difficulty}-${i}`, mateIn, difficulty));
        }
      }
    }

    expect(isPackUndersized(puzzles)).toEqual(false);
  });
});
