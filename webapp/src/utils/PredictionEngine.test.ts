import { describe, expect, it } from 'vitest';
import {
  anchorStartsForPredictiveLeakTiming,
  computeAlarmState,
  formatMinutesAfterSleep,
  projectNextSleepOnset
} from './PredictionEngine';
import { atLocal, makeLeak, makeStart, makeStop, seedThreeStableWetNights } from '../test/helpers';

describe('formatMinutesAfterSleep', () => {
  it('formats sub-hour offsets in minutes', () => {
    expect(formatMinutesAfterSleep(45)).toBe('45 min');
  });

  it('formats hour offsets', () => {
    expect(formatMinutesAfterSleep(60)).toBe('1 hour');
    expect(formatMinutesAfterSleep(135)).toBe('2h 15m');
  });
});

describe('projectNextSleepOnset', () => {
  const historicalOnsets = [
    atLocal(2026, 8, 27, 20, 0),
    atLocal(2026, 8, 28, 20, 0),
    atLocal(2026, 8, 29, 20, 0)
  ];

  it('projects tonight when usual bedtime is still ahead', () => {
    const now = atLocal(2026, 8, 30, 15, 0);
    const onset = projectNextSleepOnset(historicalOnsets, now);
    expect(onset?.getTime()).toBe(atLocal(2026, 8, 30, 20, 0).getTime());
  });

  it('projects tomorrow when usual bedtime already passed', () => {
    const now = atLocal(2026, 8, 30, 21, 0);
    const onset = projectNextSleepOnset(historicalOnsets, now);
    expect(onset?.getTime()).toBe(atLocal(2026, 8, 31, 20, 0).getTime());
  });
});

describe('anchorStartsForPredictiveLeakTiming', () => {
  it('drops a daytime start when a prior evening start exists (Calendar path)', () => {
    const evening = atLocal(2026, 8, 29, 20, 0);
    const daytime = atLocal(2026, 8, 30, 10, 0);
    const anchored = anchorStartsForPredictiveLeakTiming(
      [makeStart(evening), makeStart(daytime)],
      null
    );

    expect(anchored).toHaveLength(1);
    expect(anchored[0].date.getTime()).toBe(evening.getTime());
  });

  it('keeps the daytime start when no prior evening exists', () => {
    const daytime = atLocal(2026, 8, 30, 10, 0);
    const anchored = anchorStartsForPredictiveLeakTiming([makeStart(daytime)], null);
    expect(anchored).toHaveLength(1);
  });
});

