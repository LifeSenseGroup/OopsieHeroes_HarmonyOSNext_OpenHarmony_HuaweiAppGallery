import { get } from 'svelte/store';
import { store_alarm, txtSndfilename } from '../stores.js';
import type { EventOopsie } from './dataStructures';
import { anchorStartsForPredictiveLeakTiming, computeAlarmState } from './PredictionEngine';
import {
  playSelectedAlarm,
  stopSelectedAlarm,
  startSoundDetection,
  stopSoundDetection
} from './NativeBridge';
import { clearMoistureAlarmSuppress, extendMoistureAlarmSuppressMs, isWithinTimedMoistureSuppress, registerMoistureAlarmGate } from './moistureAlarmSuppress';
import {
  activatePredictionAlarm,
  consumePredictionCycle,
  deactivatePredictionAlarm,
  isPredictionAlarmActivated,
  getPredictionHistoryCutoffMs
} from './predictionLifecycle';

export type StaircasePhaseId = 'whisper' | 'nudge' | 'wake';

export type StaircaseSchedule = {
  predictedTimeMs: number;
  nightStartMs: number;
  soundFile: string;
  completedPhases: StaircasePhaseId[];
};

const STORAGE_KEY = 'predictiveStaircaseSchedule';
const WAKE_ACTIVE_UNTIL_KEY = 'predictiveStaircaseWakeActive';

const MS_PER_MINUTE = 60_000;

const PHASE_OFFSETS_MIN: Record<StaircasePhaseId, number> = {
  whisper: -15,
  nudge: -7,
  wake: 0
};

const PHASE_CONFIG: Record<
  StaircasePhaseId,
  { volume: number; durationMs: number | null; loop: boolean }
> = {
  whisper: { volume: 0.25, durationMs: 15_000, loop: false },
  nudge: { volume: 0.8, durationMs: 30_000, loop: false },
  wake: { volume: 1, durationMs: null, loop: true }
};

/** After whisper/nudge stop, ignore native moisture callback briefly (echo / tail). */
const POST_PLAYBACK_NATIVE_SUPPRESS_MS = 12_000;
/** Resume mic after staircase quiet audio so real leaks are detected again before the next phase. */
const MIC_RESUME_DELAY_MS = 4_000;

let phaseTimers: ReturnType<typeof setTimeout>[] = [];
let phaseStopTimer: ReturnType<typeof setTimeout> | null = null;
let resumeMicTimer: ReturnType<typeof setTimeout> | null = null;
let wakePhaseActive = false;
/** True after we paused native sound detection for whisper/nudge until resume or cancel. */
let micPausedForStaircase = false;
/** When whisper/nudge playback should end (custom sounds ignore native durationMs). */
let quietPlaybackEndsAtMs: number | null = null;
/** Re-trigger playback before native single-playback ends (~4–5s). */
let quietPlaybackKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
let quietPhasePlayback: { soundFile: string; volume: number } | null = null;
/** Custom recordings may not loop natively during full wake — re-trigger until dismiss. */
let wakePlaybackKeepaliveTimer: ReturnType<typeof setInterval> | null = null;
let wakeKeepaliveSoundFile: string | null = null;

const CUSTOM_QUIET_KEEPALIVE_MS = 3_500;

export function isCustomAlarmSoundFile(soundFile: string): boolean {
  return soundFile === 'customSnd';
}

function readSchedule(): StaircaseSchedule | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaircaseSchedule;
    if (!parsed?.predictedTimeMs || typeof parsed.nightStartMs !== 'number') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSchedule(schedule: StaircaseSchedule | null) {
  if (!schedule) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
}

function clearPhaseArmTimers() {
  for (const timer of phaseTimers) {
    clearTimeout(timer);
  }
  phaseTimers = [];
}

export function isQuietPhasePlaying(nowMs = Date.now()): boolean {
  return quietPlaybackEndsAtMs != null && nowMs < quietPlaybackEndsAtMs;
}

