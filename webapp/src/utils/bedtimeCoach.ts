import type { EventOopsie } from './dataStructures';
import { eMode } from './dataStructures';

/** Sensor coverage must reach this to classify dry/wet. */
export const VALID_COVERAGE = 80;
/** Merge detections within this many minutes into one episode. */
export const EVENT_DEBOUNCE_MIN = 10;
/** First event this many minutes later than baseline counts as "later". */
export const LATER_DELTA_MIN = 60;
/** First event this many minutes earlier than baseline counts as "earlier". */
export const EARLIER_DELTA_MIN = 60;
/** Default nights used for median comparisons. */
export const BASELINE_WINDOW = 8;
/** Minimum valid nights before trend/progress comparisons. */
export const TREND_MIN_NIGHTS = 3;
/** Review window from first valid night with no progress signals. */
export const NO_PROGRESS_WEEKS = 12;
const MIN_NIGHT_MINUTES_DEFAULT = 15;
const MS_PER_MINUTE = 60_000;
/**
 * Stop alarm ends the measuring session, then Go to sleep writes a new start.
 * That start continues the same night when it shares the night id, there is no
 * Wake up between them, and it follows the previous leak within this many minutes.
 */
const SAME_NIGHT_RETURN_MAX_MIN = 10 * 60;

export type CoachMessageId =
  | 'N01' | 'N02' | 'N03' | 'N04' | 'N05' | 'N06' | 'N07' | 'N08' | 'N09'
  | 'N10' | 'N11' | 'N12' | 'N13' | 'N14' | 'N15' | 'N16' | 'N17' | 'N18'
  | 'N19' | 'N20' | 'N21' | 'N22' | 'N23' | 'N24';

export type CoachSurface = 'morning';

export type CoachNight = {
  nightId: string;
  sleepStart: Date;
  wakeTime: Date | null;
  events: Date[];
  eventCount: number;
  firstEventMin: number | null;
  lastEventMin: number | null;
  dryNight: boolean;
  sensorCoverage: number;
  valid: boolean;
  completed: boolean;
  hasRedFlagParentInput: boolean;
};

export type CoachResult = {
  id: CoachMessageId;
  text: string;
  surface: CoachSurface;
  /** Nights in the current dry streak, for translated copy such as N11 and N13. */
  dryStreak?: number;
};

export type CoachProfile = {
  nickname?: string;
  recentMessageIds?: string[];
};

export const CHILD_MESSAGES: Record<CoachMessageId, string> = {
  N01: 'Oopsie learned a lot last night.',
  N02: 'One Oopsie moment last night. Another night of learning!',
  N03: 'Oopsie noticed your Oopsie moment was later in the night. Keep going, Hero!',
  N04: 'One Oopsie moment last night, fewer than before! Oopsie keeps learning.',
  N05: 'Oopsie noticed your Oopsie moment was later in the night. Keep going, Hero!',
  N06: 'A dry night! Great job doing your Hero routine!',
  N07: 'Oopsie learned a lot last night.',
  N08: 'An Oopsie moment again. Your body and Oopsie are learning. Tonight is a new Hero Mission!',
  N09: 'One Oopsie moment last night, no problem! You are doing great with your Hero routine.',
  N10: 'Two dry nights in a row! Keep doing the same Hero routine tonight.',
  N11: '{dry_streak} dry nights in a row. Keep your Hero routine going!',
  N12: 'One whole week of dry nights! Keep your Hero routine going, Oopsie is looking out for you.',
  N13: '{dry_streak} dry nights. Keep up your Hero routine!',
  N14: '14 dry nights in a row, great job doing your Hero routine. Your grown-up can check the next Hero step.',
  N15: "Less Oopsie moments last night. That's an encouraging change!",
  N16: 'Oopsie noticed your Oopsie moment was later in the night. Keep going, Hero!',
  N17: 'Less Oopsie moments last night, and later during the night! You got this, Hero!',
  N18: 'More Oopsie moments last night. No problem, your body and Oopsie are learning!',
  N19: 'Your Oopsie moment came earlier last night. No problem, your body and Oopsie are learning!',
  N20: 'More Oopsie moments last night. No problem, your body and Oopsie are learning!',
  N21: 'Oopsie stayed quiet all night! Keep doing your Hero routine just like you practised.',
  N22: 'Every night can be different. Keep up your Hero routine!',
  N23: 'Hero training takes practice. Stick to your Hero routine!',
  N24: 'Keep your Hero routine tonight. Your grown-up has an extra Oopsie check-in.'
};

