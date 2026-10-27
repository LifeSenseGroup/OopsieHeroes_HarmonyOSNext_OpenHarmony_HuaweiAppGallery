import { describe, expect, it } from 'vitest';
import {
  ACTIVE_PREDICTION_EXPIRES_AT_KEY,
  ACTIVE_PREDICTION_SIGNATURE_KEY,
  DISMISSED_PREDICTION_KEY,
  activatePredictionAlarm,
  clearCalendarPredictionUi,
  consumePredictionCycle,
  expirePredictionOfferForSleepStart,
  getPredictionHistoryCutoffMs,
  hadActivePredictionCycle,
  isPredictionAlarmActivated
} from './predictionLifecycle';

describe('predictionLifecycle', () => {
  const futureTargetMs = Date.parse('2030-06-01T22:00:00');
  const futureSleepMs = Date.parse('2030-06-01T20:00:00');

  it('keeps activation while awake even after projected target + grace (clock changes)', () => {
    const targetMs = Date.parse('2026-09-01T02:00:00');
    activatePredictionAlarm(targetMs);

    expect(isPredictionAlarmActivated(Date.parse('2026-09-05T12:00:00'))).toBe(true);
  });

  it('expires activation after grace once Go to sleep has started the staircase night', () => {
    const targetMs = Date.parse('2030-06-01T22:00:00');
    activatePredictionAlarm(targetMs);
    localStorage.setItem(
      'predictiveStaircaseSchedule',
      JSON.stringify({ predictedTimeMs: targetMs, nightStartMs: Date.parse('2030-06-01T20:00:00'), completedPhases: [] })
    );

    expect(isPredictionAlarmActivated(targetMs - 60_000)).toBe(true);
    expect(isPredictionAlarmActivated(targetMs + 30 * 60_000)).toBe(true);
    expect(isPredictionAlarmActivated(targetMs + 61 * 60_000)).toBe(false);
  });

  it('clears calendar prediction UI keys', () => {
    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'sig');
    localStorage.setItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY, '123');
    localStorage.setItem(DISMISSED_PREDICTION_KEY, 'sig');

    clearCalendarPredictionUi();

    expect(localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)).toBeNull();
    expect(localStorage.getItem(ACTIVE_PREDICTION_EXPIRES_AT_KEY)).toBeNull();
    expect(localStorage.getItem(DISMISSED_PREDICTION_KEY)).toBeNull();
  });

  it('expires prediction offer on Go to sleep without advancing history cutoff', () => {
    const sleepStartMs = Date.parse('2026-08-30T20:00:00');
    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'prediction-v3|offset:135');

    expirePredictionOfferForSleepStart(sleepStartMs);

    expect(localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)).toBeNull();
    expect(getPredictionHistoryCutoffMs()).toBeNull();
  });

  it('expires prediction offer on Go to sleep but keeps activation running', () => {
    const sleepStartMs = futureSleepMs;
    const targetMs = Date.parse('2030-06-01T22:15:00');
    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'prediction-v3|offset:135');
    activatePredictionAlarm(targetMs);

    expirePredictionOfferForSleepStart(sleepStartMs);

    expect(localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)).toBeNull();
    expect(isPredictionAlarmActivated(targetMs - 60_000)).toBe(true);
    expect(getPredictionHistoryCutoffMs()).toBeNull();
  });

  it('does nothing when no active prediction offer exists', () => {
    expirePredictionOfferForSleepStart(Date.parse('2026-08-30T20:00:00'));
    expect(getPredictionHistoryCutoffMs()).toBeNull();
  });

  it('consumePredictionCycle advances cutoff only when prediction was activated', () => {
    const completedAtMs = Date.parse('2026-08-31T07:00:00');
    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'prediction-v3|offset:135');
    activatePredictionAlarm(Date.parse('2026-08-31T02:00:00'));

    consumePredictionCycle(completedAtMs);

    expect(localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)).toBeNull();
    expect(isPredictionAlarmActivated(completedAtMs)).toBe(false);
    expect(getPredictionHistoryCutoffMs()).toBe(completedAtMs);
  });

  it('consumePredictionCycle does not advance cutoff when prediction was never activated', () => {
    const completedAtMs = Date.parse('2026-08-31T07:00:00');
    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'prediction-v3|offset:135');

    consumePredictionCycle(completedAtMs);

    expect(getPredictionHistoryCutoffMs()).toBeNull();
  });

  it('hadActivePredictionCycle reflects offer, activation, or staircase schedule', () => {
    expect(hadActivePredictionCycle()).toBe(false);

    localStorage.setItem(ACTIVE_PREDICTION_SIGNATURE_KEY, 'sig');
    expect(hadActivePredictionCycle()).toBe(true);

    clearCalendarPredictionUi();
    activatePredictionAlarm(futureTargetMs);
    expect(hadActivePredictionCycle()).toBe(true);

    localStorage.setItem(
      'predictiveStaircaseSchedule',
      JSON.stringify({ predictedTimeMs: 1, nightStartMs: 2, completedPhases: [] })
    );
    expect(hadActivePredictionCycle()).toBe(true);
  });
});