function clearQuietPlaybackKeepalive() {
  if (quietPlaybackKeepaliveTimer) {
    clearInterval(quietPlaybackKeepaliveTimer);
    quietPlaybackKeepaliveTimer = null;
  }
  quietPhasePlayback = null;
}

function clearWakePlaybackKeepalive() {
  if (wakePlaybackKeepaliveTimer) {
    clearInterval(wakePlaybackKeepaliveTimer);
    wakePlaybackKeepaliveTimer = null;
  }
  wakeKeepaliveSoundFile = null;
}

function playWakePhaseAlarm(schedule: StaircaseSchedule) {
  // Full alarm: same path as reactive leak (alarm stream, loop) — not staircaseQuiet.
  playSelectedAlarm({
    volume: 1,
    loop: true,
    soundFile: schedule.soundFile
  });
}

function startWakeKeepalive(schedule: StaircaseSchedule) {
  clearWakePlaybackKeepalive();
  if (!isCustomAlarmSoundFile(schedule.soundFile)) return;

  wakeKeepaliveSoundFile = schedule.soundFile;
  wakePlaybackKeepaliveTimer = setInterval(() => {
    if (!wakePhaseActive && !isStaircaseWakeActive()) {
      clearWakePlaybackKeepalive();
      return;
    }
    playSelectedAlarm({
      volume: 1,
      loop: true,
      soundFile: wakeKeepaliveSoundFile ?? schedule.soundFile,
      skipSetSndFile: true
    });
  }, CUSTOM_QUIET_KEEPALIVE_MS);
}

function ensureWakeKeepalive() {
  if (!wakeKeepaliveSoundFile) return;
  if (wakePlaybackKeepaliveTimer) return;
  wakePlaybackKeepaliveTimer = setInterval(() => {
    if (!wakePhaseActive && !isStaircaseWakeActive()) {
      clearWakePlaybackKeepalive();
      return;
    }
    playSelectedAlarm({
      volume: 1,
      loop: true,
      soundFile: wakeKeepaliveSoundFile!,
      skipSetSndFile: true
    });
  }, CUSTOM_QUIET_KEEPALIVE_MS);
}

function playQuietPhaseAlarm(
  schedule: StaircaseSchedule,
  config: { volume: number; durationMs: number | null; loop: boolean }
) {
  // Native often plays bundled MP3s once and ignores durationMs/volume — JS owns length via
  // scheduleQuietPhaseStop + keepalive re-triggers until stopSelectedAlarm().
  playSelectedAlarm({
    volume: config.volume,
    durationMs: null,
    loop: true,
    soundFile: schedule.soundFile,
    staircaseQuiet: true
  });
}

function startQuietKeepalive(
  schedule: StaircaseSchedule,
  config: { volume: number; durationMs: number | null; loop: boolean }
) {
  clearQuietPlaybackKeepalive();
  if (config.durationMs == null) return;

  quietPhasePlayback = { soundFile: schedule.soundFile, volume: config.volume };
  quietPlaybackKeepaliveTimer = setInterval(() => {
    if (!isQuietPhasePlaying() || !quietPhasePlayback) {
      clearQuietPlaybackKeepalive();
      return;
    }
    playSelectedAlarm({
      volume: quietPhasePlayback.volume,
      durationMs: null,
      loop: true,
      soundFile: quietPhasePlayback.soundFile,
      staircaseQuiet: true,
      skipSetSndFile: true
    });
  }, CUSTOM_QUIET_KEEPALIVE_MS);
}

function ensureQuietPhaseKeepalive() {
  if (!isQuietPhasePlaying() || !quietPhasePlayback) return;
  if (quietPlaybackKeepaliveTimer) return;
  quietPlaybackKeepaliveTimer = setInterval(() => {
    if (!isQuietPhasePlaying() || !quietPhasePlayback) {
      clearQuietPlaybackKeepalive();
      return;
    }
    playSelectedAlarm({
      volume: quietPhasePlayback.volume,
      durationMs: null,
      loop: true,
      soundFile: quietPhasePlayback.soundFile,
      staircaseQuiet: true,
      skipSetSndFile: true
    });
  }, CUSTOM_QUIET_KEEPALIVE_MS);
}