/** Lower number wins. Matches spec section 5 plus conflict examples (wet-after-streak over later-timing). */
const PRIORITY: Record<CoachMessageId, number> = {
  N14: 20,
  N12: 30,
  N13: 32,
  N11: 34,
  N10: 36,
  N21: 40,
  N06: 42,
  N09: 50,
  N08: 52,
  N22: 53,
  N07: 54,
  N17: 60,
  N04: 62,
  N03: 64,
  N05: 66,
  N15: 68,
  N16: 70,
  N24: 85,
  N23: 86,
  N20: 90,
  N18: 92,
  N19: 94,
  N01: 100,
  N02: 101
};

type ExtraInfo = {
  sensor_coverage?: number;
  red_flag?: boolean;
  /** 1, 2, or 3 when Wake up was pressed during that prediction ring. */
  stage_reached?: number;
};

/**
 * A prediction ring is stored as type "wake" with value 1, 2, or 3
 * (also written as stage_reached). It is not a leak. A moisture event
 * during those rings is still stored as type "leak".
 */
function predictionWakeTimes(events: EventOopsie[]): Date[] {
  const times: Date[] = [];
  for (const event of events) {
    const at = asValidDate(event?.date);
    if (!at) continue;
    const extra = parseExtraInfo(event.extra_info);
    const stage = typeof extra.stage_reached === 'number' ? extra.stage_reached : event.value;
    if (stage !== 1 && stage !== 2 && stage !== 3) continue;
    times.push(at);
  }
  return times;
}

function asValidDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const parsed = new Date(value as any);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseExtraInfo(raw: string | undefined): ExtraInfo {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Sleep after 18:00 belongs to the following morning's night id. */
export function nightKeyFromSleepStart(sleepStart: Date): string {
  const d = new Date(sleepStart.getTime());
  if (d.getHours() >= 18) d.setDate(d.getDate() + 1);
  return dateKey(d);
}

export function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2) return sorted[mid];
  return Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

export function debounceEventTimes(times: Date[], windowMin = EVENT_DEBOUNCE_MIN): Date[] {
  const sorted = times
    .map((t) => asValidDate(t))
    .filter((d): d is Date => Boolean(d))
    .sort((a, b) => a.getTime() - b.getTime());
  const out: Date[] = [];
  for (const t of sorted) {
    const prev = out[out.length - 1];
    if (!prev || t.getTime() - prev.getTime() >= windowMin * MS_PER_MINUTE) {
      out.push(t);
    }
  }
  return out;
}

function eventMs(ev: EventOopsie): number | null {
  return asValidDate(ev?.date)?.getTime() ?? null;
}

function sortByTime(events: EventOopsie[]): EventOopsie[] {
  return [...events].sort((a, b) => (eventMs(a) ?? 0) - (eventMs(b) ?? 0));
}

type TimedStart = { event: EventOopsie; at: Date };
type TimedLeak = { event: EventOopsie; at: Date };

/**
 * Stop alarm does not end the night. The child goes back to sleep, which writes
 * another Go to sleep. Those starts stay one night until Wake up, or until the
 * next evening's Go to sleep.
 */
function continuesSameNight(
  previousOnset: Date,
  nextOnset: Date,
  stopTimes: Date[],
  leakTimes: TimedLeak[]
): boolean {
  if (nightKeyFromSleepStart(previousOnset) !== nightKeyFromSleepStart(nextOnset)) {
    return false;
  }
  const prevMs = previousOnset.getTime();
  const nextMs = nextOnset.getTime();
  const wokeBetween = stopTimes.some((stop) => {
    const ms = stop.getTime();
    return ms > prevMs && ms <= nextMs;
  });
  if (wokeBetween) return false;

  // Only a leak, then Go to sleep again, continues the night. A dry stretch
  // followed by another Go to sleep is the next night.
  const leaksInSegment = leakTimes
    .map((leak) => leak.at.getTime())
    .filter((ms) => ms >= prevMs && ms < nextMs);
  if (!leaksInSegment.length) return false;

  const segmentEndMs = leaksInSegment[leaksInSegment.length - 1];
  return nextMs - segmentEndMs <= SAME_NIGHT_RETURN_MAX_MIN * MS_PER_MINUTE;
}

function groupStartsIntoNights(
  startTimes: TimedStart[],
  stopTimes: Date[],
  leakTimes: TimedLeak[]
): TimedStart[][] {
  const groups: TimedStart[][] = [];
  for (const start of startTimes) {
    const current = groups[groups.length - 1];
    const previous = current?.[current.length - 1];
    if (previous && continuesSameNight(previous.at, start.at, stopTimes, leakTimes)) {
      current.push(start);
    } else {
      groups.push([start]);
    }
  }
  return groups;
}

