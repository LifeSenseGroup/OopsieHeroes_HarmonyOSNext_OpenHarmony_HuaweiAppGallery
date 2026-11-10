import { OopsieEvent } from './OopsieEvent';
import { estimateCase9Delay } from './Case9Estimator';
import { groupSleepStartIndexes, selectAlternateCase } from './PredictionCases';

export type AlarmMode = 'PREDICTIVE' | 'REACTIVE';

export type AlarmState = {
  alarm_mode: AlarmMode;
  /** Predicted first-leak time (T): full wake phase fires here; whisper/nudge are T−15 / T−7. */
  target_alarm_timestamp: Date | null;
  refill_target_alarm_timestamp: Date | null;
  /** Minutes after Go to sleep until the predicted first leak / full wake alarm (T). */
  predicted_toilet_visit_minutes_after_sleep: number | null;
  confidence: {
    sampleCount: number;
    stdDevMinutes: number | null;
    dryStreakNights: number;
  };
  debug: {
    weightedDeltaMinutes: number | null;
    firstEventDeltasMinutes: number[];
    refillDeltasMinutes: number[];
    reason: string;
  };
  /** 1–9 when a case produced T. Absent in reactive mode. */
  case_id?: number | null;
};

export type PredictiveState = {
  shouldPredict: boolean;
  targetTime: number | null;
  confidence: number;
  predictedToiletVisitMinutesAfterSleep: number | null;
  /** 1–9 when a case supplied the alarm. */
  caseId?: number;
};

type NightRecord = {
  onset: Date;
  leaks: OopsieEvent[];
};

const MAX_NIGHTS = 8;
const PREDICTION_LEAD_MINUTES = 15;
const STABILITY_STDDEV_LIMIT_MINUTES = 60;
/** Minimum completed nights with at least one leak before predictive mode is offered. */
const MIN_LEAK_NIGHTS_FOR_PREDICTION = 3;
const VARIANCE_GATE_NIGHTS = 8;
const SLIDING_WINDOW_MINUTES = 60;
const CONFIDENCE_THRESHOLD = 0.6;
const RECENT_DOUBLE_WEIGHT_COUNT = 3;

type WeightedDeltaSample = {
  deltaMinutes: number;
  weight: number;
};

interface StartStamp {
  s: OopsieEvent;
  t: number;
}

interface LeakStamp {
  event: OopsieEvent;
  at: Date;
}

function asValidDate(value: Date | null | undefined): Date | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }
  return null;
}

function eventOnsetMs(ev: OopsieEvent): number | null {
  const d = asValidDate(ev?.date);
  return d ? d.getTime() : null;
}

/**
 * A daytime "Go to sleep" row must not replace the prior evening as the statistical
 * bedtime onset, or the predicted leak window (and staircase phases) shift by many hours.
 *
 * - Staircase: pass `sessionStartMs` = the tap time so that row is dropped when a prior
 *   evening onset exists.
 * - Calendar: pass `null`; if the newest start is daytime and the previous is an evening
 *   onset, drop the newest start for the same anchor the staircase uses.
 */
export function anchorStartsForPredictiveLeakTiming(
  starts: OopsieEvent[],
  sessionStartMs?: number | null
): OopsieEvent[] {
  if (!starts.length) return starts;

  const isEveningOrNightHour = (ms: number) => {
    const h = new Date(ms).getHours();
    return h >= 18 || h <= 4;
  };
  const isDaytimeHour = (ms: number) => {
    const h = new Date(ms).getHours();
    return h >= 5 && h <= 16;
  };

  if (sessionStartMs != null) {
    if (!isDaytimeHour(sessionStartMs)) return starts;

    const hasPriorEvening = starts.some((s) => {
      const t = eventOnsetMs(s);
      return t != null && t < sessionStartMs - 30_000 && isEveningOrNightHour(t);
    });
    if (!hasPriorEvening) return starts;

    return starts.filter((s) => {
      const t = eventOnsetMs(s);
      return t == null || Math.abs(t - sessionStartMs) > 10_000;
    });
  }

  const withT: StartStamp[] = [];
  for (let i = 0; i < starts.length; i++) {
    const t = eventOnsetMs(starts[i]);
    if (t != null) {
      withT.push({ s: starts[i], t: t });
    }
  }
  withT.sort((a, b) => b.t - a.t);

  if (withT.length < 2) return starts;
  const latest = withT[0];
  const second = withT[1];
  if (isDaytimeHour(latest.t) && isEveningOrNightHour(second.t)) {
    return starts.filter((s) => {
      const t = eventOnsetMs(s);
      return t == null || Math.abs(t - latest.t) > 10_000;
    });
  }
  return starts;
}

