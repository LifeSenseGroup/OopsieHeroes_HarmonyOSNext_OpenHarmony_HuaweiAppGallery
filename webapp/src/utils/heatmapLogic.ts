export type HeatmapBucket = {
  /** Inclusive start time for this bucket */
  start: Date;
  /** Exclusive end time for this bucket */
  end: Date;
  /** Number of events that landed in this bucket */
  count: number;
};

export type GenerateHeatMapOptions = {
  /**
   * Bucket size in minutes. Must evenly divide 1440 to cover a full day cleanly.
   * Defaults to 60.
   */
  bucketMinutes?: number;
  /** Reserved for backward compatibility (recommendation is fixed at 15 minutes). */
  recommendationLeadMinutes?: number;
};

export type GenerateHeatMapResult = {
  buckets: HeatmapBucket[];
  peakBucket: HeatmapBucket | null;
  recommendationTime: Date | null;
  /** Minutes after Go to sleep until toilet-visit wake (for mission copy). */
  toiletVisitMinutesAfterSleep: number | null;
};

const MINUTES_PER_DAY = 24 * 60;
const MS_PER_MINUTE = 60_000;
const MS_PER_DAY = 24 * 60 * MS_PER_MINUTE;
const LOOKBACK_DAYS = 8;
const MIN_PEAK_BUCKET_COUNT = 1;
const RECOMMENDATION_LEAD_MINUTES = 15;

export function subtractMinutes(date: Date, minutes: number): Date {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('subtractMinutes: invalid date');
  }
  if (!Number.isFinite(minutes)) {
    throw new Error('subtractMinutes: minutes must be a finite number');
  }
  return new Date(date.getTime() - minutes * MS_PER_MINUTE);
}

function toValidDate(value: unknown): Date | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * MS_PER_MINUTE);
}

/**
 * Generates a 24h heatmap (local time) by bucketing timestamps within their local day.
 *
 * - Finds the bucket with the highest count and returns it as `peakBucket`.
 * - Computes `recommendationTime` by subtracting minutes from `peakBucket.start`
 *   using `subtractMinutes`.
 */
export function generateHeatMap(
  timestamps: Array<Date | string | number>,
  options: GenerateHeatMapOptions = {}
): GenerateHeatMapResult {
  const bucketMinutes = options.bucketMinutes ?? 60;

  if (!Number.isInteger(bucketMinutes) || bucketMinutes <= 0) {
    throw new Error('generateHeatMap: bucketMinutes must be a positive integer');
  }
  if (MINUTES_PER_DAY % bucketMinutes !== 0) {
    throw new Error(
      `generateHeatMap: bucketMinutes (${bucketMinutes}) must evenly divide 1440`
    );
  }
  // Create empty buckets for a 24-hour local day.
  // Anchor day: today (local). We only use the time-of-day portion for bucketing.
  const now = new Date();
  const lookbackStart = new Date(now.getTime() - LOOKBACK_DAYS * MS_PER_DAY);
  const anchorDay = startOfLocalDay(now);
  const bucketCount = MINUTES_PER_DAY / bucketMinutes;
  const buckets: HeatmapBucket[] = Array.from({ length: bucketCount }, (_, i) => {
    const start = addMinutes(anchorDay, i * bucketMinutes);
    const end = addMinutes(start, bucketMinutes);
    return { start, end, count: 0 };
  });

  // Populate bucket counts.
  for (const raw of timestamps ?? []) {
    const d = toValidDate(raw);
    if (!d) continue;
    if (d < lookbackStart || d > now) continue;

    const minutesIntoDay = d.getHours() * 60 + d.getMinutes();
    if (minutesIntoDay < 0 || minutesIntoDay >= MINUTES_PER_DAY) continue;

    const idx = Math.min(
      Math.floor(minutesIntoDay / bucketMinutes),
      buckets.length - 1
    );
    buckets[idx].count += 1;
  }

  // Find peak bucket (highest count). In ties, prefer the earlier time window.
  let peakBucket: HeatmapBucket | null = null;
  for (const b of buckets) {
    if (
      !peakBucket ||
      b.count > peakBucket.count ||
      (b.count === peakBucket.count && b.start.getTime() < peakBucket.start.getTime())
    ) {
      peakBucket = b;
    }
  }
  // Only produce a prediction when there is a clear signal.
  if (peakBucket && peakBucket.count < MIN_PEAK_BUCKET_COUNT) {
    peakBucket = null;
  }

  const recommendationTime =
    peakBucket ? subtractMinutes(peakBucket.start, RECOMMENDATION_LEAD_MINUTES) : null;

  return { buckets, peakBucket, recommendationTime, toiletVisitMinutesAfterSleep: null };
}