/**
 * Pair each night with its leaks. A night opens at Go to sleep and includes
 * later Go to sleep taps after Stop alarm. It closes at Wake up, or at the
 * next evening's Go to sleep.
 */
export function buildCoachNights(
  starts: EventOopsie[],
  stops: EventOopsie[],
  leaks: EventOopsie[],
  options: { minNightMinutes?: number; wakes?: EventOopsie[] } = {}
): CoachNight[] {
  const minNightMinutes = options.minNightMinutes ?? MIN_NIGHT_MINUTES_DEFAULT;
  const predictionWakes = predictionWakeTimes(options.wakes ?? []);
  const startTimes = sortByTime(starts)
    .map((s) => ({ event: s, at: asValidDate(s?.date) }))
    .filter((e): e is TimedStart => Boolean(e.at));
  const stopTimes = sortByTime(stops)
    .map((s) => asValidDate(s?.date))
    .filter((d): d is Date => Boolean(d));
  // Wake up on ring 1, 2, or 3 ends the night. It does not remove leaks.
  const nightEndTimes = [...stopTimes, ...predictionWakes].sort(
    (a, b) => a.getTime() - b.getTime()
  );
  const leakTimes = sortByTime(leaks)
    .map((l) => ({ event: l, at: asValidDate(l?.date) }))
    .filter((e): e is TimedLeak => Boolean(e.at));
  const nights = groupStartsIntoNights(startTimes, nightEndTimes, leakTimes);

  return nights.map((group, i) => {
    const onset = group[0].at;
    const nextOnset = nights[i + 1]?.[0]?.at ?? null;
    const windowEndMs = nextOnset ? nextOnset.getTime() : Number.POSITIVE_INFINITY;
    const onsetMs = onset.getTime();
    const lastStartMs = group[group.length - 1].at.getTime();

    const stop = nightEndTimes.find((s) => {
      const ms = s.getTime();
      return ms > lastStartMs && ms < windowEndMs;
    }) ?? null;

    const leakEntries = leakTimes.filter(({ at }) => {
      const ms = at.getTime();
      return ms >= onsetMs && ms < windowEndMs && (stop == null || ms <= stop.getTime());
    });

    const events = leakEntries.map((e) => e.at);
    const startExtras = group.map((start) => parseExtraInfo(start.event.extra_info));
    const coverage = Math.min(
      ...startExtras.map((extra) =>
        typeof extra.sensor_coverage === 'number' ? extra.sensor_coverage : 100
      )
    );

    const end = stop ?? (events.length ? events[events.length - 1] : nextOnset);
    const durationMin = end ? (end.getTime() - onsetMs) / MS_PER_MINUTE : 0;
    // Dry night: completed by Wake up (stop) or by a prediction ring (wake 1, 2,
    // or 3) when that night has no leak row. Wet night: a leak row, including
    // one during the prediction rings.
    const completed = stop != null || nextOnset != null || events.length > 0;
    const valid =
      completed &&
      durationMin >= minNightMinutes &&
      coverage >= VALID_COVERAGE;

    const firstEventMin =
      events.length ? Math.max(0, (events[0].getTime() - onsetMs) / MS_PER_MINUTE) : null;
    const lastEventMin =
      events.length
        ? Math.max(0, (events[events.length - 1].getTime() - onsetMs) / MS_PER_MINUTE)
        : null;

    return {
      nightId: nightKeyFromSleepStart(onset),
      sleepStart: onset,
      wakeTime: stop,
      events,
      eventCount: events.length,
      firstEventMin,
      lastEventMin,
      dryNight: valid && events.length === 0,
      sensorCoverage: coverage,
      valid,
      completed,
      hasRedFlagParentInput: startExtras.some((extra) => extra.red_flag === true)
    };
  });
}

type Baseline = {
  eventCount: number;
  firstEventMin: number | null;
  sampleCount: number;
};

function robustBaseline(history: CoachNight[]): Baseline | null {
  const valid = history.filter((n) => n.valid).slice(-BASELINE_WINDOW);
  if (valid.length < TREND_MIN_NIGHTS) return null;
  const counts = valid.map((n) => n.eventCount);
  const firsts = valid
    .map((n) => n.firstEventMin)
    .filter((v): v is number => v != null);
  return {
    eventCount: median(counts) ?? 0,
    firstEventMin: firsts.length ? median(firsts) : null,
    sampleCount: valid.length
  };
}

