// Per-prediction alarm activation (explicit opt-in).
// The staircase alarm is DEACTIVATED by default; the user must press "Activate" on the
// prediction box. While the user is still awake, the box and their activate/deactivate
// choice persist until they tap Go to sleep (clock changes must not clear opt-in).
// After Go to sleep, activation stays on for the staircase until target + grace or Wake up.
// Shared by CalendarScreen, HomeScreen, and PredictiveStaircaseScheduler.

const ACTIVATION_TARGET_KEY = 'predictionAlarmActivationTargetMs';

export const DISMISSED_PREDICTION_KEY = 'dismissedCalendarPredictionSignature';
export const ACTIVE_PREDICTION_SIGNATURE_KEY = 'activeCalendarPredictionSignature';
/** Legacy key from target-time expiry; cleared on read/write for migration. */
export const ACTIVE_PREDICTION_EXPIRES_AT_KEY = 'activeCalendarPredictionExpiresAtMs';

/** Only nights starting after this timestamp count toward the next prediction. */
const PREDICTION_HISTORY_CUTOFF_MS_KEY = 'predictionHistoryCutoffMs';
const STAIRCASE_SCHEDULE_KEY = 'predictiveStaircaseSchedule';

/** Keep activation valid a bit past the overnight target so the wake phase can still fire at T. */
const ACTIVATION_GRACE_MS = 60 * 60_000;

function isStaircaseNightStarted(): boolean {
  try {
    const raw = localStorage.getItem(STAIRCASE_SCHEDULE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { nightStartMs?: number };
    return typeof parsed?.nightStartMs === 'number' && parsed.nightStartMs > 0;
  } catch {
    return false;
  }
}

export function activatePredictionAlarm(targetMs: number) {
  localStorage.setItem(ACTIVATION_TARGET_KEY, String(targetMs));
}

export function deactivatePredictionAlarm() {
  localStorage.removeItem(ACTIVATION_TARGET_KEY);
}

export function isPredictionAlarmActivated(nowMs: number = Date.now()): boolean {
  const raw = localStorage.getItem(ACTIVATION_TARGET_KEY);
  if (!raw) return false;
  const targetMs = Number(raw);
  if (!Number.isFinite(targetMs)) return false;

  // Awake: keep opt-in until Go to sleep — not tied to projected target time or manual clock changes.
  if (!isStaircaseNightStarted()) return true;

  // Asleep: allow staircase through target + grace, then stop treating as activated.
  return nowMs <= targetMs + ACTIVATION_GRACE_MS;
}

/** Clear Calendar prediction UI keys (box, dismiss state, legacy expiry). */
export function clearCalendarPredictionUi() {
  localStorage.removeItem(ACTIVE_PREDICTION_SIGNATURE_KEY);
  localStorage.removeItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY);
  localStorage.removeItem(DISMISSED_PREDICTION_KEY);
}

/**
 * Hide the calendar prediction offer when the user starts the next night (Go to sleep).
 * Activated staircases keep running. History cutoff does not move here — only after
 * the user activated a prediction and that cycle completes (consumePredictionCycle).
 */
export function expirePredictionOfferForSleepStart(_sleepStartMs: number) {
  if (!localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)) return;
  clearCalendarPredictionUi();
}

export function getPredictionHistoryCutoffMs(): number | null {
  const raw = localStorage.getItem(PREDICTION_HISTORY_CUTOFF_MS_KEY);
  if (!raw) return null;
  const ms = Number(raw);
  return Number.isFinite(ms) ? ms : null;
}

/** After a prediction cycle ends, only later nights may inform the next prediction. */
export function advancePredictionHistoryCutoff(cutoffMs: number) {
  if (!Number.isFinite(cutoffMs)) return;
  localStorage.setItem(PREDICTION_HISTORY_CUTOFF_MS_KEY, String(cutoffMs));
}

/** True if this completed night had an offered/activated prediction cycle. */
export function hadActivePredictionCycle(): boolean {
  if (isPredictionAlarmActivated()) return true;
  if (localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)) return true;
  if (localStorage.getItem(STAIRCASE_SCHEDULE_KEY)) return true;
  return false;
}

/**
 * End the current one-night prediction cycle (after Wake up or staircase dismiss).
 * History cutoff advances only when the user had activated the prediction for that cycle.
 */
export function consumePredictionCycle(completedAtMs: number = Date.now()) {
  // Key presence = user pressed Activate for this cycle (may outlive target + grace by morning).
  const wasActivated = localStorage.getItem(ACTIVATION_TARGET_KEY) != null;
  deactivatePredictionAlarm();
  clearCalendarPredictionUi();
  if (wasActivated) {
    advancePredictionHistoryCutoff(completedAtMs);
  }
}
