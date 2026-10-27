import type { EventOopsie } from './dataStructures';

/**
 * Cases 2–8. Case 1 (the existing cluster alarm) lives in PredictionEngine and
 * wins whenever it qualifies. These cases use the same local nights only.
 * A night opens at Go to sleep and keeps later Go to sleep taps after Stop
 * alarm, until Wake up or the next evening. The event time is the first leak.
 *
 * There is no multi-child calibration table on the device, so a missing
 * residual study does not silence a case. The alarm time returned here is the
 * predicted leak (T). The staircase already wakes 15 minutes earlier.
 */

export type AlternatePrediction = {
  caseId: number;
  delayMin: number;
  confidence: number;
};

type TimingNight = {
  onset: Date;
  /** First leak after bedtime, when it falls inside (0, 12 hours]. */
  delayMin: number | null;
  wet: boolean;
  /** Wake-up stop minus bedtime, when a stop was recorded before the next sleep. */
  durationMin: number | null;
};

const MAX_EVENT_MINUTES = 12 * 60;
const MIN_ALARM_DELAY_MINUTES = 75;
const RISK_WINDOW_DAYS = 28;
const RISK_MIN_P = 0.65;
const RISK_MIN_N_EFF = 5;
const REPLAY_MIN_NIGHTS = 5;
const MAE_GAP_MINUTES = 5;

function eventMs(ev: EventOopsie): number | null {
  const raw = ev?.date;
  const date = raw instanceof Date ? raw : new Date(raw as any);
  const ms = date.getTime();
  return Number.isNaN(ms) ? null : ms;
}

function calendarDayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

function ageDays(earlier: Date, later: Date): number {
  return calendarDayNumber(later) - calendarDayNumber(earlier);
}

/** Minutes from the previous noon, so a leak after midnight stays after an evening bedtime. */
function bedtimeMinutes(onset: Date): number {
  const minutes = onset.getHours() * 60 + onset.getMinutes();
  return onset.getHours() < 12 ? minutes + 24 * 60 : minutes;
}

function recencyWeight(age: number): number {
  return 2 ** (-age / 7);
}

function isWeekendSession(onset: Date): boolean {
  const morning = new Date(onset.getFullYear(), onset.getMonth(), onset.getDate());
  if (onset.getHours() >= 18) morning.setDate(morning.getDate() + 1);
  const day = morning.getDay();
  return day === 0 || day === 6;
}

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function valueRange(values: number[]): number {
  if (!values.length) return Infinity;
  return Math.max(...values) - Math.min(...values);
}

function nEff(weights: number[]): number {
  const sum = weights.reduce((total, weight) => total + weight, 0);
  const sumSq = weights.reduce((total, weight) => total + weight * weight, 0);
  return sumSq > 0 ? (sum * sum) / sumSq : 0;
}

function weightedMean(items: { value: number; w: number }[]): number | null {
  let weightSum = 0;
  let valueSum = 0;
  for (const item of items) {
    if (!Number.isFinite(item.value) || !Number.isFinite(item.w) || item.w <= 0) continue;
    weightSum += item.w;
    valueSum += item.w * item.value;
  }
  return weightSum > 0 ? valueSum / weightSum : null;
}

function weightedStd(items: { value: number; w: number }[]): number {
  const center = weightedMean(items);
  if (center == null) return 0;
  let weightSum = 0;
  let squareSum = 0;
  for (const item of items) {
    if (!Number.isFinite(item.value) || item.w <= 0) continue;
    weightSum += item.w;
    squareSum += item.w * (item.value - center) ** 2;
  }
  return weightSum > 0 ? Math.sqrt(squareSum / weightSum) : 0;
}

function populationStd(values: number[]): number | null {
  if (!values.length) return null;
  const center = mean(values);
  const variance = values.reduce((sum, value) => sum + (value - center) ** 2, 0) / values.length;
  return Math.sqrt(variance);
}

function weightOf(night: TimingNight, tonight: Date): number {
  return recencyWeight(ageDays(night.onset, tonight));
}

function isTimingWet(night: TimingNight): boolean {
  return night.wet && night.delayMin != null && night.delayMin > 0 && night.delayMin <= MAX_EVENT_MINUTES;
}

function inWindow(night: TimingNight, tonight: Date, days: number): boolean {
  const age = ageDays(night.onset, tonight);
  return age >= 1 && age <= days;
}

