import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, type AppStateStatus } from 'react-native';
import { seedPuzzlePack } from '@/puzzles/seedPack';
import type { CachedPuzzlePack, Puzzle } from '@/types/puzzle';
import {
  APP_DIFFICULTIES,
  APP_DIFFICULTY_LABELS,
  FULL_SYNC_FETCH_PLAN,
  MIN_PLAYABLE_PUZZLES,
  PuzzleRateLimitError,
  TOTAL_SYNC_STEPS,
  buildCachedPack,
  countByAppDifficulty,
  fetchPuzzleStep,
  fetchStepAppDifficulty,
  groupStepsByAppDifficulty,
  mergeWithBucketCaps,
  puzzleRateLimitWaitMs,
  stepKey,
  stepLabel,
  targetCountForAppDifficulty,
  type AppDifficulty,
  type FetchStep,
} from '@/services/puzzleFetcher';

const CACHE_KEY = 'chess_alarm_puzzle_pack_v2';
const SEEN_KEY = 'chess_alarm_seen_puzzles_v1';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_SEEN = 250;
/** Lichess caps a batch at 50; asking for the maximum fills a 20-puzzle bucket in one request. */
const FULL_SYNC_BATCH_SIZE = 50;

export type PuzzleSyncPhase = 'idle' | 'syncing' | 'complete';
export type PuzzleSyncStatus = 'idle' | 'syncing' | 'done' | 'error';

export type StepSyncStatus = 'pending' | 'running' | 'done' | 'error';

export type StepSyncProgress = {
  step: FetchStep;
  status: StepSyncStatus;
  added: number;
};

export type DifficultySyncProgress = {
  key: AppDifficulty;
  label: string;
  current: number;
  target: number;
  completedSteps: number;
  totalSteps: number;
  runningSteps: number;
};

export type PuzzleSyncState = {
  status: PuzzleSyncStatus;
  phase: PuzzleSyncPhase;
  count: number;
  playable: boolean;
  stale: boolean;
  needsRefresh: boolean;
  fullSyncComplete: boolean;
  source: CachedPuzzlePack['source'] | 'none';
  fetchedAt: string | null;
  progress: number;
  completedSteps: number;
  totalSteps: number;
  pendingSteps: number;
  stepLabel: string | null;
  message: string;
  byDifficulty: Record<string, number>;
  difficultyProgress: DifficultySyncProgress[];
  stepProgress: StepSyncProgress[];
};

let memoryPack: CachedPuzzlePack | null = null;
let syncPromise: Promise<CachedPuzzlePack | null> | null = null;
const listeners = new Set<(state: PuzzleSyncState) => void>();
let mergeLock: Promise<void> = Promise.resolve();
let latestPersistSnapshot: { puzzles: Puzzle[]; stepStates: StepSyncProgress[] } | null = null;
let backgroundFlushAttached = false;

function withMergeLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = mergeLock.then(fn, fn);
  mergeLock = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function ensureBackgroundFlushListener() {
  if (backgroundFlushAttached) return;
  backgroundFlushAttached = true;
  AppState.addEventListener('change', (next: AppStateStatus) => {
    if (next !== 'background' || !latestPersistSnapshot) return;
    const { puzzles, stepStates } = latestPersistSnapshot;
    if (puzzles.length === 0) return;
    persistPartialPack(puzzles, stepStates).catch(() => undefined);
  });
}

let resumeTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Picks the download back up once the rate-limit cooldown expires, so a throttled first launch
 * still ends up with a full library without the user pressing anything.
 */
function scheduleSyncResume(waitMs: number) {
  if (resumeTimer) return;
  resumeTimer = setTimeout(() => {
    resumeTimer = null;
    if (AppState.currentState !== 'active') return;
    startPuzzleSync().catch(() => undefined);
  }, waitMs + 1_000);
}

function completedKeysFromSteps(stepStates: StepSyncProgress[]): string[] {
  return stepStates.filter(entry => entry.status === 'done').map(entry => stepKey(entry.step));
}

async function persistPartialPack(
  puzzles: Puzzle[],
  stepStates: StepSyncProgress[],
  fullSyncComplete = false,
): Promise<void> {
  if (puzzles.length === 0) return;
  latestPersistSnapshot = { puzzles, stepStates };
  const pack: CachedPuzzlePack = {
    ...buildCachedPack(puzzles, 'lichess'),
    fullSyncComplete,
    completedStepKeys: completedKeysFromSteps(stepStates),
  };
  await saveCachedPuzzlePack(pack);
}