function dryStreakEndingAt(nights: CoachNight[], index: number): number {
  let streak = 0;
  for (let i = index; i >= 0; i--) {
    if (!nights[i].valid) break;
    if (nights[i].dryNight) streak += 1;
    else break;
  }
  return streak;
}

function lastFourPattern(nights: CoachNight[], currentIndex: number): CoachMessageId | null {
  const start = currentIndex - 3;
  if (start < 0) return null;
  const slice = nights.slice(start, currentIndex + 1);
  if (slice.length < 4 || slice.some((n) => !n.valid)) return null;
  const dry = slice.filter((n) => n.dryNight).length;
  const wet = slice.filter((n) => !n.dryNight).length;
  let hasTwoStreak = false;
  for (let i = 1; i < slice.length; i++) {
    if (slice[i].dryNight && slice[i - 1].dryNight) hasTwoStreak = true;
    if (!slice[i].dryNight && !slice[i - 1].dryNight) hasTwoStreak = true;
  }
  if (dry >= 2 && wet >= 1 && !hasTwoStreak) return 'N22';
  return null;
}

function isStableCount(nights: CoachNight[], currentIndex: number, minNights = 7): boolean {
  const start = currentIndex - (minNights - 1);
  if (start < 0) return false;
  const slice = nights.slice(start, currentIndex + 1).filter((n) => n.valid);
  if (slice.length < minNights) return false;
  const count = slice[0].eventCount;
  if (slice.some((n) => n.eventCount !== count)) return false;
  const firsts = slice.map((n) => n.firstEventMin).filter((v): v is number => v != null);
  if (firsts.length >= 2) {
    const lo = Math.min(...firsts);
    const hi = Math.max(...firsts);
    if (hi - lo >= LATER_DELTA_MIN) return false;
  }
  return true;
}

function weeksSinceFirstNight(nights: CoachNight[], current: CoachNight): number {
  const first = nights.find((n) => n.valid) ?? nights[0];
  if (!first) return 0;
  return (current.sleepStart.getTime() - first.sleepStart.getTime()) / (7 * 24 * 60 * MS_PER_MINUTE);
}

function hasProgressSignals(nights: CoachNight[]): boolean {
  const valid = nights.filter((n) => n.valid);
  if (valid.length < TREND_MIN_NIGHTS) return false;
  if (valid.some((n) => n.dryNight)) return true;
  const early = valid.slice(0, Math.min(BASELINE_WINDOW, valid.length));
  const earlyCount = median(early.map((n) => n.eventCount));
  const earlyFirst = median(
    early.map((n) => n.firstEventMin).filter((v): v is number => v != null)
  );
  const laterNights = valid.slice(Math.min(BASELINE_WINDOW, Math.max(0, valid.length - BASELINE_WINDOW)));
  if (earlyCount != null && laterNights.some((n) => n.eventCount < earlyCount)) return true;
  if (earlyFirst != null && laterNights.some((n) => n.firstEventMin != null && n.firstEventMin >= earlyFirst + LATER_DELTA_MIN)) {
    return true;
  }
  return false;
}

function fillTemplate(
  id: CoachMessageId,
  vars: { dry_streak?: number; name?: string }
): string {
  let text = CHILD_MESSAGES[id];
  if (vars.dry_streak != null) {
    text = text.replace(/\{dry_streak\}/g, String(vars.dry_streak));
  }
  if (vars.name) {
    text = text.replace(/\{name\}/g, vars.name);
  }
  return text;
}

function pickBest(ids: CoachMessageId[]): CoachMessageId | null {
  if (!ids.length) return null;
  return ids.reduce((best, id) => (PRIORITY[id] < PRIORITY[best] ? id : best));
}