describe('computeAlarmState', () => {
  it('offers PREDICTIVE mode after three stable wet nights', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const { starts, leaks } = seedThreeStableWetNights(lastSleep, 150);
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.debug?.reason).toContain('High-density cluster');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(150);
    expect(state.target_alarm_timestamp?.getTime()).toBe(
      atLocal(2026, 8, 30, 22, 30, 0).getTime()
    );
  });

  it('hides prediction after a completed dry night even when three wet nights preceded it', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const { starts: wetStarts, leaks: wetLeaks } = seedThreeStableWetNights(lastSleep, 150);
    const drySleep = atLocal(2026, 9, 1, 20, 0);
    const dryStop = atLocal(2026, 9, 2, 7, 0);
    const starts = [...wetStarts, makeStart(drySleep)];
    const leaks = [...wetLeaks];
    const stops = [makeStop(dryStop)];
    const now = atLocal(2026, 9, 2, 15, 0);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('REACTIVE');
    expect(state.target_alarm_timestamp).toBeNull();
    expect(state.debug?.reason).toContain('0/3');
  });

  it('stays REACTIVE when a dry night breaks the consecutive leak streak', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const { starts: wetStarts, leaks: wetLeaks } = seedThreeStableWetNights(lastSleep, 150);
    const drySleep = atLocal(2026, 8, 30, 20, 0);
    const dryStop = atLocal(2026, 8, 31, 7, 0);
    const newSleep = atLocal(2026, 8, 31, 20, 0);
    const starts = [...wetStarts, makeStart(drySleep), makeStart(newSleep)];
    const leaks = [
      ...wetLeaks,
      makeLeak(atLocal(2026, 8, 31, 21, 0)),
      makeLeak(atLocal(2026, 8, 31, 21, 5))
    ];
    const stops = [makeStop(dryStop)];
    const now = atLocal(2026, 9, 1, 15, 0);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('REACTIVE');
    expect(state.target_alarm_timestamp).toBeNull();
    expect(state.debug?.reason).toContain('1/3');
  });

  it('stays REACTIVE with fewer than three consecutive leak nights', () => {
    const sleep1 = atLocal(2026, 8, 28, 20, 0);
    const sleep2 = atLocal(2026, 8, 29, 20, 0);
    const starts = [makeStart(sleep1), makeStart(sleep2)];
    const leaks = [
      makeLeak(atLocal(2026, 8, 28, 22, 30)),
      makeLeak(atLocal(2026, 8, 29, 22, 30))
    ];
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('REACTIVE');
    expect(state.target_alarm_timestamp).toBeNull();
  });

  it('computes timing only from the streak after a dry night, not older wet nights', () => {
    const { starts: oldStarts, leaks: oldLeaks } = seedThreeStableWetNights(
      atLocal(2026, 8, 22, 20, 0),
      150
    );
    const drySleep = atLocal(2026, 8, 25, 20, 0);
    const starts = [
      ...oldStarts,
      makeStart(drySleep),
      makeStart(atLocal(2026, 8, 26, 20, 0)),
      makeStart(atLocal(2026, 8, 27, 20, 0)),
      makeStart(atLocal(2026, 8, 28, 20, 0))
    ];
    const leaks = [
      ...oldLeaks,
      makeLeak(atLocal(2026, 8, 26, 21, 0)),
      makeLeak(atLocal(2026, 8, 27, 21, 0)),
      makeLeak(atLocal(2026, 8, 28, 21, 0))
    ];
    const now = atLocal(2026, 8, 29, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(60);
    expect(state.predicted_toilet_visit_minutes_after_sleep).not.toBe(150);
  });

  it('uses the stable wet cluster when a dry night breaks the three-night streak', () => {
    const starts = [
      makeStart(atLocal(2026, 8, 25, 20, 0)),
      makeStart(atLocal(2026, 8, 26, 20, 0)),
      makeStart(atLocal(2026, 8, 27, 20, 0)),
      makeStart(atLocal(2026, 8, 28, 20, 0)),
      makeStart(atLocal(2026, 8, 29, 20, 0)),
      makeStart(atLocal(2026, 8, 30, 20, 0))
    ];
    const leaks = [
      makeLeak(atLocal(2026, 8, 25, 22, 30)),
      makeLeak(atLocal(2026, 8, 26, 22, 30)),
      makeLeak(atLocal(2026, 8, 27, 22, 30)),
      // dry on 28th
      makeLeak(atLocal(2026, 8, 29, 22, 30)),
      makeLeak(atLocal(2026, 8, 30, 22, 30)),
      makeLeak(atLocal(2026, 8, 31, 22, 30))
    ];
    const now = atLocal(2026, 8, 31, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(150);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 8, 31, 22, 30).getTime());
    expect(state.debug?.reason).toContain('Case 2');
  });

  it('ignores nights before history cutoff', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const { starts, leaks } = seedThreeStableWetNights(lastSleep, 150);
    const cutoffMs = atLocal(2026, 8, 29, 20, 0).getTime();
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now, [], cutoffMs);

    expect(state.alarm_mode).toBe('REACTIVE');
  });

  it('predicts earliest cluster when leaks are at 15, 30, and 60 minutes', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const starts = [
      makeStart(atLocal(2026, 8, 27, 20, 0)),
      makeStart(atLocal(2026, 8, 28, 20, 0)),
      makeStart(lastSleep)
    ];
    const leaks = [
      makeLeak(atLocal(2026, 8, 27, 20, 15)),
      makeLeak(atLocal(2026, 8, 28, 20, 30)),
      makeLeak(atLocal(2026, 8, 29, 21, 0))
    ];
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(15);
    expect(state.target_alarm_timestamp?.getTime()).toBe(
      atLocal(2026, 8, 30, 20, 15, 0).getTime()
    );
  });

  it('keeps a second leak after Stop alarm in the same night', () => {
    const starts = [
      makeStart(atLocal(2026, 8, 27, 20, 0)),
      makeStart(atLocal(2026, 8, 28, 20, 0)),
      makeStart(atLocal(2026, 8, 29, 20, 0)),
      makeStart(atLocal(2026, 8, 29, 21, 20))
    ];
    const leaks = [
      makeLeak(atLocal(2026, 8, 27, 21, 0)),
      makeLeak(atLocal(2026, 8, 28, 21, 0)),
      makeLeak(atLocal(2026, 8, 29, 21, 0)),
      makeLeak(atLocal(2026, 8, 30, 1, 20))
    ];
    const stops = [makeStop(atLocal(2026, 8, 30, 7, 0))];
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(60);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 8, 30, 21, 0).getTime());
  });

  it('does not treat going back to sleep after a leak as a dry night', () => {
    const starts = [
      makeStart(atLocal(2026, 8, 27, 20, 0)),
      makeStart(atLocal(2026, 8, 28, 20, 0)),
      makeStart(atLocal(2026, 8, 29, 20, 0)),
      makeStart(atLocal(2026, 8, 29, 21, 30))
    ];
    const leaks = [
      makeLeak(atLocal(2026, 8, 27, 21, 0)),
      makeLeak(atLocal(2026, 8, 28, 21, 0)),
      makeLeak(atLocal(2026, 8, 29, 21, 0))
    ];
    const stops = [makeStop(atLocal(2026, 8, 30, 7, 0))];
    const now = atLocal(2026, 8, 30, 15, 0);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(60);
  });

  it('rolls target to the next evening after tonight’s target passed', () => {
    const lastSleep = atLocal(2026, 8, 29, 20, 0);
    const { starts, leaks } = seedThreeStableWetNights(lastSleep, 150);
    const now = atLocal(2026, 8, 30, 23, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.target_alarm_timestamp?.getTime()).toBe(
      atLocal(2026, 8, 31, 22, 30, 0).getTime()
    );
  });

  it('follows a steady drift once the nights are no longer one tight cluster', () => {
    const starts = [];
    const leaks = [];
    for (let i = 0; i < 13; i++) {
      const sleep = atLocal(2026, 9, 1 + i, 20, 0);
      starts.push(makeStart(sleep));
      leaks.push(makeLeak(new Date(sleep.getTime() + (200 + 15 * i) * 60_000)));
    }
    starts.push(makeStart(atLocal(2026, 9, 14, 20, 0)));
    const stops = [makeStop(atLocal(2026, 9, 15, 7, 0))];
    const now = atLocal(2026, 9, 15, 15, 0);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(410);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 9, 16, 2, 50).getTime());
    expect(state.debug?.reason).toContain('Case 4');
  });

  it('moves the leak earlier when bedtime itself is later', () => {
    const starts = [];
    const leaks = [];
    const offsets = [0, 240, 60, 180, 120, 0, 240, 60, 180, 120, 0, 240, 60, 180, 120, 0];
    for (let i = 0; i < offsets.length; i++) {
      const sleep = new Date(atLocal(2026, 9, 1 + i, 19, 0).getTime() + offsets[i] * 60_000);
      starts.push(makeStart(sleep));
      leaks.push(makeLeak(new Date(sleep.getTime() + (400 - offsets[i]) * 60_000)));
    }
    const tonight = atLocal(2026, 9, 17, 19, 0);
    starts.push(makeStart(tonight));
    const now = atLocal(2026, 9, 17, 19, 10);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.debug?.reason).toContain('Case 3');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBeGreaterThan(300);
    expect(state.target_alarm_timestamp?.getTime()).toBe(
      tonight.getTime() + (state.predicted_toilet_visit_minutes_after_sleep ?? 0) * 60_000
    );
  });

  it('picks the bedtime group when early and late nights leak at different times', () => {
    const starts = [];
    const leaks = [];
    const lateInTail = new Set([2, 5]);
    for (let i = 0; i < 19; i++) {
      const early = i < 11 ? i % 2 === 0 : !lateInTail.has(i - 11);
      const sleep = atLocal(2026, 9, 1 + i, early ? 20 : 22, early ? 0 : 30);
      starts.push(makeStart(sleep));
      leaks.push(makeLeak(new Date(sleep.getTime() + (early ? 120 : 300) * 60_000)));
    }
    const now = atLocal(2026, 9, 20, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(120);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 9, 20, 22, 0).getTime());
    expect(state.debug?.reason).toContain('Case 5');
  });

  it('uses a weekend timing when weeknights and weekend nights disagree', () => {
    const starts = [];
    const leaks = [];
    for (let day = 1; day <= 28; day++) {
      const sleep = atLocal(2026, 9, day, 20, 0);
      const morning = new Date(sleep.getFullYear(), sleep.getMonth(), sleep.getDate() + 1);
      const weekend = morning.getDay() === 0 || morning.getDay() === 6;
      starts.push(makeStart(sleep));
      leaks.push(makeLeak(new Date(sleep.getTime() + (weekend ? 280 : 100) * 60_000)));
    }
    const now = atLocal(2026, 9, 29, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(100);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 9, 29, 21, 40).getTime());
    expect(state.debug?.reason).toContain('Case 7');
  });

  it('switches to the recent segment after the leak time steps to a new level', () => {
    const starts = [];
    const leaks = [];
    for (let i = 0; i < 8; i++) {
      const sleep = atLocal(2026, 9, 1 + i, 20, 0);
      starts.push(makeStart(sleep));
      leaks.push(makeLeak(new Date(sleep.getTime() + (i < 4 ? 100 : 250) * 60_000)));
    }
    const now = atLocal(2026, 9, 9, 15, 0);

    const state = computeAlarmState(starts, leaks, now);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(250);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 9, 10, 0, 10).getTime());
    expect(state.debug?.reason).toContain('Case 8');
  });

  it('uses the hazard peak when tonight’s bedtime is far from the usual one', () => {
    const starts = [];
    const leaks = [];
    const stops = [];
    for (let day = 1; day <= 6; day++) {
      starts.push(makeStart(atLocal(2026, 9, day, 20, 0)));
      leaks.push(makeLeak(atLocal(2026, 9, day, 23, 0)));
      stops.push(makeStop(atLocal(2026, 9, day + 1, 7, 0)));
    }
    starts.push(makeStart(atLocal(2026, 9, 7, 20, 0)));
    stops.push(makeStop(atLocal(2026, 9, 8, 7, 0)));
    starts.push(makeStart(atLocal(2026, 9, 8, 23, 30)));
    const now = atLocal(2026, 9, 8, 23, 40);

    const state = computeAlarmState(starts, leaks, now, stops);

    expect(state.alarm_mode).toBe('PREDICTIVE');
    expect(state.predicted_toilet_visit_minutes_after_sleep).toBe(180);
    expect(state.target_alarm_timestamp?.getTime()).toBe(atLocal(2026, 9, 9, 2, 30).getTime());
    expect(state.debug?.reason).toContain('Case 6');
  });
});