function toMinutes(ms: number): number {
  return ms / 60_000;
}

function filterEventsAfterCutoff(events: OopsieEvent[], cutoffMs: number | null): OopsieEvent[] {
  if (cutoffMs == null) return events;
  return events.filter((ev) => {
    const at = asValidDate(ev?.date);
    return at != null && at.getTime() > cutoffMs;
  });
}

function buildNightRecords(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  stops: OopsieEvent[] = []
): NightRecord[] {
  const startTimes: Date[] = [];
  for (let i = 0; i < starts.length; i++) {
    const at = asValidDate(starts[i].date);
    if (at != null) {
      startTimes.push(at);
    }
  }
  startTimes.sort((a, b) => a.getTime() - b.getTime());

  const leakEvents: LeakStamp[] = [];
  for (let i = 0; i < leaks.length; i++) {
    const at = asValidDate(leaks[i].date);
    if (at != null) {
      leakEvents.push({ event: leaks[i], at: at });
    }
  }
  leakEvents.sort((a, b) => a.at.getTime() - b.at.getTime());
  const stopTimes: number[] = [];
  for (let i = 0; i < stops.length; i++) {
    const at = asValidDate(stops[i].date);
    if (at != null) {
      stopTimes.push(at.getTime());
    }
  }
  stopTimes.sort((a, b) => a - b);

  if (!startTimes.length) return [];

  // Stop alarm, then Go to sleep again, stays one night. Wake up, or the next
  // evening's Go to sleep, starts another. Leaks in the night share the first bedtime.
  const groups = groupSleepStartIndexes(
    startTimes.map((onset) => onset.getTime()),
    leakEvents.map((leak) => leak.at.getTime()),
    stopTimes
  );
  return groups.map((group) => {
    const onset = startTimes[group[0]];
    const nextOnset = startTimes[group[group.length - 1] + 1] ?? null;
    const leaksForNight = leakEvents
      .filter(({ at }) => {
        const leakMs = at.getTime();
        if (leakMs < onset.getTime()) return false;
        if (nextOnset && leakMs >= nextOnset.getTime()) return false;
        return true;
      })
      .map(({ event }) => event);
    return { onset, leaks: leaksForNight };
  });
}