function finishQuietPhasePlayback() {
  clearQuietPlaybackKeepalive();
  stopSelectedAlarm();
  phaseStopTimer = null;
  quietPlaybackEndsAtMs = null;
  extendMoistureAlarmSuppressMs(POST_PLAYBACK_NATIVE_SUPPRESS_MS);
  if (resumeMicTimer) clearTimeout(resumeMicTimer);
  resumeMicTimer = setTimeout(() => {
    resumeMicTimer = null;
    micPausedForStaircase = false;
    // Mic is intentionally listening for real leaks in the gap before wake — do not keep blocking native callbacks.
    clearMoistureAlarmSuppress();
    startSoundDetection();
  }, MIC_RESUME_DELAY_MS);
}

function scheduleQuietPhaseStop(
  schedule: StaircaseSchedule,
  config: { volume: number; durationMs: number | null; loop: boolean }
) {
  if (config.durationMs == null) return;
  quietPlaybackEndsAtMs = Date.now() + config.durationMs;
  if (phaseStopTimer) clearTimeout(phaseStopTimer);
  phaseStopTimer = setTimeout(finishQuietPhasePlayback, config.durationMs);
  startQuietKeepalive(schedule, config);
}

/** Re-arm stop timer after resume (Calendar polls every second and must not cancel playback). */
function ensureQuietPhaseStopTimer(nowMs = Date.now()) {
  if (quietPlaybackEndsAtMs == null) return;
  if (phaseStopTimer) return;
  const remaining = quietPlaybackEndsAtMs - nowMs;
  if (remaining <= 0) {
    finishQuietPhasePlayback();
    return;
  }
  phaseStopTimer = setTimeout(finishQuietPhasePlayback, remaining);
}

function clearRuntimeTimers() {
  clearPhaseArmTimers();
  if (phaseStopTimer) {
    clearTimeout(phaseStopTimer);
    phaseStopTimer = null;
  }
  if (resumeMicTimer) {
    clearTimeout(resumeMicTimer);
    resumeMicTimer = null;
  }
  quietPlaybackEndsAtMs = null;
  clearQuietPlaybackKeepalive();
  clearWakePlaybackKeepalive();
}

function markPhaseComplete(schedule: StaircaseSchedule, phase: StaircasePhaseId) {
  if (!schedule.completedPhases.includes(phase)) {
    schedule.completedPhases.push(phase);
    writeSchedule(schedule);
  }
}

function phaseFireTimeMs(predictedTimeMs: number, phase: StaircasePhaseId): number {
  return predictedTimeMs + PHASE_OFFSETS_MIN[phase] * MS_PER_MINUTE;
}

/** Next whisper/nudge/wake that has not completed yet (phase may already be playing — marked complete at start). */
function nextPendingStaircasePhaseFireMs(
  schedule: StaircaseSchedule
): { phase: StaircasePhaseId; fireAtMs: number } | null {
  for (const phase of ['whisper', 'nudge', 'wake'] as StaircasePhaseId[]) {
    if (!schedule.completedPhases.includes(phase)) {
      return { phase, fireAtMs: phaseFireTimeMs(schedule.predictedTimeMs, phase) };
    }
  }
  return null;
}

function isStaircaseNightAsleep(schedule: StaircaseSchedule | null): boolean {
  return schedule != null && schedule.nightStartMs > 0;
}

