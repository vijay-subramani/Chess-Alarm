import { Chess } from 'chess.js';
import type { CachedPuzzlePack, Puzzle, PuzzleDifficulty } from '@/types/puzzle';

type LichessBatchResponse = {
  puzzles: LichessPuzzleItem[];
};

type LichessPuzzleItem = {
  game: { pgn: string };
  puzzle: {
    id: string;
    rating: number;
    solution: string[];
    themes: string[];
    initialPly: number;
    fen?: string;
  };
};

type LichessDifficulty = 'easiest' | 'easier' | 'normal' | 'harder' | 'hardest';

const LICHESS_BASE = 'https://lichess.org/api/puzzle/batch';
const MATE_THEMES = ['mateIn1', 'mateIn2', 'mateIn3'] as const;
const MAX_BATCH_SIZE = 50;
const REQUEST_TIMEOUT_MS = 15_000;

/**
 * Lichess asks for one request at a time and gives no rate-limit headers to pace against.
 * Measured against the live API, four rapid requests are enough to earn a 429 that outlasts
 * six minutes, so batches are serialised and spaced instead of run concurrently.
 */
const MIN_REQUEST_GAP_MS = 3_000;

/**
 * Retrying a 429 keeps the penalty alive — polling every 20s stayed blocked for the whole
 * six-minute observation. So a 429 parks every request until the cooldown expires.
 */
export const RATE_LIMIT_COOLDOWN_MS = 90_000;

export class PuzzleRateLimitError extends Error {
  readonly retryAfterMs: number;