function standardDeviation(values: number[]): number | null {
  if (!values.length) return null;
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

/** Latest night still open: asleep, no leak yet, no Wake up stop recorded. */
function isLatestNightInProgress(
  nightsNewestFirst: NightRecord[],
  stops: OopsieEvent[]
): boolean {
  const latest = nightsNewestFirst[0];
  if (!latest || latest.leaks.length > 0) return false;

  const onsetMs = latest.onset.getTime();
  return !stops.some((s) => {
    const at = asValidDate(s?.date);
    return at != null && at.getTime() > onsetMs;
  });
}

/**
 * Wet nights from the most recent completed night backward, stopping at the first dry night.
 * A dry night or an activated prediction cycle (history cutoff) resets eligibility — only
 * the trailing consecutive wet run counts toward the next offer.
 */
function getConsecutiveLeakStreakFromNewest(
  nightsNewestFirst: NightRecord[],
  stops: OopsieEvent[] = []
): NightRecord[] {
  const streak: NightRecord[] = [];
  const startIndex = isLatestNightInProgress(nightsNewestFirst, stops) ? 1 : 0;

  for (let i = startIndex; i < nightsNewestFirst.length; i++) {
    const night = nightsNewestFirst[i];
    if (night.leaks.length > 0) {
      streak.push(night);
      continue;
    }
    const laterOnsetMs = i > 0 ? nightsNewestFirst[i - 1].onset.getTime() : null;
    // A wake with no leak is dry and ends the run. A night with neither is unused.
    if (nightHasWake(night.onset.getTime(), laterOnsetMs, stops)) {
      break;
    }
  }
  return streak;
}

function nightHasWake(onsetMs: number, laterOnsetMs: number | null, stops: OopsieEvent[]): boolean {
  for (let i = 0; i < stops.length; i++) {
    const at = asValidDate(stops[i].date);
    if (at == null) {
      continue;
    }
    const ms = at.getTime();
    if (ms > onsetMs && (laterOnsetMs == null || ms < laterOnsetMs)) {
      return true;
    }
  }
  return false;
}

function hasMinimumConsecutiveLeakNights(
  nightsNewestFirst: NightRecord[],
  stops: OopsieEvent[] = []
): boolean {
  return (
    getConsecutiveLeakStreakFromNewest(nightsNewestFirst, stops).length >=
    MIN_LEAK_NIGHTS_FOR_PREDICTION
  );
}

/** Post-cutoff nights in the current consecutive wet streak (max MAX_NIGHTS) — sole input for prediction math. */
function getPredictionComputationNights(
  nightsNewestFirst: NightRecord[],
  stops: OopsieEvent[] = []
): NightRecord[] {
  return getConsecutiveLeakStreakFromNewest(nightsNewestFirst, stops).slice(0, MAX_NIGHTS);
}

function leakDate(event: OopsieEvent): Date | null {
  return asValidDate(event?.date);
}

function conservativeReactiveState(confidence: number): PredictiveState {
  return { shouldPredict: false, targetTime: null, confidence, predictedToiletVisitMinutesAfterSleep: null };
}

/** Human-readable offset for mission copy, e.g. "12h 30m" or "45 min". */
export function formatMinutesAfterSleep(totalMinutes: number): string {
  const rounded = Math.max(1, Math.round(totalMinutes));
  if (rounded < 60) {
    return `${rounded} min`;
  }
  const hours = Math.floor(rounded / 60);
  const mins = rounded % 60;
  if (mins === 0) {
    return hours === 1 ? '1 hour' : `${hours} hours`;
  }
  return `${hours}h ${mins}m`;
}

export function isSleepNightOpen(starts: OopsieEvent[], stops: OopsieEvent[], leaks: OopsieEvent[]): boolean {
  let startMs: number | null = null;
  for (let i = 0; i < starts.length; i++) {
    const at = starts[i].date instanceof Date ? starts[i].date.getTime() : NaN;
    if (Number.isFinite(at) && (startMs == null || at > startMs)) {
      startMs = at;
    }
  }
  if (startMs == null) {
    return false;
  }
  for (let i = 0; i < stops.length; i++) {
    if (stops[i].date instanceof Date && stops[i].date.getTime() > startMs) {
      return false;
    }
  }
  for (let i = 0; i < leaks.length; i++) {
    if (leaks[i].date instanceof Date && leaks[i].date.getTime() > startMs) {
      return false;
    }
  }
  return true;
}

export function predictionBoxText(totalMinutes: number): string {
  return `Toilet visit ~${formatMinutesAfterSleep(totalMinutes)} after going to sleep`;
}

function findPeakSlidingWindow(samples: WeightedDeltaSample[]): { start: number; peakWeight: number } | null {
  if (!samples.length) return null;
  const sorted = samples.slice().sort((a, b) => a.deltaMinutes - b.deltaMinutes);

  let bestStart = sorted[0].deltaMinutes;
  let bestWeight = -1;
  let runningWeight = 0;
  let right = 0;

  for (let left = 0; left < sorted.length; left++) {
    const windowStart = sorted[left].deltaMinutes;
    while (
      right < sorted.length &&
      sorted[right].deltaMinutes < windowStart + SLIDING_WINDOW_MINUTES
    ) {
      runningWeight += sorted[right].weight;
      right += 1;
    }

    if (runningWeight > bestWeight || (runningWeight === bestWeight && windowStart < bestStart)) {
      bestWeight = runningWeight;
      bestStart = windowStart;
    }

    runningWeight -= sorted[left].weight;
  }

  return bestWeight > 0 ? { start: bestStart, peakWeight: bestWeight } : null;
}

function medianMinutesIntoDay(dates: Date[]): number | null {
  if (!dates.length) return null;
  const mins = dates.map((d) => d.getHours() * 60 + d.getMinutes()).sort((a, b) => a - b);
  const mid = Math.floor(mins.length / 2);
  return mins.length % 2 ? mins[mid] : Math.round((mins[mid - 1] + mins[mid]) / 2);
}

/** Next upcoming bedtime at the user's typical sleep-start time (today or tomorrow). */
export function projectNextSleepOnset(historicalOnsets: Date[], now: Date = new Date()): Date | null {
  const medianMin = medianMinutesIntoDay(historicalOnsets);
  if (medianMin == null) return null;

  const candidate = new Date(now);
  candidate.setSeconds(0, 0);
  candidate.setHours(Math.floor(medianMin / 60), medianMin % 60, 0, 0);

  if (candidate.getTime() <= now.getTime()) {
    candidate.setDate(candidate.getDate() + 1);
  }
  return candidate;
}

/**
 * Calendar / pre-bedtime: project from typical bedtime when tonight hasn't started.
 * Active measuring night (asleep, no stop yet): use the real Go-to-sleep time.
 */
function resolveOnsetForTarget(
  nightsNewestFirst: NightRecord[],
  computationNightsNewestFirst: NightRecord[],
  stops: OopsieEvent[],
  now: Date
): Date | null {
  const latest = nightsNewestFirst[0];
  if (!latest) return null;

  const latestOnsetMs = latest.onset.getTime();
  const stoppedAfterLatestStart = stops.some((s) => {
    const at = asValidDate(s?.date);
    return at != null && at.getTime() > latestOnsetMs;
  });

  if (latest.leaks.length === 0 && !stoppedAfterLatestStart) {
    return latest.onset;
  }

  const bedtimes = computationNightsNewestFirst.map((n) => n.onset);
  const onsets = bedtimes.length ? bedtimes : nightsNewestFirst.map((n) => n.onset);
  return projectNextSleepOnset(onsets, now);
}

/** After predicted leak time (T) passes, roll bedtime forward to the next cycle. */
export function advanceOnsetUntilFutureTarget(
  onset: Date,
  predictedLeakMinutesAfterSleep: number,
  now: Date,
  maxDays = 14
): { onset: Date; targetMs: number } | null {
  const candidate = new Date(onset.getTime());
  for (let day = 0; day <= maxDays; day++) {
    if (day > 0) {
      candidate.setDate(candidate.getDate() + 1);
    }
    const targetMs = candidate.getTime() + predictedLeakMinutesAfterSleep * 60_000;
    if (targetMs > now.getTime()) {
      return { onset: new Date(candidate.getTime()), targetMs };
    }
  }
  return null;
}

function getCase1PredictiveState(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  now: Date = new Date(),
  stops: OopsieEvent[] = [],
  historyCutoffMs: number | null = null
): PredictiveState {
  const startsForEngine = filterEventsAfterCutoff(starts, historyCutoffMs);
  const leaksForEngine = filterEventsAfterCutoff(leaks, historyCutoffMs);
  const stopsForEngine = filterEventsAfterCutoff(stops, historyCutoffMs);

  const nightsAsc = buildNightRecords(startsForEngine, leaksForEngine, stopsForEngine);
  const nights = nightsAsc
    .filter((n) => n.onset.getTime() <= now.getTime())
    .sort((a, b) => b.onset.getTime() - a.onset.getTime())
    .slice(0, MAX_NIGHTS);

  if (!nights.length) return conservativeReactiveState(0);

  const computationNights = getPredictionComputationNights(nights, stopsForEngine);
  if (computationNights.length < MIN_LEAK_NIGHTS_FOR_PREDICTION) return conservativeReactiveState(0);

  const onsetForTarget = resolveOnsetForTarget(nights, computationNights, stopsForEngine, now);
  if (!onsetForTarget) return conservativeReactiveState(0);

  const weightedSamples: WeightedDeltaSample[] = [];
  for (let nightIndex = 0; nightIndex < computationNights.length; nightIndex++) {
    const night = computationNights[nightIndex];
    const firstLeakAt = leakDate(night.leaks[0]);
    if (!firstLeakAt) {
      continue;
    }
    const deltaMinutes = toMinutes(firstLeakAt.getTime() - night.onset.getTime());
    if (!Number.isFinite(deltaMinutes) || deltaMinutes <= 0 || deltaMinutes > 12 * 60) {
      continue;
    }
    weightedSamples.push({
      deltaMinutes: deltaMinutes,
      weight: nightIndex < RECENT_DOUBLE_WEIGHT_COUNT ? 2 : 1
    });
  }

  const firstEventDeltas = weightedSamples.map((sample) => sample.deltaMinutes);

  if (!firstEventDeltas.length) return conservativeReactiveState(0);

  const sigmaGateDeltas = computationNights
    .slice(0, VARIANCE_GATE_NIGHTS)
    .map((n) => {
      const firstLeakAt = leakDate(n.leaks[0]);
      return firstLeakAt ? toMinutes(firstLeakAt.getTime() - n.onset.getTime()) : NaN;
    })
    .filter((m) => Number.isFinite(m) && m > 0 && m <= 12 * 60);
  const sigma = standardDeviation(sigmaGateDeltas);
  if (sigma == null || sigma > STABILITY_STDDEV_LIMIT_MINUTES) {
    return conservativeReactiveState(0);
  }

  const totalWeight = weightedSamples.reduce((sum, sample) => sum + sample.weight, 0);
  const peakWindow = findPeakSlidingWindow(weightedSamples);
  if (!peakWindow || totalWeight <= 0) return conservativeReactiveState(0);

  const confidence = peakWindow.peakWeight / totalWeight;
  if (!Number.isFinite(confidence) || confidence < CONFIDENCE_THRESHOLD) {
    return conservativeReactiveState(Math.max(0, confidence || 0));
  }

  // Sleep hygiene first:
  // - The pre-wake buffer (~15 min) aims to catch the transition toward lighter sleep stages
  //   before the likely accident window. This aligns with sleep-stage transition timing.
  // - Conservative triggering helps avoid unnecessary arousals and respects circadian/vasopressin
  //   rhythms by only acting when pattern density is high.
  const advanced = advanceOnsetUntilFutureTarget(onsetForTarget, peakWindow.start, now);
  if (!advanced) return conservativeReactiveState(confidence);

  return {
    shouldPredict: true,
    targetTime: advanced.targetMs,
    confidence,
    predictedToiletVisitMinutesAfterSleep: peakWindow.start,
    caseId: 1
  };
}

function resolveAlternateOnset(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  stops: OopsieEvent[],
  now: Date
): Date | null {
  const nights = buildNightRecords(starts, leaks, stops)
    .filter((night) => night.onset.getTime() <= now.getTime())
    .sort((a, b) => b.onset.getTime() - a.onset.getTime());
  if (!nights.length) return null;
  const sliced = nights.slice(0, MAX_NIGHTS);
  const computationNights = getPredictionComputationNights(sliced, stops);
  return resolveOnsetForTarget(sliced, computationNights, stops, now);
}

interface DetailedNight {
  onset: Date;
  delayMin: number | null;
  wet: boolean;
  unused: boolean;
  dry: boolean;
  wakeMs: number | null;
  firstValidLeakMs: number | null;
}

function calendarDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

function buildDetailedNights(starts: OopsieEvent[], leaks: OopsieEvent[], stops: OopsieEvent[]): DetailedNight[] {
  const records = buildNightRecords(starts, leaks, stops);
  const detailed: DetailedNight[] = [];
  for (let i = 0; i < records.length; i++) {
    const onsetMs = records[i].onset.getTime();
    const nextMs = i + 1 < records.length ? records[i + 1].onset.getTime() : null;
    const wakeMs = firstWakeMs(onsetMs, nextMs, stops);
    let delayMin: number | null = null;
    let firstValidLeakMs: number | null = null;
    if (records[i].leaks.length > 0) {
      const first = asValidDate(records[i].leaks[0].date);
      if (first != null) {
        const minutes = (first.getTime() - onsetMs) / 60000;
        if (minutes > 0 && minutes <= 12 * 60) {
          delayMin = minutes;
          firstValidLeakMs = first.getTime();
        }
      }
    }
    const wet = records[i].leaks.length > 0;
    detailed.push({
      onset: records[i].onset,
      delayMin: delayMin,
      wet: wet,
      unused: !wet && wakeMs == null,
      dry: !wet && wakeMs != null,
      wakeMs: wakeMs,
      firstValidLeakMs: firstValidLeakMs
    });
  }
  return detailed;
}

function firstWakeMs(onsetMs: number, nextMs: number | null, stops: OopsieEvent[]): number | null {
  let wake: number | null = null;
  for (let i = 0; i < stops.length; i++) {
    const at = asValidDate(stops[i].date);
    if (at == null) {
      continue;
    }
    const ms = at.getTime();
    if (ms > onsetMs && (nextMs == null || ms < nextMs) && (wake == null || ms < wake)) {
      wake = ms;
    }
  }
  return wake;
}

function case9PausedByDryRun(nights: DetailedNight[]): boolean {
  let dryRun = 0;
  let paused = false;
  for (let i = 0; i < nights.length; i++) {
    const night = nights[i];
    if (night.unused) {
      continue;
    }
    if (night.wet) {
      dryRun = 0;
      paused = false;
      continue;
    }
    if (night.dry) {
      dryRun += 1;
      if (dryRun >= 3) {
        paused = true;
      }
    }
  }
  return paused;
}

function case9Unlocked(nights: DetailedNight[], cutoffMs: number | null): boolean {
  if (cutoffMs == null) {
    return true;
  }
  for (let i = 0; i < nights.length; i++) {
    const night = nights[i];
    if (!night.wet) {
      continue;
    }
    if (night.onset.getTime() >= cutoffMs) {
      return true;
    }
    if (night.firstValidLeakMs != null && night.firstValidLeakMs >= cutoffMs) {
      return true;
    }
    if (night.wakeMs != null && night.wakeMs >= cutoffMs) {
      return true;
    }
  }
  return false;
}

function getCase9PredictiveState(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  stops: OopsieEvent[],
  now: Date,
  historyCutoffMs: number | null
): PredictiveState {
  const nights = buildDetailedNights(starts, leaks, stops)
    .filter((night) => night.onset.getTime() <= now.getTime());
  if (!nights.length || case9PausedByDryRun(nights) || !case9Unlocked(nights, historyCutoffMs)) {
    return conservativeReactiveState(0);
  }

  const newest = nights[nights.length - 1];
  const inProgress = newest.unused;
  let tonight: Date | null = null;
  if (inProgress) {
    tonight = newest.onset;
  } else {
    const leakOnsets: Date[] = [];
    for (let i = 0; i < nights.length; i++) {
      if (nights[i].delayMin != null) {
        leakOnsets.push(nights[i].onset);
      }
    }
    tonight = projectNextSleepOnset(leakOnsets, now);
  }
  if (tonight == null) {
    return conservativeReactiveState(0);
  }

  const tonightDay = calendarDayNumber(tonight);
  const retainedDelays: number[] = [];
  const retainedDays: number[] = [];
  const retainedOnsets: Date[] = [];
  for (let i = 0; i < nights.length; i++) {
    const night = nights[i];
    if (night.delayMin == null) {
      continue;
    }
    const day = calendarDayNumber(night.onset);
    if (day < tonightDay - 7 || day > tonightDay) {
      continue;
    }
    retainedDelays.push(night.delayMin);
    retainedDays.push(day);
    retainedOnsets.push(night.onset);
  }
  if (retainedDelays.length < 3) {
    return conservativeReactiveState(0);
  }
  const delay = estimateCase9Delay(retainedDelays, retainedDays);
  if (delay == null || !Number.isFinite(delay) || delay <= 0) {
    return conservativeReactiveState(0);
  }

  const anchor = inProgress ? newest.onset : projectNextSleepOnset(retainedOnsets, now);
  if (anchor == null) {
    return conservativeReactiveState(0);
  }
  const advanced = advanceOnsetUntilFutureTarget(anchor, delay, now);
  if (!advanced) {
    return conservativeReactiveState(0);
  }
  return {
    shouldPredict: true,
    targetTime: advanced.targetMs,
    confidence: Math.min(1, retainedDelays.length / 8),
    predictedToiletVisitMinutesAfterSleep: delay,
    caseId: 9
  };
}

export function getPredictiveState(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  now: Date = new Date(),
  stops: OopsieEvent[] = [],
  historyCutoffMs: number | null = null
): PredictiveState {
  const case1 = getCase1PredictiveState(starts, leaks, now, stops, historyCutoffMs);
  if (case1.shouldPredict) return case1;

  const startsForEngine = filterEventsAfterCutoff(starts, historyCutoffMs);
  const leaksForEngine = filterEventsAfterCutoff(leaks, historyCutoffMs);
  const stopsForEngine = filterEventsAfterCutoff(stops, historyCutoffMs);
  const tonightOnset = resolveAlternateOnset(startsForEngine, leaksForEngine, stopsForEngine, now);
  if (tonightOnset) {
    const alternate = selectAlternateCase(startsForEngine, leaksForEngine, stopsForEngine, tonightOnset);
    if (alternate) {
      const advanced = advanceOnsetUntilFutureTarget(tonightOnset, alternate.delayMin, now);
      if (advanced) {
        return {
          shouldPredict: true,
          targetTime: advanced.targetMs,
          confidence: alternate.confidence,
          predictedToiletVisitMinutesAfterSleep: alternate.delayMin,
          caseId: alternate.caseId
        };
      }
    }
  }

  const case9 = getCase9PredictiveState(starts, leaks, stops, now, historyCutoffMs);
  if (case9.shouldPredict) {
    return case9;
  }
  return case1;
}

export function computeAlarmState(
  starts: OopsieEvent[],
  leaks: OopsieEvent[],
  now: Date = new Date(),
  stops: OopsieEvent[] = [],
  historyCutoffMs: number | null = null
): AlarmState {
  const predictiveState = getPredictiveState(starts, leaks, now, stops, historyCutoffMs);

  const startsForEngine = filterEventsAfterCutoff(starts, historyCutoffMs);
  const leaksForEngine = filterEventsAfterCutoff(leaks, historyCutoffMs);

  const stopsForEngine = filterEventsAfterCutoff(stops, historyCutoffMs);
  const nightsAsc = buildNightRecords(startsForEngine, leaksForEngine, stopsForEngine);
  const nights = nightsAsc
    .filter((n) => n.onset.getTime() <= now.getTime())
    .sort((a, b) => b.onset.getTime() - a.onset.getTime())
    .slice(0, MAX_NIGHTS);

  if (!nights.length) {
    if (predictiveState.shouldPredict && predictiveState.targetTime != null) {
      const alternateCase = predictiveState.caseId != null && predictiveState.caseId > 1;
      return {
        alarm_mode: 'PREDICTIVE',
        target_alarm_timestamp: new Date(predictiveState.targetTime),
        refill_target_alarm_timestamp: null,
        predicted_toilet_visit_minutes_after_sleep: predictiveState.predictedToiletVisitMinutesAfterSleep,
        confidence: {
          sampleCount: 0,
          stdDevMinutes: null,
          dryStreakNights: 0
        },
        debug: {
          weightedDeltaMinutes: predictiveState.targetTime,
          firstEventDeltasMinutes: [],
          refillDeltasMinutes: [],
          reason: alternateCase
            ? `Case ${predictiveState.caseId} timing model supports a predictive alarm ${predictiveState.predictedToiletVisitMinutesAfterSleep} min after sleep.`
            : `High-density cluster confidence ${(predictiveState.confidence * 100).toFixed(0)}% supports predictive pre-wake window (projected from history until Go to sleep).`
        },
        case_id: predictiveState.caseId ?? null
      };
    }
    return {
      alarm_mode: 'REACTIVE',
      target_alarm_timestamp: null,
      refill_target_alarm_timestamp: null,
      predicted_toilet_visit_minutes_after_sleep: null,
      confidence: {
        sampleCount: 0,
        stdDevMinutes: null,
        dryStreakNights: 0
      },
      debug: {
        weightedDeltaMinutes: null,
        firstEventDeltasMinutes: [],
        refillDeltasMinutes: [],
        reason: 'No valid sleep-onset records.'
      }
    };
  }

  const computationNights = getPredictionComputationNights(nights, stops);

  const firstEventDeltas = computationNights
    .map((n) => {
      const firstLeakAt = leakDate(n.leaks[0]);
      return firstLeakAt ? toMinutes(firstLeakAt.getTime() - n.onset.getTime()) : NaN;
    })
    .filter((m) => Number.isFinite(m) && m > 0);

  const sigmaGateDeltas = computationNights
    .slice(0, VARIANCE_GATE_NIGHTS)
    .map((n) => {
      const firstLeakAt = leakDate(n.leaks[0]);
      return firstLeakAt ? toMinutes(firstLeakAt.getTime() - n.onset.getTime()) : NaN;
    })
    .filter((m) => Number.isFinite(m) && m > 0);

  // Separate model for second accidents in the same night (refill behavior).
  const refillDeltas = computationNights
    .map((n) => n.leaks)
    .filter((nightLeaks) => nightLeaks.length >= 2)
    .map((nightLeaks) => {
      const first = leakDate(nightLeaks[0]);
      const second = leakDate(nightLeaks[1]);
      return first && second ? toMinutes(second.getTime() - first.getTime()) : NaN;
    })
    .filter((m) => Number.isFinite(m) && m > 0);

  const sigma = standardDeviation(sigmaGateDeltas);

  let dryStreak = 0;
  for (const n of nights) {
    if (n.leaks.length === 0) {
      dryStreak += 1;
      continue;
    }
    break;
  }

  if (predictiveState.shouldPredict && predictiveState.targetTime != null) {
    const alternateCase = predictiveState.caseId != null && predictiveState.caseId > 1;
    return {
      alarm_mode: 'PREDICTIVE',
      target_alarm_timestamp: new Date(predictiveState.targetTime),
      refill_target_alarm_timestamp: null,
      predicted_toilet_visit_minutes_after_sleep: predictiveState.predictedToiletVisitMinutesAfterSleep,
      confidence: {
        sampleCount: firstEventDeltas.length,
        stdDevMinutes: sigma,
        dryStreakNights: dryStreak
      },
      debug: {
        weightedDeltaMinutes: predictiveState.targetTime,
        firstEventDeltasMinutes: firstEventDeltas,
        refillDeltasMinutes: refillDeltas,
        reason: alternateCase
          ? `Case ${predictiveState.caseId} timing model supports a predictive alarm ${predictiveState.predictedToiletVisitMinutesAfterSleep} min after sleep.`
          : `High-density cluster confidence ${(predictiveState.confidence * 100).toFixed(0)}% supports predictive pre-wake window (projected from history until Go to sleep).`
      },
      case_id: predictiveState.caseId ?? null
    };
  }

  // Physiological rationale:
  // - Stable accident timing (low sigma) suggests predictable nighttime bladder pressure
  //   and a relatively consistent arousal threshold.
  // - Predicting ~15 minutes before the expected event allows a gentle pre-wake before
  //   crossing the threshold that usually leads to a leak.
  if (!hasMinimumConsecutiveLeakNights(nights, stops)) {
    const streakLen = getConsecutiveLeakStreakFromNewest(nights, stops).length;
    return {
      alarm_mode: 'REACTIVE',
      target_alarm_timestamp: null,
      refill_target_alarm_timestamp: null,
      predicted_toilet_visit_minutes_after_sleep: null,
      confidence: {
        sampleCount: firstEventDeltas.length,
        stdDevMinutes: sigma,
        dryStreakNights: dryStreak
      },
      debug: {
        weightedDeltaMinutes: predictiveState.targetTime,
        firstEventDeltasMinutes: firstEventDeltas,
        refillDeltasMinutes: refillDeltas,
        reason:
          historyCutoffMs != null
            ? `Need ${MIN_LEAK_NIGHTS_FOR_PREDICTION} consecutive leak nights after last activated prediction (${streakLen}/${MIN_LEAK_NIGHTS_FOR_PREDICTION} in current streak).`
            : `Need ${MIN_LEAK_NIGHTS_FOR_PREDICTION} consecutive completed nights with a leak (${streakLen}/${MIN_LEAK_NIGHTS_FOR_PREDICTION} in current streak; a dry night resets the count).`
      }
    };
  }

  if (!firstEventDeltas.length || sigma == null) {
    return {
      alarm_mode: 'REACTIVE',
      target_alarm_timestamp: null,
      refill_target_alarm_timestamp: null,
      predicted_toilet_visit_minutes_after_sleep: null,
      confidence: {
        sampleCount: firstEventDeltas.length,
        stdDevMinutes: sigma,
        dryStreakNights: dryStreak
      },
      debug: {
        weightedDeltaMinutes: predictiveState.targetTime,
        firstEventDeltasMinutes: firstEventDeltas,
        refillDeltasMinutes: refillDeltas,
        reason: 'Insufficient leak history for predictive calculation.'
      }
    };
  }

  if (sigma > STABILITY_STDDEV_LIMIT_MINUTES) {
    return {
      alarm_mode: 'REACTIVE',
      target_alarm_timestamp: null,
      refill_target_alarm_timestamp: null,
      predicted_toilet_visit_minutes_after_sleep: null,
      confidence: {
        sampleCount: firstEventDeltas.length,
        stdDevMinutes: sigma,
        dryStreakNights: dryStreak
      },
      debug: {
        weightedDeltaMinutes: predictiveState.targetTime,
        firstEventDeltasMinutes: firstEventDeltas,
        refillDeltasMinutes: refillDeltas,
        reason: `High variability: sigma > ${STABILITY_STDDEV_LIMIT_MINUTES} minutes.`
      }
    };
  }

  return {
    alarm_mode: 'REACTIVE',
    target_alarm_timestamp: null,
    refill_target_alarm_timestamp: null,
    predicted_toilet_visit_minutes_after_sleep: null,
    confidence: {
      sampleCount: firstEventDeltas.length,
      stdDevMinutes: sigma,
      dryStreakNights: dryStreak
    },
    debug: {
      weightedDeltaMinutes: null,
      firstEventDeltasMinutes: firstEventDeltas,
      refillDeltasMinutes: refillDeltas,
      reason: 'No high-confidence mode cluster (Sleep Hygiene First gate).'
    }
  };
}