const defaultSyncState = (): PuzzleSyncState => ({
  status: 'idle',
  phase: 'idle',
  count: 0,
  playable: false,
  stale: true,
  needsRefresh: true,
  fullSyncComplete: false,
  source: 'none',
  fetchedAt: null,
  progress: 0,
  completedSteps: 0,
  totalSteps: TOTAL_SYNC_STEPS,
  pendingSteps: TOTAL_SYNC_STEPS,
  stepLabel: null,
  message: `${seedPuzzlePack.length} puzzles ready — downloading fresh ones.`,
  byDifficulty: {},
  difficultyProgress: buildDifficultyProgress([], []),
  stepProgress: buildStepProgress([]),
});

let syncState: PuzzleSyncState = defaultSyncState();

function emitSyncState() {
  for (const listener of listeners) {
    listener(syncState);
  }
}

function setSyncState(patch: Partial<PuzzleSyncState>) {
  syncState = { ...syncState, ...patch };
  emitSyncState();
}

function countByDifficulty(puzzles: Puzzle[]): Record<string, number> {
  return puzzles.reduce<Record<string, number>>((acc, puzzle) => {
    acc[puzzle.difficulty] = (acc[puzzle.difficulty] ?? 0) + 1;
    return acc;
  }, {});
}

function hasPlayablePuzzles(puzzles: Puzzle[]): boolean {
  return puzzles.length >= MIN_PLAYABLE_PUZZLES;
}

function isTimeStale(pack: CachedPuzzlePack, now = Date.now()): boolean {
  const fetched = Date.parse(pack.fetchedAt);
  if (Number.isNaN(fetched)) return true;
  return now - fetched >= ONE_DAY_MS;
}

function buildStepProgress(stepStates: StepSyncProgress[]): StepSyncProgress[] {
  if (stepStates.length > 0) return stepStates;
  return FULL_SYNC_FETCH_PLAN.map(step => ({ step, status: 'pending' as const, added: 0 }));
}

function buildDifficultyProgress(
  puzzles: Puzzle[],
  stepStates: StepSyncProgress[],
): DifficultySyncProgress[] {
  const counts = countByAppDifficulty(puzzles);
  const grouped = groupStepsByAppDifficulty(FULL_SYNC_FETCH_PLAN);
  const perDifficultyTarget = targetCountForAppDifficulty();

  return APP_DIFFICULTIES.map(key => {
    const stepsForDifficulty = grouped[key];
    const completedSteps = stepStates.filter(
      entry => fetchStepAppDifficulty(entry.step) === key && entry.status === 'done',
    ).length;
    const runningSteps = stepStates.filter(
      entry => fetchStepAppDifficulty(entry.step) === key && entry.status === 'running',
    ).length;

    return {
      key,
      label: APP_DIFFICULTY_LABELS[key],
      current: Math.min(counts[key], perDifficultyTarget),
      target: perDifficultyTarget,
      completedSteps,
      totalSteps: stepsForDifficulty.length,
      runningSteps,
    };
  });
}

function syncProgressFromSteps(puzzles: Puzzle[], stepStates: StepSyncProgress[]) {
  const completedSteps = stepStates.filter(entry => entry.status === 'done').length;
  // Errored batches are retried on the next run, so they still count as outstanding work.
  const pendingSteps = stepStates.filter(entry => entry.status !== 'done').length;
  const running = stepStates.find(entry => entry.status === 'running');

  return {
    count: puzzles.length,
    completedSteps,
    pendingSteps,
    progress: completedSteps / TOTAL_SYNC_STEPS,
    stepLabel: running ? stepLabel(running.step) : null,
    difficultyProgress: buildDifficultyProgress(puzzles, stepStates),
    stepProgress: stepStates,
  };
}

function buildIdleMessage(meta: Awaited<ReturnType<typeof getPuzzlePackMeta>>): string {
  const cooldownMs = puzzleRateLimitWaitMs();
  if (cooldownMs > 0 && !meta.fullSyncComplete) {
    const seconds = Math.ceil(cooldownMs / 1000);
    return meta.count > 0
      ? `${meta.count} puzzles saved · Lichess is busy, retrying in ${seconds}s`
      : `Lichess is busy — retrying in ${seconds}s.`;
  }
  if (!meta.playable) {
    return `${seedPuzzlePack.length} puzzles ready — downloading fresh ones.`;
  }
  if (meta.needsRefresh && !meta.fullSyncComplete) {
    return 'Downloading puzzle library…';
  }
  if (meta.stale) {
    return `${meta.count} puzzles ready — daily refresh available.`;
  }
  return `${meta.count} puzzles ready.`;
}