function runPhase(phase: StaircasePhaseId) {
  const schedule = readSchedule();
  if (!schedule) {
    console.warn('[staircase] runPhase skipped — no schedule', phase);
    return;
  }

  if (!isStaircaseNightAsleep(schedule)) {
    console.warn('[staircase] runPhase skipped — user not asleep yet', phase);
    return;
  }

  // Alarm is opt-in per prediction: silent unless the user pressed "Activate" on the box.
  if (!isPredictionAlarmActivated()) {
    console.warn('[staircase] runPhase skipped — not activated', phase);
    return;
  }

  console.log('[staircase] runPhase', phase, new Date().toLocaleTimeString());

  const config = PHASE_CONFIG[phase];

  if (phase === 'wake' && wakePhaseActive) return;

  // Native moisture detection listens to the mic; whisper/nudge would trigger a false "leak" alarm.
  if (phase === 'whisper' || phase === 'nudge') {
    stopSoundDetection();
    micPausedForStaircase = true;
    const suppressMs =
      (config.durationMs ?? 0) + POST_PLAYBACK_NATIVE_SUPPRESS_MS + MIC_RESUME_DELAY_MS + 5_000;
    extendMoistureAlarmSuppressMs(suppressMs);
    // Arm quiet-phase window before audio so HomeScreen never treats playback as a reactive leak.
    if (config.durationMs != null) {
      scheduleQuietPhaseStop(schedule, config);
    }
    playQuietPhaseAlarm(schedule, config);
    wakePhaseActive = false;
    markPhaseComplete(schedule, phase);
    return;
  }

  if (phase === 'wake') {
    playWakePhaseAlarm(schedule);
    startWakeKeepalive(schedule);
    wakePhaseActive = true;
    localStorage.setItem(WAKE_ACTIVE_UNTIL_KEY, String(Date.now() + 12 * 60 * 60_000));
    // Alarm UI is tied to store_alarm + mode on Home; native AlarmTriggered arrives late (mic / suppress),
    // so show the ringing screen immediately with the audio already started above.
    store_alarm.set(1);
    return;
  }
}

function armPhaseTimer(predictedTimeMs: number, phase: StaircasePhaseId) {
  const schedule = readSchedule();
  if (!schedule || schedule.completedPhases.includes(phase)) return;

  const fireAt = phaseFireTimeMs(predictedTimeMs, phase);
  const delayMs = fireAt - Date.now();
  if (delayMs <= 0) {
    runPhase(phase);
    return;
  }

  const timer = setTimeout(() => runPhase(phase), delayMs);
  phaseTimers.push(timer);
}

function armAllPendingPhases(predictedTimeMs: number) {
  const schedule = readSchedule();
  if (!schedule || !isStaircaseNightAsleep(schedule)) return;
  if (!isPredictionAlarmActivated()) return;
  if (wakePhaseActive || isStaircaseWakeActive()) return;

  for (const phase of ['whisper', 'nudge', 'wake'] as StaircasePhaseId[]) {
    if (schedule.completedPhases.includes(phase)) continue;
    const fireAt = phaseFireTimeMs(predictedTimeMs, phase);
    if (fireAt <= Date.now()) {
      runPhase(phase);
      continue;
    }
    armPhaseTimer(predictedTimeMs, phase);
  }
}

export function isStaircaseWakeActive(): boolean {
  if (wakePhaseActive) return true;
  const until = Number(localStorage.getItem(WAKE_ACTIVE_UNTIL_KEY));
  return Number.isFinite(until) && Date.now() < until;
}

/**
 * Ignore reactive moisture / store_alarm while whisper or nudge is active (or its tail).
 * Returns false during between-phase gaps so a real leak still wins — but true while mic
 * is intentionally paused for staircase quiet audio.
 */
export function shouldSuppressReactiveAlarmForStaircase(nowMs: number = Date.now()): boolean {
  if (isStaircaseWakeActive()) return false;
  if (isQuietPhasePlaying(nowMs)) return true;
  if (isWithinTimedMoistureSuppress(nowMs)) return true;
  if (micPausedForStaircase) return true;
  return false;
}

/**
 * Mic is listening between staircase quiet phases (after whisper/nudge fired, before wake).
 * A real sensor beep here should behave like a normal leak night.
 * Not true when the next phase is already due — staircase must run nudge/wake instead.
 */
