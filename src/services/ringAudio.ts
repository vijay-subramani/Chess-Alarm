import { AppState, Platform } from 'react-native';
import Sound from 'react-native-sound';
import type { AlarmSound } from '@/types/alarm';
import { DEFAULT_ALARM_SOUND } from '@/types/alarm';
import { getBuiltInSound } from '@/services/alarmSounds';
import { playBuiltInSound, playSystemSound, stopSystemSound } from '@/services/alarmSystemSoundNative';
import {
  isNativeAlarmRinging,
  nativeAlarmRingSupported,
  startNativeAlarmRing,
  startInAppNativeAlarmRing,
  stopNativeAlarmRing,
} from '@/services/alarmRingNative';
import { resolveSoundForAlarm } from '@/services/resolveAlarmSound';

Sound.setCategory('Alarm', true);

let player: Sound | null = null;
const activeSounds = new Set<Sound>();
let ringing = false;
let silenced = true;
let starting: Promise<void> | null = null;
let session = 0;
let activeRingSound: AlarmSound = { ...DEFAULT_ALARM_SOUND };
let systemRingActive = false;
let nativeRingActive = false;

let previewPlayer: Sound | null = null;

function configureSession() {
  Sound.setCategory('Alarm', true);
}

function releaseSound(next: Sound) {
  activeSounds.delete(next);
  try {
    next.stop();
  } catch {
    // ignore
  }
  try {
    next.release();
  } catch {
    // ignore
  }
  if (player === next) {
    player = null;
  }
}

function stopAllSounds() {
  for (const next of [...activeSounds]) {
    releaseSound(next);
  }
  player = null;
}