export function isPackStale(pack: CachedPuzzlePack, now = Date.now()): boolean {
  return isTimeStale(pack, now);
}

export function subscribePuzzleSync(listener: (state: PuzzleSyncState) => void): () => void {
  listeners.add(listener);
  listener(syncState);
  return () => listeners.delete(listener);
}

export async function refreshPuzzleSyncState(): Promise<PuzzleSyncState> {
  const meta = await getPuzzlePackMeta();

  const packFacts = {
    count: meta.count,
    playable: meta.playable,
    stale: meta.stale,
    needsRefresh: meta.needsRefresh,
    fullSyncComplete: meta.fullSyncComplete,
    source: meta.count > 0 ? meta.source : 'none',
    fetchedAt: meta.fetchedAt,
    byDifficulty: meta.byDifficulty,
    totalSteps: TOTAL_SYNC_STEPS,
  } as const;

  // A live sync owns the progress fields; overwriting them here would fight the running workers.
  if (syncState.status === 'syncing') {
    setSyncState({ ...packFacts, phase: 'syncing', status: 'syncing' });
    return syncState;
  }

  /**
   * Rebuild progress from the step keys persisted with the pack. Deriving it from
   * `fullSyncComplete` alone reported zero completed batches after a relaunch mid-download,
   * while the per-difficulty rows simultaneously claimed every batch was finished.
   */
  const cached = await loadCachedPuzzlePack();
  const completedKeys = new Set(cached?.completedStepKeys ?? []);
  const restedSteps: StepSyncProgress[] = FULL_SYNC_FETCH_PLAN.map(step => ({
    step,
    status:
      meta.fullSyncComplete || completedKeys.has(stepKey(step))
        ? ('done' as const)
        : ('pending' as const),
    added: 0,
  }));
  const completedSteps = restedSteps.filter(entry => entry.status === 'done').length;

  setSyncState({
    ...packFacts,
    phase: meta.fullSyncComplete ? 'complete' : meta.playable ? 'syncing' : 'idle',
    status: meta.needsRefresh ? 'idle' : 'done',
    message: buildIdleMessage(meta),
    progress: completedSteps / TOTAL_SYNC_STEPS,
    completedSteps,
    pendingSteps: TOTAL_SYNC_STEPS - completedSteps,
    stepLabel: null,
    difficultyProgress: buildDifficultyProgress(cached?.puzzles ?? [], restedSteps),
    stepProgress: restedSteps,
  });

  return syncState;
}

export async function loadCachedPuzzlePack(): Promise<CachedPuzzlePack | null> {
  if (memoryPack) return memoryPack;
  const raw = await AsyncStorage.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as CachedPuzzlePack;
    if (!Array.isArray(parsed.puzzles) || parsed.puzzles.length === 0) return null;
    if (parsed.source !== 'lichess') return null;
    memoryPack = parsed;
    return parsed;
  } catch {
    return null;
  }
}

async function saveCachedPuzzlePack(pack: CachedPuzzlePack): Promise<void> {
  memoryPack = pack;
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(pack));
  } catch {
    throw new Error('Could not save puzzles to device storage.');
  }
}

/** Downloaded puzzles when there are any, otherwise the bundled library. */
export async function getActivePuzzlePack(): Promise<Puzzle[]> {
  const cached = await loadCachedPuzzlePack();
  if (cached && cached.puzzles.length > 0) return cached.puzzles;
  return seedPuzzlePack;
}