function beforeNight(history: TimingNight[], onset: Date): TimingNight[] {
  const cutoff = onset.getTime();
  return history.filter((night) => night.onset.getTime() < cutoff);
}

function acceptDelay(value: number | null): number | null {
  if (value == null || !Number.isFinite(value)) return null;
  const rounded = Math.round(value);
  if (rounded < MIN_ALARM_DELAY_MINUTES || rounded > MAX_EVENT_MINUTES) return null;
  return rounded;
}

const SAME_NIGHT_RETURN_MAX_MIN = 10 * 60;

/** Sleep after 18:00 belongs to the following morning. */
function nightKey(ms: number): string {
  const date = new Date(ms);
  if (date.getHours() >= 18) date.setDate(date.getDate() + 1);
  const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Stop alarm does not end the night: the child goes back to sleep, which writes
 * another Go to sleep. That start stays in the night when it follows a leak,
 * shares the night, has no Wake up between them, and is within 10 hours.
 */
function continuesSameNight(
  previousMs: number,
  nextMs: number,
  stopTimes: number[],
  leakTimes: number[]
): boolean {
  if (nightKey(previousMs) !== nightKey(nextMs)) return false;
  if (stopTimes.some((stop) => stop > previousMs && stop <= nextMs)) return false;
  const leaksInSegment = leakTimes.filter((ms) => ms >= previousMs && ms < nextMs);
  if (!leaksInSegment.length) return false;
  const segmentEnd = leaksInSegment[leaksInSegment.length - 1];
  return nextMs - segmentEnd <= SAME_NIGHT_RETURN_MAX_MIN * 60_000;
}

/** Groups of indexes into a sorted start list. Each group is one night. */
export function groupSleepStartIndexes(
  startTimes: number[],
  leakTimes: number[],
  stopTimes: number[]
): number[][] {
  const groups: number[][] = [];
  for (let i = 0; i < startTimes.length; i++) {
    const current = groups[groups.length - 1];
    const previous = current?.[current.length - 1];
    if (
      previous != null &&
      continuesSameNight(startTimes[previous], startTimes[i], stopTimes, leakTimes)
    ) {
      current.push(i);
    } else {
      groups.push([i]);
    }
  }
  return groups;
}

function buildTimingHistory(starts: EventOopsie[], leaks: EventOopsie[], stops: EventOopsie[], tonightOnset: Date): TimingNight[] {
  const startTimes = starts
    .map((start) => eventMs(start))
    .filter((ms): ms is number => ms != null)
    .sort((a, b) => a - b);
  const leakTimes = leaks
    .map((leak) => eventMs(leak))
    .filter((ms): ms is number => ms != null)
    .sort((a, b) => a - b);
  const stopTimes = stops
    .map((stop) => eventMs(stop))
    .filter((ms): ms is number => ms != null)
    .sort((a, b) => a - b);
  const tonightMs = tonightOnset.getTime();
  const groups = groupSleepStartIndexes(startTimes, leakTimes, stopTimes);

  const nights: TimingNight[] = [];
  for (const group of groups) {
    const onsetMs = startTimes[group[0]];
    if (onsetMs >= tonightMs) continue;
    const nextMs = startTimes[group[group.length - 1] + 1] ?? null;
    const nightLeaks = leakTimes.filter((ms) => ms >= onsetMs && (nextMs == null || ms < nextMs));
    const stopMs = stopTimes.find((ms) => ms > onsetMs && (nextMs == null || ms < nextMs)) ?? null;
    let delayMin: number | null = null;
    if (nightLeaks.length) {
      const minutes = (nightLeaks[0] - onsetMs) / 60_000;
      if (minutes > 0 && minutes <= MAX_EVENT_MINUTES) delayMin = minutes;
    }
    let durationMin: number | null = null;
    if (stopMs != null) {
      const minutes = (stopMs - onsetMs) / 60_000;
      if (minutes > 0) durationMin = minutes;
    }
    nights.push({
      onset: new Date(onsetMs),
      delayMin,
      wet: nightLeaks.length > 0,
      durationMin
    });
  }
  return nights;
}

function riskAssessment(history: TimingNight[], tonight: Date): { passes: boolean; p: number } {
  const informative = history.filter((night) => inWindow(night, tonight, RISK_WINDOW_DAYS));
  const weights = informative.map((night) => weightOf(night, tonight));
  if (nEff(weights) < RISK_MIN_N_EFF) return { passes: false, p: 0 };
  let weightSum = 0;
  let wetSum = 0;
  informative.forEach((night, index) => {
    weightSum += weights[index];
    if (night.wet) wetSum += weights[index];
  });
  const p = (1 + wetSum) / (2 + weightSum);
  return { passes: p >= RISK_MIN_P, p };
}

function wetPool(history: TimingNight[], tonight: Date, days: number): TimingNight[] {
  return history.filter((night) => inWindow(night, tonight, days) && isTimingWet(night));
}

/** Case 2's weighted mean, including nights whose spread would fail the range gate. */
function case2Baseline(history: TimingNight[], tonight: Date): number | null {
  const pool = wetPool(history, tonight, 28)
    .sort((a, b) => b.onset.getTime() - a.onset.getTime())
    .slice(0, 7);
  if (pool.length < 3) return null;
  return weightedMean(pool.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
}

function case2Raw(history: TimingNight[], tonight: Date): number | null {
  const pool = wetPool(history, tonight, 28)
    .sort((a, b) => b.onset.getTime() - a.onset.getTime())
    .slice(0, 7);
  if (pool.length < 3) return null;
  if (ageDays(pool[0].onset, tonight) > 7) return null;
  const delays = pool.map((night) => night.delayMin!);
  if (valueRange(delays) > 60) return null;
  const tonightBed = bedtimeMinutes(tonight);
  const nearBedtime = pool.some((night) => Math.abs(bedtimeMinutes(night.onset) - tonightBed) <= 90);
  if (!nearBedtime) return null;
  return weightedMean(pool.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
}

function case3Raw(history: TimingNight[], tonight: Date): number | null {
  const pool = wetPool(history, tonight, 28);
  if (pool.length < 8) return null;
  const weights = pool.map((night) => weightOf(night, tonight));
  if (nEff(weights) < 5) return null;
  const beds = pool.map((night) => bedtimeMinutes(night.onset));
  if (valueRange(beds) < 90) return null;
  const bedItems = pool.map((night, index) => ({ value: beds[index], w: weights[index] }));
  const delayItems = pool.map((night, index) => ({ value: night.delayMin!, w: weights[index] }));
  const bedCenter = weightedMean(bedItems);
  const delayCenter = weightedMean(delayItems);
  if (bedCenter == null || delayCenter == null) return null;

  let numerator = 0;
  let denominator = 0;
  pool.forEach((night, index) => {
    const x = beds[index] - bedCenter;
    numerator += weights[index] * x * (night.delayMin! - delayCenter);
    denominator += weights[index] * x * x;
  });
  const beta = Math.min(0, Math.max(-1, numerator / (denominator + 3600)));
  const tonightBed = bedtimeMinutes(tonight);
  const low = Math.min(...beds) - 30;
  const high = Math.max(...beds) + 30;
  if (tonightBed < low || tonightBed > high) return null;
  return delayCenter + beta * (tonightBed - bedCenter);
}

function theilSen(points: { d: number; t: number }[]): { slope: number; intercept: number } | null {
  const slopes: number[] = [];
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const span = points[j].d - points[i].d;
      if (span === 0) continue;
      slopes.push((points[j].t - points[i].t) / span);
    }
  }
  if (!slopes.length) return null;
  const slope = median(slopes);
  const intercept = median(points.map((point) => point.t - slope * point.d));
  return { slope, intercept };
}

function case4Raw(history: TimingNight[], tonight: Date): number | null {
  const pool = wetPool(history, tonight, 14);
  if (pool.length < 6) return null;
  const days = pool.map((night) => calendarDayNumber(night.onset));
  if (Math.max(...days) - Math.min(...days) < 7) return null;
  const latest = pool.reduce((best, night) => (night.onset.getTime() > best.onset.getTime() ? night : best));
  if (ageDays(latest.onset, tonight) > 3) return null;
  const origin = Math.min(...days);
  const points = pool.map((night) => ({
    d: calendarDayNumber(night.onset) - origin,
    t: night.delayMin!
  }));
  const fit = theilSen(points);
  if (!fit || fit.slope < 3 || fit.slope > 20) return null;
  const close = points.filter((point) => Math.abs(point.t - (fit.intercept + fit.slope * point.d)) <= 30).length;
  if (close / points.length < 0.7) return null;
  const tonightD = calendarDayNumber(tonight) - origin;
  const latestD = calendarDayNumber(latest.onset) - origin;
  if (tonightD - latestD > 3) return null;
  return fit.intercept + fit.slope * tonightD;
}

function dayAfter(date: Date): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + 1);
  return next;
}

