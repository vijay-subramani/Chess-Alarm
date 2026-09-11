import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  AppState,
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Vibration,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Chess } from 'chess.js';
import { SunriseOrb, ORB_LEFT_CORNER } from '@/components/SunriseOrb';
import { ChessBoard } from '@/components/board/ChessBoard';
import { BlockerOverlay, useButtonShake } from '@/components/ring/BlockerOverlay';
import { PieceType } from '@/components/board/ChessPieces';
import type { AppColors } from '@/theme/tokens';
import { fonts, spacing } from '@/theme/tokens';
import { useThemedStyles } from '@/theme/useThemedStyles';
import { useTheme } from '@/theme/ThemeContext';
import type { Settings, AlarmPuzzleSettings } from '@/types/alarm';
import { loadSettings } from '@/services/settingsStore';
import { loadAlarms, normalizeAlarm } from '@/services/alarmStore';
import { ensurePuzzlesForRing, getSeenPuzzleIds, markPuzzleSeen } from '@/services/puzzleStore';
import { selectPuzzle } from '@/domain/puzzle';
import type { Puzzle } from '@/types/puzzle';
import { advanceSolution, createSolutionState, solutionProgressIndex, solutionStateFromFen } from '@/domain/solution';
import { hintBannerText, hintLevelFromFailures, hintSquaresForMove } from '@/domain/hints';
import {
  dismissActiveNotifications,
  scheduleSnooze,
} from '@/services/alarmScheduler';
import {
  ensureRingSound,
  isSilenced,
  startAlarmAudio,
  stopRingSound,
} from '@/services/ringAudio';
import { resolveSoundForAlarm } from '@/services/resolveAlarmSound';
import type { RootStackParamList } from '@/navigation/types';
import { useKeepAwake } from '@/hooks/useKeepAwake';

type Props = NativeStackScreenProps<RootStackParamList, 'Ring'>;
type BtnId = 'snooze' | 'stop';

const BLOCKER_MS = 2200;

const DEFENDERS: Record<BtnId, { piece: PieceType; msg: (mateIn: number) => string }> = {
  snooze: {
    piece: 'N',
    msg: () => 'Solve first, then snooze!',
  },
  stop: {
    piece: 'P',
    msg: mateIn => `Earn it — find mate in ${mateIn}.`,
  },
};