export function isBetweenStaircasePhases(nowMs: number = Date.now()): boolean {
  if (isStaircaseWakeActive()) return false;
  if (isQuietPhasePlaying(nowMs)) return false;
  if (micPausedForStaircase) return false;

  const schedule = readSchedule();
  if (!schedule || !isStaircaseNightAsleep(schedule)) return false;
  if (!isPredictionAlarmActivated(nowMs)) return false;
  if (schedule.completedPhases.includes('wake')) return false;

  if (
    !schedule.completedPhases.includes('whisper') &&
    !schedule.completedPhases.includes('nudge')
  ) {
    return false;
  }

  const pending = nextPendingStaircasePhaseFireMs(schedule);
  if (pending != null && nowMs >= pending.fireAtMs) {
    return false;
  }

  return true;
}

/** True while an activated predictive staircase owns the night (don't hijack with reactive alarm). */
export function isPredictiveStaircaseInProgress(nowMs: number = Date.now()): boolean {
  if (isStaircaseWakeActive()) return true;
  if (isQuietPhasePlaying(nowMs)) return true;

  const schedule = readSchedule();
  if (!schedule || schedule.completedPhases.includes('wake')) return false;
  if (!isStaircaseNightAsleep(schedule)) return false;

  return isPredictionAlarmActivated(nowMs);
}

export type StaircaseWakeDismissSnapshot = {
  /** 1 = whisper phase, 2 = nudge phase, 3 = full wake phase */
  stageReached: 1 | 2 | 3;
  /** Model target time for this staircase night (same as Calendar prediction target). */
  predictedTime: Date;
};

/**
 * Call immediately before dismissStaircaseWake(). Returns null if this dismiss is not
 * part of a predictive staircase night (e.g. reactive moisture-only alarm).
 */
export function getStaircaseWakeDismissSnapshot(): StaircaseWakeDismissSnapshot | null {
  const schedule = readSchedule();
  const predictedMs = schedule?.predictedTimeMs ?? null;

  if (isStaircaseWakeActive()) {
    if (predictedMs == null) return null;
    return { stageReached: 3, predictedTime: new Date(predictedMs) };
  }

  if (predictedMs == null) return null;

  if (!schedule) return null;

  const c = schedule.completedPhases;
  if (c.includes('wake')) return null;

  if (c.includes('nudge')) {
    return { stageReached: 2, predictedTime: new Date(predictedMs) };
  }
  if (c.includes('whisper')) {
    return { stageReached: 1, predictedTime: new Date(predictedMs) };
  }
  // No phase has fired yet: the user was not woken by the staircase, so there is
  // no alarm resolution to log (plain night stop, not a "wake" event).
  return null;
}

export function cancelPredictiveStaircase() {
  clearRuntimeTimers();
  stopSelectedAlarm();
  wakePhaseActive = false;
  localStorage.removeItem(WAKE_ACTIVE_UNTIL_KEY);
  writeSchedule(null);
  if (micPausedForStaircase) {
    micPausedForStaircase = false;
    startSoundDetection();
  }
  clearMoistureAlarmSuppress();
}

export function dismissStaircaseWake() {
  const schedule = readSchedule();
  if (!isStaircaseWakeActive() && !schedule) return;

  // Advance history cutoff before clearing wake/schedule state (Stop alarm path never hits morning Wake up).
  if (isStaircaseWakeActive()) {
    consumePredictionCycle(Date.now());
  }

  clearWakePlaybackKeepalive();
  stopSelectedAlarm();
  wakePhaseActive = false;
  localStorage.removeItem(WAKE_ACTIVE_UNTIL_KEY);
  clearMoistureAlarmSuppress();
  if (schedule) {
    markPhaseComplete(schedule, 'wake');
    writeSchedule(null);
    // Prediction resolved; next prediction must be activated again.
    deactivatePredictionAlarm();
  }
}