function suppressedByMisses(
  history: TimingNight[],
  predict: (prior: TimingNight[], at: Date) => number | null,
  missesNeeded: number,
  rebuildWetCount: number,
  requireQualifiedRebuild: boolean
): boolean {
  const wets = history.filter(isTimingWet).sort((a, b) => a.onset.getTime() - b.onset.getTime());
  let consecutiveMisses = 0;
  let suppressed = false;
  let wetAfterSuppress = 0;

  for (const target of wets) {
    if (suppressed) {
      wetAfterSuppress += 1;
      if (wetAfterSuppress >= rebuildWetCount) {
        const through = history.filter((night) => night.onset.getTime() <= target.onset.getTime());
        const qualified = !requireQualifiedRebuild || predict(through, dayAfter(target.onset)) != null;
        if (qualified) {
          suppressed = false;
          consecutiveMisses = 0;
          wetAfterSuppress = 0;
        }
      }
      continue;
    }

    const prior = beforeNight(history, target.onset);
    const predicted = predict(prior, target.onset);
    if (predicted == null || target.delayMin == null) continue;
    if (Math.abs(predicted - target.delayMin) > 60) {
      consecutiveMisses += 1;
      if (consecutiveMisses >= missesNeeded) {
        suppressed = true;
        wetAfterSuppress = 0;
      }
    } else {
      consecutiveMisses = 0;
    }
  }
  return suppressed;
}