export async function getSeenPuzzleIds(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(SEEN_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function markPuzzleSeen(id: string): Promise<void> {
  const seen = await getSeenPuzzleIds();
  const next = [id, ...seen.filter(existing => existing !== id)].slice(0, MAX_SEEN);
  await AsyncStorage.setItem(SEEN_KEY, JSON.stringify(next));
}

async function runFullSync(force: boolean): Promise<CachedPuzzlePack | null> {
  ensureBackgroundFlushListener();
  const existing = await loadCachedPuzzlePack();

  if (!force && existing?.fullSyncComplete && !isTimeStale(existing)) {
    setSyncState({ status: 'done', phase: 'complete', progress: 1, pendingSteps: 0 });
    await refreshPuzzleSyncState();
    return existing;
  }

  /**
   * `force` re-runs every step, but it must not discard the library first: a manual refresh
   * that hits a flaky network would otherwise leave fewer puzzles than before — or none, with
   * alarms unable to show anything. New puzzles merge in and duplicates are dropped by id.
   */
  const resumedKeys = new Set(force ? [] : (existing?.completedStepKeys ?? []));
  let puzzles = existing?.puzzles ?? [];
  const stepStates: StepSyncProgress[] = FULL_SYNC_FETCH_PLAN.map(step => ({
    step,
    status: resumedKeys.has(stepKey(step)) ? ('done' as const) : ('pending' as const),
    added: 0,
  }));

  setSyncState({
    status: 'syncing',
    phase: 'syncing',
    playable: hasPlayablePuzzles(puzzles),
    message: hasPlayablePuzzles(puzzles)
      ? `${puzzles.length} puzzles saved — finishing download…`
      : 'Downloading puzzle library…',
    ...syncProgressFromSteps(puzzles, stepStates),
  });

  if (puzzles.length > 0) {
    await persistPartialPack(puzzles, stepStates);
  }

  /** Set when Lichess rate limits us — the run stops rather than burning the cooldown. */
  let rateLimitWaitMs = 0;

  const runStep = async (index: number, batchSize: number) => {
    const entry = stepStates[index];
    if (entry.status === 'done') return;

    entry.status = 'running';
    setSyncState({
      playable: hasPlayablePuzzles(puzzles),
      message: buildSyncMessage(puzzles.length, stepStates, 0),
      ...syncProgressFromSteps(puzzles, stepStates),
    });

    let batch: Puzzle[] = [];
    let failed = false;
    try {
      batch = await fetchPuzzleStep(entry.step, batchSize);
    } catch (error) {
      failed = true;
      if (error instanceof PuzzleRateLimitError) {
        rateLimitWaitMs = error.retryAfterMs;
      }
    }

    await withMergeLock(async () => {
      const before = puzzles.length;
      puzzles = mergeWithBucketCaps(puzzles, batch);
      entry.added = puzzles.length - before;
      /**
       * A failed batch must stay retryable. Marking it done — as every batch used to be — wrote
       * its key into completedStepKeys, so a rate-limited download was remembered as finished
       * and the library stayed empty until the pack went stale a day later.
       */
      entry.status = failed ? 'error' : 'done';
      await persistPartialPack(puzzles, stepStates);
    });

    setSyncState({
      playable: hasPlayablePuzzles(puzzles),
      byDifficulty: countByDifficulty(puzzles),
      message: buildSyncMessage(puzzles.length, stepStates, rateLimitWaitMs),
      ...syncProgressFromSteps(puzzles, stepStates),
    });
  };

  for (let index = 0; index < TOTAL_SYNC_STEPS; index++) {
    if (stepStates[index]?.status === 'done') continue;
    await runStep(index, FULL_SYNC_BATCH_SIZE);
    if (rateLimitWaitMs > 0) break;
  }

  const completedSteps = stepStates.filter(entry => entry.status === 'done').length;
  const allStepsDone = completedSteps === TOTAL_SYNC_STEPS;

  if (rateLimitWaitMs > 0) scheduleSyncResume(rateLimitWaitMs);

  if (puzzles.length === 0) {
    setSyncState({
      status: 'error',
      phase: 'idle',
      message:
        rateLimitWaitMs > 0
          ? `Lichess is busy — retrying in ${Math.ceil(rateLimitWaitMs / 1000)}s.`
          : 'Could not download puzzles — check your connection.',
    });
    await refreshPuzzleSyncState();
    return null;
  }

  const pack: CachedPuzzlePack = {
    ...buildCachedPack(puzzles, 'lichess'),
    fullSyncComplete: allStepsDone,
    completedStepKeys: completedKeysFromSteps(stepStates),
  };
  await saveCachedPuzzlePack(pack);
  latestPersistSnapshot = null;

  setSyncState({
    status: allStepsDone ? 'done' : 'idle',
    phase: allStepsDone ? 'complete' : 'syncing',
    fullSyncComplete: allStepsDone,
    byDifficulty: countByDifficulty(puzzles),
    message: allStepsDone
      ? `${puzzles.length} puzzles ready.`
      : buildSyncMessage(puzzles.length, stepStates, rateLimitWaitMs),
    ...syncProgressFromSteps(puzzles, stepStates),
  });
  await refreshPuzzleSyncState();
  return pack;
}

function buildSyncMessage(
  puzzleCount: number,
  stepStates: StepSyncProgress[],
  rateLimitWaitMs: number,
): string {
  const done = stepStates.filter(entry => entry.status === 'done').length;
  if (rateLimitWaitMs > 0) {
    const seconds = Math.ceil(rateLimitWaitMs / 1000);
    return `${puzzleCount} puzzles saved · Lichess is busy, retrying in ${seconds}s`;
  }
  if (puzzleCount >= MIN_PLAYABLE_PUZZLES) {
    return `${puzzleCount} puzzles saved · ${done}/${TOTAL_SYNC_STEPS} batches`;
  }
  return `Downloading puzzle library… ${done}/${TOTAL_SYNC_STEPS} batches · ${puzzleCount} saved`;
}

/** Downloads the fixed puzzle library once (or on manual / daily refresh). */
export function startPuzzleSync(force = false): Promise<CachedPuzzlePack | null> {
  if (syncPromise && !force) return syncPromise;

  syncPromise = runFullSync(force).finally(() => {
    syncPromise = null;
  });

  return syncPromise;
}

/** Returns cached puzzles when playable; kicks off background sync if the library is incomplete. */
export async function ensurePlayablePuzzles(force = false): Promise<CachedPuzzlePack | null> {
  const existing = await loadCachedPuzzlePack();
  if (!force && existing && hasPlayablePuzzles(existing.puzzles)) {
    if (!existing.fullSyncComplete && !syncPromise) {
      startPuzzleSync().catch(() => undefined);
    }
    return existing;
  }
  return startPuzzleSync(force);
}

/**
 * Puzzles for a ringing alarm. Never waits on the network: the bundled library already covers
 * every mate-in and difficulty, so a throttled or offline download costs nothing at ring time.
 */
export async function ensurePuzzlesForRing(): Promise<Puzzle[]> {
  const existing = await loadCachedPuzzlePack();
  if (existing && hasPlayablePuzzles(existing.puzzles)) {
    if (!existing.fullSyncComplete && !syncPromise) {
      startPuzzleSync().catch(() => undefined);
    }
    return existing.puzzles;
  }

  startPuzzleSync().catch(() => undefined);
  return seedPuzzlePack;
}

/** @deprecated Use startPuzzleSync — no-op when sync is already complete. */
export function continueExpandSync(force = false): void {
  if (!force && syncState.fullSyncComplete && !syncState.stale) return;
  if (syncState.status === 'syncing') return;
  startPuzzleSync(force).catch(() => undefined);
}

/** @deprecated Use ensurePlayablePuzzles + startPuzzleSync */
export async function syncPuzzlesIfNeeded(force = false): Promise<CachedPuzzlePack | null> {
  await refreshPuzzleSyncState();
  if (!force && !syncState.needsRefresh) {
    return loadCachedPuzzlePack();
  }
  return startPuzzleSync(force);
}

export async function getPuzzlePackMeta(): Promise<{
  count: number;
  source: CachedPuzzlePack['source'] | 'none';
  fetchedAt: string | null;
  stale: boolean;
  needsRefresh: boolean;
  playable: boolean;
  fullSyncComplete: boolean;
  byDifficulty: Record<string, number>;
}> {
  const cached = await loadCachedPuzzlePack();
  if (!cached) {
    return {
      count: 0,
      source: 'none',
      fetchedAt: null,
      stale: true,
      needsRefresh: true,
      playable: false,
      fullSyncComplete: false,
      byDifficulty: {},
    };
  }

  const playable = hasPlayablePuzzles(cached.puzzles);
  const stale = isTimeStale(cached);
  const fullSyncComplete = cached.fullSyncComplete === true;

  return {
    count: cached.puzzles.length,
    source: cached.source,
    fetchedAt: cached.fetchedAt,
    stale,
    needsRefresh: !playable || !fullSyncComplete || stale,
    playable,
    fullSyncComplete,
    byDifficulty: countByDifficulty(cached.puzzles),
  };
}

/** Clears in-memory cache (tests). */
export function resetPuzzlePackCacheForTests() {
  memoryPack = null;
  syncPromise = null;
  if (resumeTimer) clearTimeout(resumeTimer);
  resumeTimer = null;
  syncState = defaultSyncState();
  listeners.clear();
}