function customFilePath(uri: string): string {
  return uri.replace(/^file:\/\//, '');
}

function loadSoundForConfig(sound: AlarmSound): Promise<Sound> {
  return new Promise((resolve, reject) => {
    if (sound.kind === 'system') {
      reject(new Error('system sounds use native playback'));
      return;
    }

    if (sound.kind === 'custom') {
      const path = customFilePath(sound.uri);
      const next = new Sound(path, '', error => {
        if (error) {
          reject(error);
          return;
        }
        activeSounds.add(next);
        resolve(next);
      });
      return;
    }

    const builtIn = getBuiltInSound(sound.id);
    const filename = Platform.OS === 'android' ? builtIn.androidRaw : builtIn.iosBundle;
    const next = new Sound(filename, Sound.MAIN_BUNDLE, error => {
      if (error) {
        reject(error);
        return;
      }
      activeSounds.add(next);
      resolve(next);
    });
  });
}

function playLoop(next: Sound): Promise<void> {
  return new Promise((resolve, reject) => {
    next.setNumberOfLoops(-1);
    next.setVolume(1);
    next.play(success => {
      if (success) resolve();
      else reject(new Error('alarm play failed'));
    });
  });
}

async function startNativeAndroidRing(sound: AlarmSound): Promise<void> {
  if (sound.kind === 'builtin') {
    const builtIn = getBuiltInSound(sound.id);
    await playBuiltInSound(builtIn.androidRaw, true);
    return;
  }

  const uri = sound.uri;
  await playSystemSound(uri, true);
}

async function createLoopingPlayer(token: number): Promise<void> {
  configureSession();

  if (player) {
    releaseSound(player);
  }
  if (systemRingActive) {
    await stopSystemSound();
    systemRingActive = false;
  }

  if (silenced || token !== session) return;

  if (Platform.OS === 'android') {
    try {
      await startNativeAndroidRing(activeRingSound);
      if (silenced || token !== session) {
        await stopSystemSound();
        return;
      }
      systemRingActive = true;
      ringing = true;
      return;
    } catch {
      // Fall through to react-native-sound below.
    }
  }

  if (Platform.OS === 'ios' && activeRingSound.kind === 'system') {
    try {
      await playSystemSound(activeRingSound.uri, true);
    } catch {
      if (!silenced && token === session) {
        ringing = false;
        systemRingActive = false;
      }
      return;
    }

    if (silenced || token !== session) {
      await stopSystemSound();
      return;
    }

    systemRingActive = true;
    ringing = true;
    return;
  }

  let next: Sound;
  try {
    next = await loadSoundForConfig(activeRingSound);
  } catch {
    if (!silenced && token === session) {
      ringing = false;
      player = null;
    }
    return;
  }

  if (silenced || token !== session) {
    releaseSound(next);
    return;
  }

  try {
    await playLoop(next);
  } catch {
    releaseSound(next);
    if (!silenced && token === session) {
      ringing = false;
      player = null;
    }
    return;
  }

  if (silenced || token !== session) {
    releaseSound(next);
    return;
  }

  player = next;
  ringing = true;
}

export function getActiveRingSound(): AlarmSound {
  return activeRingSound;
}

/** Returns true when native looping audio is confirmed to be playing. */
export async function verifyNativeRingActive(): Promise<boolean> {
  if (!nativeRingActive) return false;
  const playing = await isNativeAlarmRinging().catch(() => false);
  if (!playing) {
    nativeRingActive = false;
    ringing = false;
  }
  return playing;
}

/** Set the sound used for the current and future ring sessions. Restarts playback if already ringing. */
export async function configureRingSound(sound: AlarmSound) {
  activeRingSound = sound;
  if (await verifyNativeRingActive()) return;
  if (silenced) return;
  await startAlarmAudio({ sound });
}

/** Call when a new alarm session begins (notification, test alarm, ring screen). */
export function armRingSound() {
  silenced = false;
  session += 1;
}

export function isSilenced() {
  return silenced;
}

/** Start looping alarm audio — safe to call repeatedly. */
export async function startRingSound() {
  if (silenced) return;
  const nativePlaying = await isNativeAlarmRinging().catch(() => false);
  if (nativePlaying) {
    nativeRingActive = true;
    ringing = true;
    return;
  }
  if (await verifyNativeRingActive()) return;

  if (starting) {
    await starting;
    if (silenced) return;
    if (ringing && (player || systemRingActive)) return;
  } else if (ringing && (player || systemRingActive)) {
    return;
  }

  const token = session;
  starting = createLoopingPlayer(token)
    .catch(() => {
      if (!silenced && token === session) {
        ringing = false;
        player = null;
      }
    })
    .finally(() => {
      starting = null;
    });

  await starting;
}

/** Re-trigger playback if the loop stopped (e.g. iOS audio interruption). */
export async function ensureRingSound() {
  if (silenced) return;
  const nativePlaying = await isNativeAlarmRinging().catch(() => false);
  if (nativePlaying) {
    nativeRingActive = true;
    ringing = true;
    return;
  }
  if (await verifyNativeRingActive()) return;
  if (starting) {
    await starting;
    if (silenced) return;
  }
  if (!ringing || (!player && !systemRingActive)) {
    await startRingSound();
  }
}

export async function stopRingSound() {
  silenced = true;
  ringing = false;
  systemRingActive = false;
  nativeRingActive = false;
  activeSessionAlarmId = undefined;
  session += 1;
  starting = null;
  stopAllSounds();
  await stopSystemSound();
  await stopPreviewSound();
  await stopNativeAlarmRing();
}

export function isRinging() {
  return !silenced && (ringing || nativeRingActive);
}

export type BeginAlarmSessionOptions = {
  alarmId?: string;
  sound?: AlarmSound;
  /** Play in-app without starting the native foreground service (test / foreground alarms). */
  inApp?: boolean;
};

let activeSessionAlarmId: string | undefined;

/** Force alarm audio to play — used by ring screen and alarm delivery. */
export async function startAlarmAudio(options?: BeginAlarmSessionOptions): Promise<void> {
  if (options?.sound) {
    activeRingSound = options.sound;
  } else if (options?.alarmId) {
    activeRingSound = await resolveSoundForAlarm(options.alarmId);
  }

  silenced = false;
  const alarmId = options?.alarmId;

  const nativePlaying = await isNativeAlarmRinging().catch(() => false);
  if (nativePlaying) {
    activeSessionAlarmId = alarmId;
    nativeRingActive = true;
    ringing = true;
    return;
  }

  if (
    alarmId !== undefined &&
    activeSessionAlarmId === alarmId &&
    (ringing || systemRingActive)
  ) {
    await ensureRingSound();
    return;
  }

  activeSessionAlarmId = alarmId;
  session += 1;
  const token = session;
  nativeRingActive = false;
  ringing = false;
  systemRingActive = false;

  if (player) {
    releaseSound(player);
    player = null;
  }
  await stopSystemSound().catch(() => undefined);

  if (Platform.OS === 'android' && alarmId && nativeAlarmRingSupported()) {
    try {
      const inApp = options?.inApp ?? AppState.currentState === 'active';
      if (inApp) {
        await startInAppNativeAlarmRing(alarmId, activeRingSound);
      } else {
        await startNativeAlarmRing(alarmId, activeRingSound, false);
      }
      await waitForNativeRing(1500);
      if (await isNativeAlarmRinging().catch(() => false)) {
        nativeRingActive = true;
        ringing = true;
        return;
      }
    } catch {
      // fall through to JS playback
    }
    await stopNativeAlarmRing().catch(() => undefined);
  } else if (
    Platform.OS === 'ios' &&
    alarmId &&
    nativeAlarmRingSupported() &&
    !options?.inApp &&
    AppState.currentState !== 'active'
  ) {
    try {
      await startNativeAlarmRing(alarmId, activeRingSound, false);
      await waitForNativeRing(1500);
      if (await isNativeAlarmRinging().catch(() => false)) {
        nativeRingActive = true;
        ringing = true;
        return;
      }
    } catch {
      // fall through to JS playback
    }
    await stopNativeAlarmRing().catch(() => undefined);
  }

  await createLoopingPlayer(token);
}

/** Begin or resume alarm audio for a new ring session. Idempotent while already ringing. */
export function beginAlarmSession(options?: BeginAlarmSessionOptions) {
  startAlarmAudio(options).catch(() => undefined);
}

async function waitForNativeRing(timeoutMs: number): Promise<void> {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const playing = await isNativeAlarmRinging().catch(() => false);
    if (playing) return;
    await new Promise<void>(resolve => setTimeout(resolve, 50));
  }
}

export async function previewAlarmSound(sound: AlarmSound): Promise<void> {
  await stopPreviewSound();
  configureSession();

  if (Platform.OS === 'android') {
    try {
      if (sound.kind === 'builtin') {
        const builtIn = getBuiltInSound(sound.id);
        await playBuiltInSound(builtIn.androidRaw, false);
        return;
      }
      if (sound.kind === 'system' || sound.kind === 'custom') {
        await playSystemSound(sound.uri, false);
        return;
      }
    } catch {
      // Fall through to react-native-sound below.
    }
  }

  if (sound.kind === 'system') {
    try {
      await playSystemSound(sound.uri, false);
    } catch {
      // ignore preview failures
    }
    return;
  }

  try {
    const next = await loadSoundForConfig(sound);
    previewPlayer = next;
    next.setNumberOfLoops(0);
    next.setVolume(1);
    await new Promise<void>((resolve, reject) => {
      next.play(success => {
        if (success) resolve();
        else reject(new Error('preview play failed'));
      });
    });
  } catch {
    await stopPreviewSound();
  }
}

export async function stopPreviewSound() {
  await stopSystemSound();
  if (!previewPlayer) return;
  releaseSound(previewPlayer);
  previewPlayer = null;
}