function replayMae(
  history: TimingNight[],
  predict: (prior: TimingNight[], at: Date) => number | null,
  baseline: (prior: TimingNight[], at: Date) => number | null
): { maeModel: number; maeBase: number; n: number } | null {
  const modelErrors: number[] = [];
  const baseErrors: number[] = [];
  for (const target of history) {
    if (!isTimingWet(target) || target.delayMin == null) continue;
    const prior = beforeNight(history, target.onset);
    const model = predict(prior, target.onset);
    const base = baseline(prior, target.onset);
    if (model == null || base == null) continue;
    modelErrors.push(Math.abs(model - target.delayMin));
    baseErrors.push(Math.abs(base - target.delayMin));
  }
  if (modelErrors.length < REPLAY_MIN_NIGHTS) return null;
  return { maeModel: mean(modelErrors), maeBase: mean(baseErrors), n: modelErrors.length };
}

function improvesOn(history: TimingNight[], predict: (prior: TimingNight[], at: Date) => number | null, baseline: (prior: TimingNight[], at: Date) => number | null): boolean {
  const replay = replayMae(history, predict, baseline);
  if (!replay || replay.maeBase <= 0) return false;
  return replay.maeModel <= replay.maeBase * 0.8;
}

function case3Delay(history: TimingNight[], tonight: Date, pointOnly: boolean): number | null {
  const raw = case3Raw(history, tonight);
  if (raw == null) return null;
  if (pointOnly) return raw;
  return improvesOn(history, case3Raw, case2Baseline) ? raw : null;
}

function case4Delay(history: TimingNight[], tonight: Date, pointOnly: boolean): number | null {
  const raw = case4Raw(history, tonight);
  if (raw == null) return null;
  if (pointOnly) return raw;
  if (suppressedByMisses(history, case4Raw, 2, 6, false)) return null;
  return improvesOn(history, case4Raw, case2Baseline) ? raw : null;
}

function weightedSse(nights: TimingNight[], tonight: Date): number {
  const items = nights.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) }));
  const center = weightedMean(items);
  if (center == null) return Infinity;
  return items.reduce((sum, item) => sum + item.w * (item.value - center) ** 2, 0);
}