/** "Deactivate" on the prediction box: alarm stays silent until activated again. */
export function deactivatePredictiveStaircaseAlarm() {
  deactivatePredictionAlarm();
  clearRuntimeTimers();
  stopSelectedAlarm();
  wakePhaseActive = false;
  localStorage.removeItem(WAKE_ACTIVE_UNTIL_KEY);
  if (micPausedForStaircase) {
    micPausedForStaircase = false;
    startSoundDetection();
  }
}

/** "Activate" on the prediction box: opt in; timers arm after Go to sleep. */
export function activatePredictiveStaircaseAlarm(
  targetMs: number,
  starts?: EventOopsie[],
  leaks?: EventOopsie[],
  now: Date = new Date(),
  stops: EventOopsie[] = []
) {
  activatePredictionAlarm(targetMs);

  if (starts && leaks) {
    armPredictiveStaircaseFromProjection(starts, leaks, now, stops);
  }

  const schedule = readSchedule();
  if (!schedule) return;

  if (schedule.predictedTimeMs <= now.getTime()) {
    writeSchedule(null);
    return;
  }

  // Timers only arm once the user has tapped Go to sleep (nightStartMs set).
  if (!isStaircaseNightAsleep(schedule)) return;

  // Skip (without playing) any quiet phase whose moment already passed; arm the rest.
  for (const phase of ['whisper', 'nudge'] as StaircasePhaseId[]) {
    if (schedule.completedPhases.includes(phase)) continue;
    if (phaseFireTimeMs(schedule.predictedTimeMs, phase) <= now.getTime()) {
      markPhaseComplete(schedule, phase);
    }
  }

  clearRuntimeTimers();
  armAllPendingPhases(schedule.predictedTimeMs);
  activatePredictionAlarm(schedule.predictedTimeMs);
}

/**
 * Store projected schedule for Calendar (nightStartMs stays 0 until Go to sleep).
 * Phase timers arm only after the user starts the night.
 */
export function armPredictiveStaircaseFromProjection(
  starts: EventOopsie[],
  leaks: EventOopsie[],
  now: Date = new Date(),
  stops: EventOopsie[] = []
): boolean {
  const startsForPrediction = anchorStartsForPredictiveLeakTiming(starts, null);
  const alarmState = computeAlarmState(startsForPrediction, leaks, now, stops, getPredictionHistoryCutoffMs());
  const predictedTimeMs = alarmState.target_alarm_timestamp?.getTime() ?? null;

  if (alarmState.alarm_mode !== 'PREDICTIVE' || !predictedTimeMs) {
    console.warn(
      'Predictive staircase not armed from projection:',
      alarmState.debug?.reason ?? 'not PREDICTIVE'
    );
    return false;
  }

  const wakeAt = phaseFireTimeMs(predictedTimeMs, 'wake');
  if (wakeAt <= now.getTime()) {
    console.warn('Predictive staircase not armed: wake phase already in the past.');
    return false;
  }

  const existing = readSchedule();
  if (existing?.predictedTimeMs === predictedTimeMs) {
    return true;
  }

  if (existing) {
    clearRuntimeTimers();
  }

  const schedule: StaircaseSchedule = {
    predictedTimeMs,
    nightStartMs: 0,
    soundFile: get(txtSndfilename) || 'alarmsound1.mp3',
    completedPhases: []
  };

  for (const phase of ['whisper', 'nudge'] as StaircasePhaseId[]) {
    if (phaseFireTimeMs(predictedTimeMs, phase) <= now.getTime()) {
      markPhaseComplete(schedule, phase);
    }
  }

  writeSchedule(schedule);

  console.log(
    'Predictive staircase schedule stored from projection:',
    new Date(predictedTimeMs).toString()
  );
  return true;
}

