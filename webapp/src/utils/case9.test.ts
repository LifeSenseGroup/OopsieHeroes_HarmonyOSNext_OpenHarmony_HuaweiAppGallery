import { describe, expect, it } from 'vitest';
import { case9EventEstimate } from './predictionCases';
import { computeAlarmState } from './PredictionEngine';
import { atLocal, makeLeak, makeStart, makeStop } from '../test/helpers';

function nights(
  rows: { day: number; leakMin: number | null }[]
): { starts: ReturnType<typeof makeStart>[]; leaks: ReturnType<typeof makeLeak>[]; stops: ReturnType<typeof makeStop>[] } {
  const starts = [];
  const leaks = [];
  const stops = [];
  for (const row of rows) {
    const sleep = atLocal(2026, 10, row.day, 21, 0);
    starts.push(makeStart(sleep));
    if (row.leakMin == null) {
      stops.push(makeStop(atLocal(2026, 10, row.day + 1, 7, 0)));
    } else {
      leaks.push(makeLeak(new Date(sleep.getTime() + row.leakMin * 60_000)));
      stops.push(makeStop(atLocal(2026, 10, row.day + 1, 7, 0)));
    }
  }
  return { starts, leaks, stops };
}

describe('case9EventEstimate', () => {
  it('matches the workbook for three consecutive wet nights', () => {
    const estimate = case9EventEstimate([120, 50, 280], [0, 1, 2]);
    expect(estimate).toBeCloseTo(98.534, 2);
  });

  it('changes the estimate when dry nights separate the same leaks', () => {
    const estimate = case9EventEstimate([120, 50, 280], [0, 3, 4]);
    expect(estimate).toBeCloseTo(96.813, 2);
  });

  it('drops the oldest wet event once nine are recorded', () => {
    const retained = [120, 50, 280, 180, 130, 170, 155, 160];
    const estimate = case9EventEstimate(retained, retained.map((_, index) => index));
    expect(estimate).toBeCloseTo(152.81, 1);
  });
});

describe('selectCase9Fallback through the alarm', () => {
  it('offers Case 9 when the earlier cases decline', () => {
    const history = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: null },
      { day: 3, leakMin: null },
      { day: 4, leakMin: 50 },
      { day: 5, leakMin: 280 }
    ]);
    const state = computeAlarmState(history.starts, history.leaks, atLocal(2026, 10, 6, 15, 0), history.stops);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.debug?.reason).toContain('Case 9');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBeCloseTo(96.813, 2);
  });

  it('keeps the dry count across a night when the app was not used', () => {
    const stillReady = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 7, leakMin: null }
    ]);
    const ready = computeAlarmState(
      stillReady.starts,
      stillReady.leaks,
      atLocal(2026, 10, 8, 15, 0),
      stillReady.stops
    );
    expect(ready.alarm_mode).toBe('PREDICTIVE');
    expect(ready.debug?.reason).toContain('Case 9');

    const cleared = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 7, leakMin: null },
      { day: 8, leakMin: null }
    ]);
    const reset = computeAlarmState(
      cleared.starts,
      cleared.leaks,
      atLocal(2026, 10, 9, 15, 0),
      cleared.stops
    );
    expect(reset.alarm_mode).toBe('REACTIVE');
  });

  it('pauses after three dry nights and predicts again on the next leak night', () => {
    const paused = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 5, leakMin: null },
      { day: 6, leakMin: null }
    ]);
    const quiet = computeAlarmState(paused.starts, paused.leaks, atLocal(2026, 10, 7, 15, 0), paused.stops);
    expect(quiet.alarm_mode).toBe('REACTIVE');

    const resumed = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 5, leakMin: null },
      { day: 6, leakMin: null },
      { day: 7, leakMin: 90 }
    ]);
    const ready = computeAlarmState(resumed.starts, resumed.leaks, atLocal(2026, 10, 8, 15, 0), resumed.stops);
    expect(ready.alarm_mode).toBe('PREDICTIVE');
    expect(ready.debug?.reason).toContain('Case 9');
  });

  it('stays quiet when a new leak leaves fewer than three leaks in the last 8 days', () => {
    const history = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 5, leakMin: null },
      { day: 6, leakMin: null },
      { day: 12, leakMin: 90 }
    ]);
    const state = computeAlarmState(history.starts, history.leaks, atLocal(2026, 10, 13, 15, 0), history.stops);
    expect(state.alarm_mode).toBe('REACTIVE');
  });

  it('waits for a leak night after an activated dry prediction night', () => {
    const history = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null }
    ]);
    const cutoffMs = atLocal(2026, 10, 5, 7, 0).getTime();
    const quiet = computeAlarmState(
      history.starts,
      history.leaks,
      atLocal(2026, 10, 5, 15, 0),
      history.stops,
      cutoffMs
    );
    expect(quiet.alarm_mode).toBe('REACTIVE');

    const nextLeak = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: null },
      { day: 5, leakMin: 90 }
    ]);
    const ready = computeAlarmState(
      nextLeak.starts,
      nextLeak.leaks,
      atLocal(2026, 10, 6, 15, 0),
      nextLeak.stops,
      cutoffMs
    );
    expect(ready.alarm_mode).toBe('PREDICTIVE');
    expect(ready.debug?.reason).toContain('Case 9');
  });

  it('predicts the next night when the activated prediction night itself had a leak', () => {
    const history = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 },
      { day: 3, leakMin: 280 },
      { day: 4, leakMin: 90 }
    ]);
    const cutoffMs = atLocal(2026, 10, 5, 7, 0).getTime();
    const state = computeAlarmState(
      history.starts,
      history.leaks,
      atLocal(2026, 10, 5, 15, 0),
      history.stops,
      cutoffMs
    );
    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.debug?.reason).toContain('Case 9');
  });

  it('stays quiet with only two wet nights', () => {
    const history = nights([
      { day: 1, leakMin: 120 },
      { day: 2, leakMin: 50 }
    ]);
    const state = computeAlarmState(history.starts, history.leaks, atLocal(2026, 10, 3, 15, 0), history.stops);
    expect(state.alarm_mode).toBe('REACTIVE');
  });
});