function formatClock(date: Date) {
  const h = date.getHours() % 12 || 12;
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function RingScreen({ navigation, route }: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const loadingSpinnerColor = colors.primary;
  useKeepAwake(true);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [puzzlePrefs, setPuzzlePrefs] = useState<AlarmPuzzleSettings | null>(null);
  const [clock, setClock] = useState(formatClock(new Date()));
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [puzzleError, setPuzzleError] = useState<string | null>(null);

  const [fen, setFen] = useState<string | null>(null);
  const [solution, setSolution] = useState(createSolutionState());
  const [failures, setFailures] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const [lockedFeedback, setLockedFeedback] = useState<{ btn: BtnId; key: number } | null>(
    null,
  );
  const blockTimers = useRef<Record<BtnId, ReturnType<typeof setTimeout> | null>>({
    snooze: null,
    stop: null,
  });
  const dismissedRef = useRef(false);
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const solutionRef = useRef(createSolutionState());
  const snoozeShake = useButtonShake();
  const stopShake = useButtonShake();

  useEffect(() => {
    solutionRef.current = solution;
  }, [solution]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!unlocked && !dismissedRef.current) {
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [unlocked]);

  useEffect(() => {
    let mounted = true;

    async function prepareRingSound() {
      const alarmId = route.params?.alarmId;
      const sound = await resolveSoundForAlarm(alarmId);
      if (!mounted) return;
      await startAlarmAudio({ alarmId, sound, inApp: true });
    }

    prepareRingSound().catch(() => undefined);

    keepAliveRef.current = setInterval(() => {
      if (!dismissedRef.current && !isSilenced()) {
        ensureRingSound().catch(() => undefined);
      }
    }, 2500);

    return () => {
      mounted = false;
      if (keepAliveRef.current) clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    };
  }, [route.params?.alarmId]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active' && !dismissedRef.current && !isSilenced()) {
        ensureRingSound().catch(() => undefined);
      }
    });
    return () => sub.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (!dismissedRef.current && !isSilenced()) {
        ensureRingSound().catch(() => undefined);
      }
      const tick = setInterval(() => setClock(formatClock(new Date())), 1000);
      return () => {
        clearInterval(tick);
      };
    }, []),
  );

  useEffect(() => {
    let mounted = true;

    async function loadRingPuzzle() {
      setPuzzleError(null);
      const alarmId = route.params?.alarmId;
      const [nextSettings, seenIds, alarms] = await Promise.all([
        loadSettings(),
        getSeenPuzzleIds(),
        loadAlarms(),
      ]);
      if (!mounted) return;
      setSettings(nextSettings);

      let prefs: AlarmPuzzleSettings = {
        difficulty: nextSettings.difficulty,
        mateIn: nextSettings.mateIn,
        hintAfter: nextSettings.hintAfter,
      };
      if (alarmId && alarmId !== 'test-alarm') {
        const alarm = alarms.find(a => a.id === alarmId);
        if (alarm) {
          prefs = normalizeAlarm(alarm).puzzle;
        }
      } else if (alarmId === 'test-alarm') {
        prefs = {
          difficulty: nextSettings.difficulty,
          mateIn: nextSettings.mateIn,
          hintAfter: nextSettings.hintAfter,
        };
      }
      setPuzzlePrefs(prefs);

      const pack = await ensurePuzzlesForRing();
      if (!mounted) return;

      if (pack.length === 0) {
        setPuzzleError('Could not load puzzles. Connect to the internet and try again from Home.');
        return;
      }

      const selected = selectPuzzle(
        pack,
        {
          difficulty: prefs.difficulty,
          mateIn: prefs.mateIn,
        },
        seenIds,
      );
      if (!mounted) return;
      await markPuzzleSeen(selected.id);
      setPuzzle(selected);
      setFen(selected.fen);
      setSolution(createSolutionState());
      setFailures(0);
      setUnlocked(false);
    }

    loadRingPuzzle().catch(() => undefined);
    return () => {
      mounted = false;
    };
  }, [route.params?.alarmId]);

  useEffect(() => {
    if (!puzzle) return;
    setFen(puzzle.fen);
    setSolution(createSolutionState());
    setFailures(0);
    setUnlocked(false);
  }, [puzzle?.id]);

  if (puzzleError) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.puzzleErrorText}>{puzzleError}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!settings || !puzzlePrefs || fen === null || !puzzle) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loading}>
          <Text style={styles.time}>{clock}</Text>
          <ActivityIndicator size="large" color={loadingSpinnerColor} />
          <Text style={styles.puzzleErrorText}>Loading your puzzle…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const boardFen = fen;

  const hintsActive = !unlocked && !solution.solved;
  const hintLevel = hintsActive ? hintLevelFromFailures(failures, puzzlePrefs.hintAfter) : 'none';
  const moveHintIndex = solutionProgressIndex(
    puzzle.fen,
    puzzle.solutionUci,
    fen,
    puzzle.replyUci,
  );
  const nextHintMove = hintsActive
    ? hintSquaresForMove(puzzle.solutionUci, moveHintIndex)
    : null;
  const hintFrom = hintLevel !== 'none' && nextHintMove ? nextHintMove.from : null;
  const hintTo =
    (hintLevel === 'target' || hintLevel === 'text') && nextHintMove ? nextHintMove.to : null;
  const hintMessage =
    hintLevel !== 'none' && nextHintMove
      ? hintBannerText(hintLevel, nextHintMove, puzzle.hintText)
      : '';
  const attemptDots = Math.max(1, Math.min(puzzlePrefs.hintAfter, 8));
  const missedAttempts = Math.min(failures, attemptDots);
  const snoozeMinutes = settings.snoozeMinutes;

  const dismissAlarm = async () => {
    dismissedRef.current = true;
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    await stopRingSound();
    await dismissActiveNotifications(route.params?.alarmId);
  };

  const goHome = () => {
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  const onUserMove = (uci: string, nextFen: string): boolean => {
    const { next, correct } = advanceSolution(solutionRef.current, puzzle.solutionUci, uci);
    if (!correct) {
      setFailures(f => f + 1);
      const progress = solutionStateFromFen(
        puzzle.fen,
        puzzle.solutionUci,
        fen,
        puzzle.replyUci,
      );
      solutionRef.current = progress;
      setSolution(progress);
      Vibration.vibrate(80);
      return false;
    }

    let fenNow = nextFen;
    if (!next.solved) {
      const reply = puzzle.replyUci?.[next.index - 1];
      if (reply) {
        try {
          const game = new Chess(fenNow);
          game.move({
            from: reply.slice(0, 2),
            to: reply.slice(2, 4),
            promotion: reply.length > 4 ? reply[4] : undefined,
          });
          fenNow = game.fen();
        } catch {
          // ignore illegal canned reply
        }
      }
    }

    const progress = solutionStateFromFen(
      puzzle.fen,
      puzzle.solutionUci,
      fenNow,
      puzzle.replyUci,
    );
    solutionRef.current = progress;
    setFen(fenNow);
    setSolution(progress);
    if (progress.solved) {
      setUnlocked(true);
    }
    return true;
  };

  const onLockedPress = (btn: BtnId) => {
    if (unlocked) return;
    if (blockTimers.current[btn]) clearTimeout(blockTimers.current[btn]!);
    setLockedFeedback({ btn, key: Date.now() });
    if (btn === 'snooze') snoozeShake.run();
    else stopShake.run();
    Vibration.vibrate(40);
    blockTimers.current[btn] = setTimeout(() => {
      setLockedFeedback(current => (current?.btn === btn ? null : current));
    }, BLOCKER_MS);
  };

  const onTurnOff = async () => {
    if (!unlocked) return onLockedPress('stop');
    await dismissAlarm();
    goHome();
  };

  const onSnooze = async () => {
    if (!unlocked) return onLockedPress('snooze');
    await dismissAlarm();
    await scheduleSnooze(snoozeMinutes);
    goHome();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <SunriseOrb size={180} style={styles.orb} />
      <ScrollView contentContainerStyle={styles.content} bounces={false}>
        <View style={styles.header}>
          <View style={[styles.lockPill, unlocked && styles.lockPillUnlocked]}>
            <Text style={[styles.lockPillText, unlocked && styles.lockPillTextUnlocked]}>
              {unlocked ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
          <Text style={styles.time}>{clock}</Text>
          <Text style={styles.alarmLabel}>ALARM</Text>
        </View>

        <View style={styles.challengeHead}>
          <View style={styles.challengeCopy}>
            <Text style={styles.challengeLabel}>UNLOCK CHALLENGE</Text>
            <Text style={styles.challengeGoal}>{puzzle.goal}</Text>
          </View>
          <View style={styles.attemptsCol}>
            <Text style={styles.attemptsLabel}>ATTEMPTS</Text>
            <View style={styles.dots}>
              {Array.from({ length: attemptDots }, (_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i < missedAttempts ? styles.dotFilled : styles.dotEmpty]}
                />
              ))}
            </View>
          </View>
        </View>

        {hintMessage ? (
          <View style={styles.hintBanner}>
            <Text style={styles.hintText}>{hintMessage}</Text>
          </View>
        ) : null}

        <View style={styles.boardWrap}>
          <ChessBoard
            fen={boardFen}
            fullWidth
            hintFrom={hintFrom}
            hintTo={hintTo}
            onUserMove={onUserMove}
            interactive={!unlocked}
          />
        </View>

        <Text style={styles.lockCaption}>
          {unlocked ? 'Solved — snooze or turn off' : 'Solve the puzzle to unlock'}
        </Text>

        <View style={[styles.actionsWrap, !unlocked && styles.actionsLocked]}>
          <View style={styles.actions}>
            {(['snooze', 'stop'] as const).map(btn => {
              const def = DEFENDERS[btn];
              const enabled = unlocked;
              const shakeX = btn === 'snooze' ? snoozeShake.translateX : stopShake.translateX;
              return (
                <View key={btn} style={styles.btnWrap}>
                  <Animated.View style={{ transform: [{ translateX: shakeX }] }}>
                    <Pressable
                      onPress={btn === 'snooze' ? onSnooze : onTurnOff}
                      style={[
                        styles.actionBtn,
                        btn === 'snooze' ? styles.snoozeBtn : styles.stopBtn,
                        !enabled && styles.actionBtnLocked,
                      ]}
                    >
                      <Text
                        style={[
                          styles.actionTitle,
                          btn === 'snooze' ? styles.actionTitleOnPrimary : styles.actionTitleOnStop,
                          !enabled && styles.actionTitleLocked,
                        ]}
                      >
                        {!enabled ? '🔒 ' : ''}
                        {btn === 'snooze' ? 'SNOOZE' : 'TURN OFF'}
                      </Text>
                      <Text
                        style={[
                          styles.actionSub,
                          btn === 'snooze' ? styles.actionSubOnPrimary : styles.actionSubOnStop,
                          !enabled && styles.actionSubLocked,
                        ]}
                      >
                        {btn === 'snooze' ? `${snoozeMinutes} min` : 'Dismiss alarm'}
                      </Text>
                    </Pressable>
                  </Animated.View>
                </View>
              );
            })}
          </View>
          {lockedFeedback ? (
            <BlockerOverlay
              visible
              blockKey={lockedFeedback.key}
              piece={DEFENDERS[lockedFeedback.btn].piece}
              message={DEFENDERS[lockedFeedback.btn].msg(puzzlePrefs.mateIn)}
            />
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  orb: ORB_LEFT_CORNER,
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  puzzleErrorText: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: colors.muted,
    textAlign: 'center',
    lineHeight: 20,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
    zIndex: 1,
  },
  boardWrap: {
    marginHorizontal: -spacing.xl,
    alignItems: 'center',
  },
  header: { alignItems: 'center', gap: spacing.xs },
  lockPill: {
    alignSelf: 'center',
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: spacing.xs,
  },
  lockPillUnlocked: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  lockPillText: {
    fontFamily: fonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.primary,
    fontWeight: '600',
  },
  lockPillTextUnlocked: { color: colors.primary },
  time: {
    fontFamily: fonts.display,
    fontSize: 52,
    color: colors.ink,
    fontWeight: '700',
  },
  alarmLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.muted,
    fontWeight: '600',
  },
  challengeHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  challengeCopy: { flex: 1, paddingRight: spacing.md },
  challengeLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '600',
  },
  challengeGoal: {
    fontFamily: fonts.uiSemi,
    fontSize: 14,
    color: colors.ink,
    fontWeight: '600',
    marginTop: 2,
  },
  attemptsCol: { alignItems: 'flex-end', gap: 4 },
  attemptsLabel: {
    fontFamily: fonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.2,
    color: colors.muted,
    fontWeight: '600',
  },
  dots: { flexDirection: 'row', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotFilled: { backgroundColor: colors.primary },
  dotEmpty: { backgroundColor: colors.toggleOff },
  hintBanner: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.sm,
  },
  hintText: {
    fontFamily: fonts.uiSemi,
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  lockCaption: {
    fontFamily: fonts.ui,
    fontSize: 12,
    color: colors.muted,
    textAlign: 'center',
  },
  actionsWrap: {
    marginTop: spacing.sm,
    overflow: 'visible',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    overflow: 'visible',
  },
  actionsLocked: {
    paddingBottom: spacing.sm,
  },
  btnWrap: { flex: 1, position: 'relative', overflow: 'visible' },
  actionBtn: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 4,
  },
  actionBtnLocked: { opacity: 0.55 },
  snoozeBtn: { backgroundColor: colors.primary },
  stopBtn: { backgroundColor: colors.stop },
  actionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  actionTitleOnPrimary: { color: colors.onPrimary },
  actionTitleOnStop: { color: colors.onStop },
  actionTitleLocked: { color: colors.onPrimary },
  actionSub: {
    fontFamily: fonts.ui,
    fontSize: 10,
  },
  actionSubOnPrimary: { color: 'rgba(23, 33, 13, 0.75)' },
  actionSubOnStop: { color: 'rgba(255,255,255,0.85)' },
  actionSubLocked: { color: 'rgba(23, 33, 13, 0.55)' },
});