  constructor(retryAfterMs: number) {
    super('Lichess is rate limiting puzzle downloads');
    this.name = 'PuzzleRateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

export type FetchStep = {
  theme: string;
  difficulty: LichessDifficulty;
  /** Set when a top-up borrows another tier — 'harder' alone is ambiguous between club and master. */
  appDifficulty?: AppDifficulty;
};

export const MIN_PLAYABLE_PUZZLES = 6;

/** Target puzzles per (mate-in × app difficulty) bucket. */
export const TARGET_PER_BUCKET = 20;

/** Hard cap — sync stops once this many puzzles are saved. */
export const MAX_PUZZLE_COUNT = TARGET_PER_BUCKET * 3 * 3;

export const APP_DIFFICULTIES = ['beginner', 'club', 'master'] as const;

export type AppDifficulty = (typeof APP_DIFFICULTIES)[number];

export const APP_DIFFICULTY_LABELS: Record<AppDifficulty, string> = {
  beginner: 'Easy',
  club: 'Medium',
  master: 'Hard',
};

const LICHESS_DIFFS_BY_APP: Record<PuzzleDifficulty, LichessDifficulty[]> = {
  beginner: ['easiest', 'easier'],
  club: ['normal', 'harder'],
  master: ['harder', 'hardest'],
};

/**
 * One Lichess difficulty per app difficulty. A batch returns up to 50 puzzles and a bucket only
 * holds 20, so a single request fills a bucket — fetching every difficulty tier meant 15
 * requests for 9 buckets, which is what pushed the sync past the rate limit.
 */
const PRIMARY_LICHESS_DIFF: Record<PuzzleDifficulty, LichessDifficulty> = {
  beginner: 'easiest',
  club: 'normal',
  master: 'hardest',
};

export function ratingToDifficulty(rating: number): PuzzleDifficulty {
  if (rating < 1400) return 'beginner';
  if (rating < 1900) return 'club';
  return 'master';
}

export function mateInFromThemes(themes: string[]): 1 | 2 | 3 | null {
  if (themes.includes('mateIn1')) return 1;
  if (themes.includes('mateIn2')) return 2;
  if (themes.includes('mateIn3')) return 3;
  return null;
}

function bucketKey(mateIn: number, difficulty: PuzzleDifficulty): string {
  return `${mateIn}:${difficulty}`;
}

export function bucketCounts(puzzles: Puzzle[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const puzzle of puzzles) {
    const key = bucketKey(puzzle.mateIn, puzzle.difficulty);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

export function isPackUndersized(puzzles: Puzzle[]): boolean {
  if (puzzles.length < MIN_PLAYABLE_PUZZLES) return true;
  for (const mateIn of [1, 2, 3] as const) {
    for (const difficulty of APP_DIFFICULTIES) {
      const count = puzzles.filter(p => p.mateIn === mateIn && p.difficulty === difficulty).length;
      if (count < Math.floor(TARGET_PER_BUCKET * 0.5)) return true;
    }
  }
  return false;
}

export function countByAppDifficulty(puzzles: Puzzle[]): Record<AppDifficulty, number> {
  return APP_DIFFICULTIES.reduce<Record<AppDifficulty, number>>((acc, difficulty) => {
    acc[difficulty] = puzzles.filter(p => p.difficulty === difficulty).length;
    return acc;
  }, { beginner: 0, club: 0, master: 0 });
}

export function targetCountForAppDifficulty(): number {
  return TARGET_PER_BUCKET * 3;
}

export function fetchStepAppDifficulty(step: FetchStep): AppDifficulty {
  if (step.appDifficulty) return step.appDifficulty;
  if (step.difficulty === 'easiest' || step.difficulty === 'easier') return 'beginner';
  if (step.difficulty === 'normal' || step.difficulty === 'harder') return 'club';
  return 'master';
}

export function groupStepsByAppDifficulty(steps: FetchStep[]): Record<AppDifficulty, FetchStep[]> {
  return APP_DIFFICULTIES.reduce<Record<AppDifficulty, FetchStep[]>>(
    (acc, difficulty) => {
      acc[difficulty] = steps.filter(step => fetchStepAppDifficulty(step) === difficulty);
      return acc;
    },
    { beginner: [], club: [], master: [] },
  );
}

function fenAtPly(pgn: string, ply: number, explicitFen?: string): string | null {
  if (explicitFen) return explicitFen;
  try {
    const loaded = new Chess();
    loaded.loadPgn(pgn);
    const moves = loaded.history({ verbose: true });
    if (moves.length === 0) return null;
    /**
     * Lichess `initialPly` is the index of the last move played, so the puzzle position is the
     * board *after* that move — reading it one move earlier made every solution line fail
     * validation. `after` is already recorded per move, so replaying the game is wasted work.
     */
    const index = Math.min(ply, moves.length - 1);
    return moves[index].after;
  } catch {
    return null;
  }
}

function sideLabel(fen: string) {
  return fen.includes(' w ') ? 'White' : 'Black';
}

function validateSolutionLine(fen: string, solutionUci: string[]): boolean {
  try {
    const board = new Chess(fen);
    for (const uci of solutionUci) {
      const move = board.move({
        from: uci.slice(0, 2),
        to: uci.slice(2, 4),
        promotion: uci.length > 4 ? uci[4] : undefined,
      });
      if (!move) return false;
    }
    return board.isCheckmate();
  } catch {
    return false;
  }
}

export function lichessItemToPuzzle(item: LichessPuzzleItem): Puzzle | null {
  const { game, puzzle } = item;
  const mateIn = mateInFromThemes(puzzle.themes);
  if (!mateIn) return null;

  const fen = fenAtPly(game.pgn, puzzle.initialPly, puzzle.fen);
  if (!fen) return null;

  const solutionUci: string[] = [];
  const replyUci: string[] = [];
  puzzle.solution.forEach((uci, index) => {
    if (index % 2 === 0) solutionUci.push(uci);
    else replyUci.push(uci);
  });

  if (solutionUci.length === 0) return null;
  if (!validateSolutionLine(fen, puzzle.solution)) return null;

  const firstPlayerMove = solutionUci[0];
  const difficulty = ratingToDifficulty(puzzle.rating);

  return {
    id: `lichess-${puzzle.id}`,
    fen,
    mateIn,
    difficulty,
    goal: `${sideLabel(fen)} to move — Mate in ${mateIn}`,
    solutionUci,
    replyUci: replyUci.length ? replyUci : undefined,
    hintPieceSquare: firstPlayerMove.slice(0, 2),
    hintTargetSquare: firstPlayerMove.slice(2, 4),
    hintText: `Find the mate in ${mateIn}.`,
    rating: puzzle.rating,
  };
}

function buildFetchPlan(): FetchStep[] {
  const plan: FetchStep[] = [];
  for (const appDifficulty of APP_DIFFICULTIES) {
    for (const theme of MATE_THEMES) {
      plan.push({ theme, difficulty: PRIMARY_LICHESS_DIFF[appDifficulty] });
    }
  }
  return plan;
}

export const FULL_SYNC_FETCH_PLAN: FetchStep[] = buildFetchPlan();

export const TOTAL_SYNC_STEPS = FULL_SYNC_FETCH_PLAN.length;

export function stepKey(step: FetchStep): string {
  // Plan steps carry no appDifficulty, so their keys stay stable across app versions.
  const suffix = step.appDifficulty ? `:${step.appDifficulty}` : '';
  return `${step.theme}:${step.difficulty}${suffix}`;
}

export function buildInitialFetchPlan(): FetchStep[] {
  return [...FULL_SYNC_FETCH_PLAN];
}

export function buildDeficientFetchPlan(puzzles: Puzzle[]): FetchStep[] {
  return deficientBuckets(
    new Map(puzzles.map(puzzle => [puzzle.id, puzzle])),
  );
}

export function mergePuzzlesIntoPack(existing: Puzzle[], incoming: Puzzle[]): Puzzle[] {
  const byId = new Map(existing.map(puzzle => [puzzle.id, puzzle]));
  for (const puzzle of incoming) {
    byId.set(puzzle.id, puzzle);
  }
  return [...byId.values()];
}

/** Merge new puzzles while respecting per-bucket and per-difficulty caps. */
export function mergeWithBucketCaps(existing: Puzzle[], incoming: Puzzle[]): Puzzle[] {
  const byId = new Map(existing.map(puzzle => [puzzle.id, puzzle]));
  const mateDiffCounts = bucketCounts([...byId.values()]);
  const appCounts = countByAppDifficulty([...byId.values()]);
  const appTarget = targetCountForAppDifficulty();

  for (const puzzle of incoming) {
    if (byId.has(puzzle.id)) continue;
    if (byId.size >= MAX_PUZZLE_COUNT) break;

    const mateKey = bucketKey(puzzle.mateIn, puzzle.difficulty);
    if ((mateDiffCounts[mateKey] ?? 0) >= TARGET_PER_BUCKET) continue;

    const appTotal = appCounts[puzzle.difficulty] ?? 0;
    if (appTotal >= appTarget) continue;

    byId.set(puzzle.id, puzzle);
    mateDiffCounts[mateKey] = (mateDiffCounts[mateKey] ?? 0) + 1;
    appCounts[puzzle.difficulty] = appTotal + 1;
  }

  return [...byId.values()];
}

export function applyStepDifficulty(puzzles: Puzzle[], step: FetchStep): Puzzle[] {
  const difficulty = fetchStepAppDifficulty(step);
  return puzzles.map(puzzle => ({ ...puzzle, difficulty }));
}

export function stepLabel(step: FetchStep): string {
  const mate = step.theme.replace('mateIn', 'Mate in ');
  return `${mate} · ${step.difficulty}`;
}

export async function fetchPuzzleStep(step: FetchStep, nb = MAX_BATCH_SIZE): Promise<Puzzle[]> {
  const puzzles = await fetchThemeBatch(step.theme, step.difficulty, nb);
  return applyStepDifficulty(puzzles, step);
}

/**
 * Parsing a PGN is milliseconds of pure CPU on Hermes, and it runs on the same thread that
 * draws the UI. Handing control back every few puzzles keeps the app responsive — otherwise a
 * full sync freezes the screen long enough to look like nothing has started.
 */
const PARSE_YIELD_EVERY = 4;

function yieldToEventLoop(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let rateLimitedUntil = 0;
let requestChain: Promise<void> = Promise.resolve();
let lastRequestAt = 0;

/** Remaining cooldown after a 429, so callers can show a countdown instead of a bare failure. */
export function puzzleRateLimitWaitMs(now = Date.now()): number {
  return Math.max(0, rateLimitedUntil - now);
}

/**
 * Serialises every outbound request and spaces them out. Queuing through one chain means even
 * an accidental concurrent caller cannot put two requests on the wire at once.
 */
function acquireRequestSlot(): Promise<void> {
  const run = requestChain.then(async () => {
    const wait = lastRequestAt + MIN_REQUEST_GAP_MS - Date.now();
    if (wait > 0) await delay(wait);
    lastRequestAt = Date.now();
  });
  requestChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export function resetPuzzleRateLimitForTests() {
  rateLimitedUntil = 0;
  lastRequestAt = 0;
  requestChain = Promise.resolve();
}

async function fetchJsonWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchThemeBatch(
  theme: string,
  difficulty: LichessDifficulty,
  nb = MAX_BATCH_SIZE,
): Promise<Puzzle[]> {
  const parked = puzzleRateLimitWaitMs();
  if (parked > 0) throw new PuzzleRateLimitError(parked);

  const url = `${LICHESS_BASE}/${theme}?nb=${nb}&difficulty=${difficulty}`;
  await acquireRequestSlot();
  const response = await fetchJsonWithTimeout(url, REQUEST_TIMEOUT_MS);
  if (response.status === 429) {
    rateLimitedUntil = Date.now() + RATE_LIMIT_COOLDOWN_MS;
    throw new PuzzleRateLimitError(RATE_LIMIT_COOLDOWN_MS);
  }
  if (!response.ok) {
    throw new Error(`Lichess ${theme}/${difficulty} fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as LichessBatchResponse;
  /**
   * The batch payload carries the game PGN, so the position is derived locally. Fetching each
   * puzzle individually to get a FEN meant one request per puzzle — hundreds per sync — which
   * Lichess rate-limits, and every rate-limited puzzle was silently dropped.
   */
  const puzzles: Puzzle[] = [];
  const items = data.puzzles ?? [];
  for (let i = 0; i < items.length; i++) {
    const next = lichessItemToPuzzle(items[i]);
    if (next) puzzles.push(next);
    if (i % PARSE_YIELD_EVERY === PARSE_YIELD_EVERY - 1) {
      await yieldToEventLoop();
    }
  }
  return puzzles;
}

function deficientBuckets(byId: Map<string, Puzzle>): FetchStep[] {
  const puzzles = [...byId.values()];
  const deficient: FetchStep[] = [];

  for (const mateIn of [1, 2, 3] as const) {
    const theme = `mateIn${mateIn}`;
    for (const appDifficulty of APP_DIFFICULTIES) {
      const count = puzzles.filter(p => p.mateIn === mateIn && p.difficulty === appDifficulty).length;
      if (count >= TARGET_PER_BUCKET) continue;

      /**
       * The primary tier already ran, so a top-up borrows the other tier for that difficulty and
       * pins the bucket explicitly — 'harder' would otherwise be filed under club for both.
       */
      const fallback = LICHESS_DIFFS_BY_APP[appDifficulty].find(
        difficulty => difficulty !== PRIMARY_LICHESS_DIFF[appDifficulty],
      );
      if (fallback) deficient.push({ theme, difficulty: fallback, appDifficulty });
    }
  }

  return deficient;
}

export function buildCachedPack(puzzles: Puzzle[], source: CachedPuzzlePack['source']): CachedPuzzlePack {
  return {
    fetchedAt: new Date().toISOString(),
    source,
    puzzles,
  };
}
