import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ACTIVE_PREDICTION_SIGNATURE_KEY,
  activatePredictionAlarm,
  getPredictionHistoryCutoffMs
} from './predictionLifecycle';

vi.mock('./NativeBridge', () => ({
  playSelectedAlarm: vi.fn(),
  stopSelectedAlarm: vi.fn(),
  startSoundDetection: vi.fn(),
  stopSoundDetection: vi.fn()
}));

vi.mock('./moistureAlarmSuppress', () => ({
  clearMoistureAlarmSuppress: vi.fn(),
  extendMoistureAlarmSuppressMs: vi.fn(),
  isWithinTimedMoistureSuppress: vi.fn(() => false),
  registerMoistureAlarmGate: vi.fn()
}));

const { dismissStaircaseWake } = await import('./PredictiveStaircaseScheduler');

describe('PredictiveStaircaseScheduler dismissStaircaseWake', () => {
  const targetMs = Date.parse('2030-06-01T22:00:00');
  const nightStartMs = Date.parse('2030-06-01T20:00:00');

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(Date.parse('2030-06-02T07:00:00'));
  });

  it('advances prediction history cutoff when dismissing full wake via Stop alarm', () => {
    activatePredictionAlarm(targetMs);
    localStorage.setItem(
      'predictiveStaircaseSchedule',
      JSON.stringify({
        predictedTimeMs: targetMs,
        nightStartMs,
        soundFile: 'alarmsound1.mp3',
        completedPhases: ['whisper', 'nudge']
      })
    );
    localStorage.setItem('predictiveStaircaseWakeActive', String(Date.now() + 60_000));

    dismissStaircaseWake();

    expect(localStorage.getItem(ACTIVE_PREDICTION_SIGNATURE_KEY)).toBeNull();
    expect(getPredictionHistoryCutoffMs()).toBe(Date.parse('2030-06-02T07:00:00'));
  });
});