function case5Detail(history: TimingNight[], tonight: Date): { selected: number; other: number } | null {
  const pool = wetPool(history, tonight, 28);
  if (pool.length < 12) return null;
  const sseOne = weightedSse(pool, tonight);
  const sorted = [...pool].sort((a, b) => a.delayMin! - b.delayMin!);
  let best: { older: TimingNight[]; newer: TimingNight[]; sse: number } | null = null;
  for (let cut = 4; cut <= sorted.length - 4; cut++) {
    const low = sorted.slice(0, cut);
    const high = sorted.slice(cut);
    const sse = weightedSse(low, tonight) + weightedSse(high, tonight);
    if (!best || sse < best.sse) best = { older: low, newer: high, sse };
  }
  if (!best || best.sse > 0.6 * sseOne) return null;

  const lowMean = weightedMean(best.older.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  const highMean = weightedMean(best.newer.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  if (lowMean == null || highMean == null || Math.abs(highMean - lowMean) < 90) return null;
  if (valueRange(best.older.map((night) => night.delayMin!)) > 60) return null;
  if (valueRange(best.newer.map((night) => night.delayMin!)) > 60) return null;

  const recentLow = best.older.filter((night) => inWindow(night, tonight, 14)).length;
  const recentHigh = best.newer.filter((night) => inWindow(night, tonight, 14)).length;
  if (recentLow < 2 || recentHigh < 2) return null;

  const lowBed = weightedMean(best.older.map((night) => ({ value: bedtimeMinutes(night.onset), w: weightOf(night, tonight) })));
  const highBed = weightedMean(best.newer.map((night) => ({ value: bedtimeMinutes(night.onset), w: weightOf(night, tonight) })));
  if (lowBed == null || highBed == null || Math.abs(highBed - lowBed) < 60) return null;

  const tonightBed = bedtimeMinutes(tonight);
  const pickLow = Math.abs(tonightBed - lowBed) <= Math.abs(tonightBed - highBed);
  const selectedNights = pickLow ? best.older : best.newer;
  const selectedBed = pickLow ? lowBed : highBed;
  const selectedMean = pickLow ? lowMean : highMean;
  const otherMean = pickLow ? highMean : lowMean;
  if (Math.abs(tonightBed - selectedBed) > 60) return null;

  const bandwidth = Math.max(30, weightedStd(selectedNights.map((night) => ({ value: bedtimeMinutes(night.onset), w: weightOf(night, tonight) }))));
  const context = history.filter(
    (night) => inWindow(night, tonight, 28) && Math.abs(bedtimeMinutes(night.onset) - selectedBed) <= bandwidth
  );
  const contextWeights = context.map((night) => weightOf(night, tonight));
  if (nEff(contextWeights) < 5) return null;
  let weightSum = 0;
  let wetSum = 0;
  context.forEach((night, index) => {
    weightSum += contextWeights[index];
    if (night.wet) wetSum += contextWeights[index];
  });
  const pContext = (1 + wetSum) / (2 + weightSum);
  if (pContext < 0.8) return null;
  return { selected: selectedMean, other: otherMean };
}

function case5Raw(history: TimingNight[], tonight: Date): number | null {
  return case5Detail(history, tonight)?.selected ?? null;
}

function case5Delay(history: TimingNight[], tonight: Date, pointOnly: boolean): number | null {
  const detail = case5Detail(history, tonight);
  if (!detail) return null;
  if (pointOnly) return detail.selected;

  let modeHits = 0;
  let modeTrials = 0;
  const modelErrors: number[] = [];
  const baseErrors: number[] = [];
  for (const target of history) {
    if (!isTimingWet(target) || target.delayMin == null) continue;
    const prior = beforeNight(history, target.onset);
    const replay = case5Detail(prior, target.onset);
    const baseline = case2Baseline(prior, target.onset);
    if (!replay || baseline == null) continue;
    modeTrials += 1;
    if (Math.abs(target.delayMin - replay.selected) <= Math.abs(target.delayMin - replay.other)) modeHits += 1;
    modelErrors.push(Math.abs(replay.selected - target.delayMin));
    baseErrors.push(Math.abs(baseline - target.delayMin));
  }
  if (modeTrials < REPLAY_MIN_NIGHTS || modeHits / modeTrials < 0.8) return null;
  const maeModel = mean(modelErrors);
  const maeBase = mean(baseErrors);
  if (maeBase <= 0 || maeModel > maeBase * 0.8) return null;
  return detail.selected;
}

function case6Raw(history: TimingNight[], tonight: Date): number | null {
  const windowNights = history.filter((night) => inWindow(night, tonight, 56));
  const durations = windowNights
    .filter((night) => night.durationMin != null && night.durationMin >= 15)
    .map((night) => Math.min(night.durationMin!, MAX_EVENT_MINUTES));
  if (durations.length < 5) return null;
  const binCount = Math.floor(median(durations) / 15);
  if (binCount < 5) return null;

  const exposure = new Array<number>(binCount).fill(0);
  const events = new Array<number>(binCount).fill(0);
  for (const night of windowNights) {
    const weight = weightOf(night, tonight);
    if (isTimingWet(night) && night.delayMin != null) {
      const bin = Math.floor(night.delayMin / 15);
      if (bin >= binCount) {
        for (let index = 0; index < binCount; index++) exposure[index] += weight;
        continue;
      }
      for (let index = 0; index <= bin; index++) exposure[index] += weight;
      events[bin] += weight;
      continue;
    }
    if (night.durationMin == null) continue;
    const survived = Math.min(binCount, Math.floor(Math.min(night.durationMin, MAX_EVENT_MINUTES) / 15));
    for (let index = 0; index < survived; index++) exposure[index] += weight;
  }

  let survival = 1;
  const mass: number[] = [];
  for (let bin = 0; bin < binCount; bin++) {
    const hazard = exposure[bin] > 0 ? Math.min(1, events[bin] / exposure[bin]) : 0;
    mass.push(survival * hazard);
    survival *= 1 - hazard;
  }
  const eventProbability = mass.reduce((sum, value) => sum + value, 0);
  if (eventProbability < 0.65) return null;

  const percentile = (q: number) => {
    let accumulated = 0;
    for (let bin = 0; bin < binCount; bin++) {
      accumulated += mass[bin] / eventProbability;
      if (accumulated >= q - 1e-9) return bin * 15;
    }
    return (binCount - 1) * 15;
  };
  const p10 = percentile(0.1);
  const p50 = percentile(0.5);
  const p90 = percentile(0.9);
  if (p90 - p10 > 30 || p50 < MIN_ALARM_DELAY_MINUTES) return null;
  return p50;
}

function case1Point(history: TimingNight[], tonight: Date): number | null {
  const newestFirst = [...history]
    .filter((night) => night.onset.getTime() < tonight.getTime())
    .sort((a, b) => b.onset.getTime() - a.onset.getTime());
  const streak: TimingNight[] = [];
  for (const night of newestFirst) {
    if (!isTimingWet(night)) break;
    streak.push(night);
    if (streak.length === 8) break;
  }
  if (streak.length < 3) return null;
  const delays = streak.map((night) => night.delayMin!);
  const sigma = populationStd(delays);
  if (sigma == null || sigma > 60) return null;

  const samples = streak.map((night, index) => ({ delta: night.delayMin!, w: index < 3 ? 2 : 1 }));
  const sorted = [...samples].sort((a, b) => a.delta - b.delta);
  let bestStart = sorted[0].delta;
  let bestWeight = -1;
  let running = 0;
  let right = 0;
  for (let left = 0; left < sorted.length; left++) {
    const windowStart = sorted[left].delta;
    while (right < sorted.length && sorted[right].delta < windowStart + 60) {
      running += sorted[right].w;
      right += 1;
    }
    if (running > bestWeight || (running === bestWeight && windowStart < bestStart)) {
      bestWeight = running;
      bestStart = windowStart;
    }
    running -= sorted[left].w;
  }
  const total = samples.reduce((sum, sample) => sum + sample.w, 0);
  if (bestWeight <= 0 || total <= 0 || bestWeight / total < 0.6) return null;
  return bestStart;
}

function case7Raw(history: TimingNight[], tonight: Date): number | null {
  const pool = history.filter((night) => inWindow(night, tonight, 56));
  const tonightBed = bedtimeMinutes(tonight);
  const group = (weekend: boolean) =>
    pool.filter(
      (night) =>
        isTimingWet(night) &&
        isWeekendSession(night.onset) === weekend &&
        Math.abs(bedtimeMinutes(night.onset) - tonightBed) <= 45
    );
  const weekendNights = group(true);
  const weekdayNights = group(false);
  if (weekendNights.length < 6 || weekdayNights.length < 6) return null;
  if (nEff(weekendNights.map((night) => weightOf(night, tonight))) < 4) return null;
  if (nEff(weekdayNights.map((night) => weightOf(night, tonight))) < 4) return null;
  if (valueRange(weekendNights.map((night) => night.delayMin!)) > 60) return null;
  if (valueRange(weekdayNights.map((night) => night.delayMin!)) > 60) return null;

  const weekendMean = weightedMean(weekendNights.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  const weekdayMean = weightedMean(weekdayNights.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  if (weekendMean == null || weekdayMean == null || Math.abs(weekendMean - weekdayMean) < 45) return null;

  const tonightWeekend = isWeekendSession(tonight);
  const selected = tonightWeekend ? weekendNights : weekdayNights;
  const newest = selected.reduce((best, night) => (night.onset.getTime() > best.onset.getTime() ? night : best));
  if (ageDays(newest.onset, tonight) > 14) return null;

  const context = pool.filter(
    (night) => isWeekendSession(night.onset) === tonightWeekend && Math.abs(bedtimeMinutes(night.onset) - tonightBed) <= 45
  );
  const contextWeights = context.map((night) => weightOf(night, tonight));
  if (nEff(contextWeights) < 5) return null;
  let weightSum = 0;
  let wetSum = 0;
  context.forEach((night, index) => {
    weightSum += contextWeights[index];
    if (night.wet) wetSum += contextWeights[index];
  });
  if ((1 + wetSum) / (2 + weightSum) < 0.65) return null;
  return tonightWeekend ? weekendMean : weekdayMean;
}

function case7Delay(history: TimingNight[], tonight: Date, pointOnly: boolean): number | null {
  const raw = case7Raw(history, tonight);
  if (raw == null || pointOnly) return raw;

  const competitors = [case1Point, case2Baseline, case3Raw, case4Raw, case5Raw, case6Raw];
  let bestCompetitor = Infinity;
  let modelAtBest = Infinity;
  const targets = history.filter(isTimingWet);
  for (const competitor of competitors) {
    const modelErrors: number[] = [];
    const otherErrors: number[] = [];
    for (const target of targets) {
      if (target.delayMin == null) continue;
      const prior = beforeNight(history, target.onset);
      const model = case7Raw(prior, target.onset);
      const other = competitor(prior, target.onset);
      if (model == null || other == null) continue;
      modelErrors.push(Math.abs(model - target.delayMin));
      otherErrors.push(Math.abs(other - target.delayMin));
    }
    if (otherErrors.length < REPLAY_MIN_NIGHTS) continue;
    const otherMae = mean(otherErrors);
    if (otherMae < bestCompetitor) {
      bestCompetitor = otherMae;
      modelAtBest = mean(modelErrors);
    }
  }
  if (!Number.isFinite(bestCompetitor) || bestCompetitor <= 0) return null;
  return modelAtBest <= bestCompetitor * 0.8 ? raw : null;
}

function case8Raw(history: TimingNight[], tonight: Date): number | null {
  const tonightBed = bedtimeMinutes(tonight);
  const matched = history
    .filter((night) => isTimingWet(night) && Math.abs(bedtimeMinutes(night.onset) - tonightBed) <= 45)
    .sort((a, b) => b.onset.getTime() - a.onset.getTime())
    .slice(0, 12)
    .sort((a, b) => a.onset.getTime() - b.onset.getTime());
  if (matched.length < 8) return null;

  const sseOne = weightedSse(matched, tonight);
  let best: { older: TimingNight[]; recent: TimingNight[]; sse: number } | null = null;
  for (let cut = 4; cut <= matched.length - 4; cut++) {
    const older = matched.slice(0, cut);
    const recent = matched.slice(cut);
    const sse = weightedSse(older, tonight) + weightedSse(recent, tonight);
    if (!best || sse < best.sse) best = { older, recent, sse };
  }
  if (!best || best.sse > 0.6 * sseOne) return null;

  const recentMean = weightedMean(best.recent.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  const olderMean = weightedMean(best.older.map((night) => ({ value: night.delayMin!, w: weightOf(night, tonight) })));
  if (recentMean == null || olderMean == null || Math.abs(recentMean - olderMean) < 60) return null;
  if (valueRange(best.recent.map((night) => night.delayMin!)) > 60) return null;
  if (valueRange(best.older.map((night) => night.delayMin!)) > 60) return null;
  if (nEff(best.recent.map((night) => weightOf(night, tonight))) < 3) return null;

  const latest = matched[matched.length - 1];
  if (ageDays(latest.onset, tonight) > 3) return null;
  if (best.recent.filter((night) => ageDays(night.onset, tonight) <= 10).length < 4) return null;

  const origin = calendarDayNumber(best.recent[0].onset);
  const fit = theilSen(best.recent.map((night) => ({ d: calendarDayNumber(night.onset) - origin, t: night.delayMin! })));
  if (fit && Math.abs(fit.slope) >= 3) return null;
  return recentMean;
}

function case8Delay(history: TimingNight[], tonight: Date, pointOnly: boolean): number | null {
  const raw = case8Raw(history, tonight);
  if (raw == null) return null;
  if (pointOnly) return raw;
  if (suppressedByMisses(history, case8Raw, 2, 4, true)) return null;
  return raw;
}

function rankCandidates(
  history: TimingNight[],
  eligible: { caseId: number; delayMin: number; point: (prior: TimingNight[], at: Date) => number | null }[]
): { caseId: number; delayMin: number } {
  if (eligible.length === 1) return eligible[0];

  const errors = new Map<number, Map<number, number>>();
  for (const candidate of eligible) errors.set(candidate.caseId, new Map());

  const targets = history.filter(isTimingWet);
  targets.forEach((target, index) => {
    if (target.delayMin == null) return;
    const prior = beforeNight(history, target.onset);
    for (const candidate of eligible) {
      const predicted = candidate.point(prior, target.onset);
      if (predicted == null) continue;
      errors.get(candidate.caseId)!.set(index, Math.abs(predicted - target.delayMin));
    }
  });

  const shared = targets.map((_, index) => index).filter((index) => eligible.every((candidate) => errors.get(candidate.caseId)!.has(index)));
  if (shared.length < REPLAY_MIN_NIGHTS) {
    return [...eligible].sort((a, b) => a.caseId - b.caseId)[0];
  }

  const scored = eligible.map((candidate) => {
    const mae = mean(shared.map((index) => errors.get(candidate.caseId)!.get(index)!));
    return { ...candidate, mae };
  });
  const bestMae = Math.min(...scored.map((candidate) => candidate.mae));
  return scored
    .filter((candidate) => candidate.mae - bestMae < MAE_GAP_MINUTES)
    .sort((a, b) => a.caseId - b.caseId)[0];
}

export function selectAlternateCase(
  starts: EventOopsie[],
  leaks: EventOopsie[],
  stops: EventOopsie[],
  tonightOnset: Date
): AlternatePrediction | null {
  if (Number.isNaN(tonightOnset.getTime())) return null;
  const history = buildTimingHistory(starts, leaks, stops, tonightOnset);
  const risk = riskAssessment(history, tonightOnset);
  if (!risk.passes) return null;

  const specs: { caseId: number; strict: () => number | null; point: (prior: TimingNight[], at: Date) => number | null }[] = [
    { caseId: 2, strict: () => case2Raw(history, tonightOnset), point: case2Raw },
    { caseId: 3, strict: () => case3Delay(history, tonightOnset, false), point: (prior, at) => case3Delay(prior, at, true) },
    { caseId: 4, strict: () => case4Delay(history, tonightOnset, false), point: (prior, at) => case4Delay(prior, at, true) },
    { caseId: 5, strict: () => case5Delay(history, tonightOnset, false), point: case5Raw },
    { caseId: 6, strict: () => case6Raw(history, tonightOnset), point: case6Raw },
    { caseId: 7, strict: () => case7Delay(history, tonightOnset, false), point: (prior, at) => case7Delay(prior, at, true) },
    { caseId: 8, strict: () => case8Delay(history, tonightOnset, false), point: case8Raw }
  ];

  const eligible: { caseId: number; delayMin: number; point: (prior: TimingNight[], at: Date) => number | null }[] = [];
  for (const spec of specs) {
    const delayMin = acceptDelay(spec.strict());
    if (delayMin == null) continue;
    eligible.push({ caseId: spec.caseId, delayMin, point: spec.point });
  }
  if (!eligible.length) return null;

  const chosen = rankCandidates(history, eligible);
  return { caseId: chosen.caseId, delayMin: chosen.delayMin, confidence: Math.max(0, Math.min(1, risk.p)) };
}