export async function schedulePredictiveStaircaseForNight(
  nightStartDate: Date,
  starts: EventOopsie[],
  leaks: EventOopsie[],
  now: Date = new Date(),
  stops: EventOopsie[] = []
): Promise<boolean> {
  const wasActivated = isPredictionAlarmActivated(now.getTime());

  cancelPredictiveStaircase();

  const nightMs = nightStartDate.getTime();
  const startsForPrediction = anchorStartsForPredictiveLeakTiming(starts, nightMs);

  if (!startsForPrediction.length) {
    console.warn('Predictive staircase not scheduled: no starts left after anchoring.');
    if (wasActivated) deactivatePredictionAlarm();
    return false;
  }

  const alarmState = computeAlarmState(startsForPrediction, leaks, now, stops, getPredictionHistoryCutoffMs());
  const predictedTimeMs = alarmState.target_alarm_timestamp?.getTime() ?? null;

  if (alarmState.alarm_mode !== 'PREDICTIVE' || !predictedTimeMs) {
    console.warn(
      'Predictive staircase not scheduled:',
      alarmState.alarm_mode !== 'PREDICTIVE' ? 'not in PREDICTIVE mode' : 'no target time',
      alarmState.debug?.reason ?? ''
    );
    if (wasActivated) deactivatePredictionAlarm();
    return false;
  }

  const wakeAt = phaseFireTimeMs(predictedTimeMs, 'wake');
  if (wakeAt <= now.getTime()) {
    console.warn(
      'Predictive staircase not scheduled: wake phase already in the past.',
      'wakeAt=',
      new Date(wakeAt).toString(),
      'now=',
      now.toString()
    );
    if (wasActivated) deactivatePredictionAlarm();
    return false;
  }

  const schedule: StaircaseSchedule = {
    predictedTimeMs,
    nightStartMs: nightStartDate.getTime(),
    soundFile: get(txtSndfilename) || 'alarmsound1.mp3',
    completedPhases: []
  };
  writeSchedule(schedule);

  // Late Go to sleep: skip quiet phases that already passed, arm the rest.
  for (const phase of ['whisper', 'nudge'] as StaircasePhaseId[]) {
    if (phaseFireTimeMs(predictedTimeMs, phase) <= now.getTime()) {
      markPhaseComplete(schedule, phase);
    }
  }

  armAllPendingPhases(predictedTimeMs);

  // Activate = opt-in; target time always follows tonight's real Go to sleep.
  if (wasActivated) {
    activatePredictionAlarm(predictedTimeMs);
  }

  console.log(
    'Predictive staircase scheduled:',
    new Date(predictedTimeMs).toString(),
    wasActivated ? '(activated)' : '(not activated)',
    schedule.soundFile
  );
  return true;
}

export function resumePredictiveStaircaseIfNeeded(now: Date = new Date()) {
  const schedule = readSchedule();
  if (!schedule || !isStaircaseNightAsleep(schedule)) return;

  if (schedule.predictedTimeMs <= now.getTime() && schedule.completedPhases.includes('wake')) {
    if (!isStaircaseWakeActive()) {
      writeSchedule(null);
    }
    return;
  }

  if (isStaircaseWakeActive()) {
    ensureWakeKeepalive();
    return;
  }

  // Only re-arm phase fire timers — never cancel an in-progress whisper/nudge stop timer
  // (custom recordings ignore native durationMs and rely on JS stopSelectedAlarm).
  clearPhaseArmTimers();
  if (isQuietPhasePlaying(now.getTime())) {
    ensureQuietPhaseStopTimer(now.getTime());
    ensureQuietPhaseKeepalive();
  } else if (micPausedForStaircase && !resumeMicTimer) {
    micPausedForStaircase = false;
    startSoundDetection();
  }
  armAllPendingPhases(schedule.predictedTimeMs);
}

registerMoistureAlarmGate((nowMs) => {
  if (isStaircaseWakeActive()) return false;
  if (isQuietPhasePlaying(nowMs)) return true;
  if (micPausedForStaircase) return true;
  if (isPredictiveStaircaseInProgress(nowMs) && !isBetweenStaircasePhases(nowMs)) return true;
  return false;
});
