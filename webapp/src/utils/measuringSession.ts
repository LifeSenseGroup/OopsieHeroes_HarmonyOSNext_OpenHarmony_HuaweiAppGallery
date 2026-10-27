import type { EventOopsie } from './dataStructures';

function eventMs(ev: EventOopsie): number | null {
  const d = ev?.date instanceof Date ? ev.date : new Date(ev?.date as any);
  const ms = d.getTime();
  return Number.isFinite(ms) ? ms : null;
}

function latestEventMs(events: EventOopsie[]): number | null {
  let max: number | null = null;
  for (const ev of events) {
    const ms = eventMs(ev);
    if (ms != null && (max == null || ms > max)) max = ms;
  }
  return max;
}

function latestEventMsAfter(events: EventOopsie[], afterMs: number): number | null {
  let max: number | null = null;
  for (const ev of events) {
    const ms = eventMs(ev);
    if (ms != null && ms > afterMs && (max == null || ms > max)) max = ms;
  }
  return max;
}

/**
 * True while the latest Go-to-sleep night is still open (no Wake up stop and no leak yet).
 * Wet nights end at the leak (kid woke up); only dry nights get an explicit start+stop pair.
 */
export function isMeasuringNightInProgress(
  starts: EventOopsie[],
  stops: EventOopsie[],
  leaks: EventOopsie[] = []
): boolean {
  const startMs = latestEventMs(starts);
  if (startMs == null) return false;

  const stopAfterStartMs = latestEventMsAfter(stops, startMs);
  if (stopAfterStartMs != null) return false;

  const leakAfterStartMs = latestEventMsAfter(leaks, startMs);
  if (leakAfterStartMs != null) return false;

  return true;
}