export function selectMorningCoach(
  nights: CoachNight[],
  profile: CoachProfile = {}
): CoachResult | null {
  const completed = nights.filter((n) => n.completed);
  if (!completed.length) return null;
  const current = completed[completed.length - 1];
  const currentIndex = nights.lastIndexOf(current);
  const history = nights.slice(0, currentIndex);

  // P0: insufficient coverage — never call the night dry/wet.
  if (current.sensorCoverage < VALID_COVERAGE) return null;
  if (!current.valid) return null;

  const baseline = robustBaseline(history);
  const previous = [...history].reverse().find((n) => n.valid) ?? null;
  const streakDry = current.dryNight ? dryStreakEndingAt(nights, currentIndex) : 0;
  const priorDryStreak = currentIndex > 0 ? dryStreakEndingAt(nights, currentIndex - 1) : 0;
  const candidates: CoachMessageId[] = [];

  if (streakDry === 14) candidates.push('N14');
  else if (streakDry === 7) candidates.push('N12');
  else if (streakDry >= 8) candidates.push('N13');
  else if (streakDry >= 3) candidates.push('N11');
  else if (streakDry === 2) candidates.push('N10');

  if (current.dryNight && baseline && baseline.eventCount >= 2) candidates.push('N21');
  // Single dry night only after a wet night. A dry streak uses N10–N14 instead.
  if (
    current.dryNight &&
    streakDry < 2 &&
    previous &&
    previous.eventCount > 0
  ) {
    candidates.push('N06');
  }

  const alternating = lastFourPattern(nights, currentIndex);

  if (current.eventCount > 0 && priorDryStreak >= 7) candidates.push('N09');
  else if (current.eventCount > 0 && priorDryStreak >= 2) candidates.push('N08');
  else if (current.eventCount > 0 && priorDryStreak === 1) candidates.push('N07');

  if (baseline && current.eventCount > 0) {
    const fewer = current.eventCount < baseline.eventCount;
    const later =
      current.firstEventMin != null &&
      baseline.firstEventMin != null &&
      current.firstEventMin >= baseline.firstEventMin + LATER_DELTA_MIN;
    const earlier =
      current.firstEventMin != null &&
      baseline.firstEventMin != null &&
      current.firstEventMin <= baseline.firstEventMin - EARLIER_DELTA_MIN;

    if (fewer && later) candidates.push('N17');
    else if (current.eventCount >= 2 && later) candidates.push('N03');
    else if (current.eventCount === 1 && later) candidates.push('N05');
    else if (fewer && current.eventCount <= baseline.eventCount - 2) candidates.push('N15');
    else if (current.eventCount === baseline.eventCount && later) candidates.push('N16');

    if (current.eventCount >= 2 && baseline.eventCount === 1) candidates.push('N20');
    else if (current.eventCount > baseline.eventCount) candidates.push('N18');
    if (earlier) candidates.push('N19');
  }

  if (alternating) candidates.push(alternating);

  const noProgress = !hasProgressSignals(nights.filter((n) => n.completed));
  if (weeksSinceFirstNight(nights, current) >= NO_PROGRESS_WEEKS && noProgress) {
    candidates.push('N24');
  }

  if (isStableCount(nights, currentIndex, 7)) candidates.push('N23');

  // One leak after a 2+ baseline outranks the generic single-leak line.
  const priorCounts = history.filter((n) => n.valid).slice(-BASELINE_WINDOW).map((n) => n.eventCount);
  const baselineEventCount = median(priorCounts);
  if (current.eventCount === 1 && baselineEventCount != null && baselineEventCount >= 2) {
    candidates.push('N04');
  }
  // A drop of 2 or more outranks the generic "2+ events" line, even with only one prior night.
  if (baselineEventCount != null && current.eventCount <= baselineEventCount - 2) {
    candidates.push('N15');
  }

  if (!candidates.length) {
    if (current.eventCount >= 2) candidates.push('N01');
    else if (current.eventCount === 1) candidates.push('N02');
  }

  const selected = pickBest(candidates);
  if (!selected) return null;

  return {
    id: selected,
    text: fillTemplate(selected, {
      dry_streak: streakDry,
      name: profile.nickname
    }),
    surface: 'morning',
    dryStreak: streakDry
  };
}

export type ResolveCoachInput = {
  starts: EventOopsie[];
  stops: EventOopsie[];
  leaks: EventOopsie[];
  /** Prediction ring rows (wake 1, 2, or 3). Not leaks. */
  wakes?: EventOopsie[];
  now?: Date;
  mode: eMode;
  nickname?: string;
  minNightMinutes?: number;
};

/**
 * Home-screen selector: insight for the most recent completed night while awake.
 * Hidden when asleep or when no completed night exists.
 */
export function resolveHeroCoachMessage(input: ResolveCoachInput): CoachResult | null {
  if (input.mode !== eMode.WAKE) return null;

  const nights = buildCoachNights(input.starts, input.stops, input.leaks, {
    minNightMinutes: input.minNightMinutes,
    wakes: input.wakes
  });

  const completed = nights.filter((n) => n.completed && n.valid);
  const last = completed[completed.length - 1];
  if (!last) return null;

  return selectMorningCoach(
    nights.filter((n) => n.completed || n === last),
    { nickname: input.nickname }
  );
}
