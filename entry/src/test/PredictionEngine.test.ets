import { describe, it, expect } from '@ohos/hypium';
import { OopsieEvent, OopsieEventType } from '../main/ets/prediction/OopsieEvent';
import { estimateCase9Delay } from '../main/ets/prediction/Case9Estimator';
import { computeAlarmState, formatMinutesAfterSleep, predictionBoxText } from '../main/ets/prediction/PredictionEngine';

function atLocal(year: number, month: number, day: number, hour: number, minute: number = 0): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}

function ev(type: OopsieEventType, date: Date): OopsieEvent {
  return { type: type, value: 0, date: date, extraInfo: '' };
}

function sleep(date: Date): OopsieEvent {
  return ev(OopsieEventType.START, date);
}

function wake(date: Date): OopsieEvent {
  return ev(OopsieEventType.STOP, date);
}

function leakAt(date: Date): OopsieEvent {
  return ev(OopsieEventType.LEAK, date);
}

function leakAfter(bedtime: Date, minutes: number): OopsieEvent {
  return leakAt(new Date(bedtime.getTime() + minutes * 60000));
}

function closeTo(actual: number | null, expected: number): boolean {
  return actual != null && Math.abs(actual - expected) < 0.02;
}

export default function predictionEngineTest() {
  describe('predictionEngineTest', () => {
    it('formats 98.534 minutes as 1h 39m', 0, () => {
      expect(formatMinutesAfterSleep(98.534)).assertEqual('1h 39m');
      expect(predictionBoxText(98.534)).assertEqual('Toilet visit ~1h 39m after going to sleep');
      expect(formatMinutesAfterSleep(45)).assertEqual('45 min');
      expect(formatMinutesAfterSleep(60)).assertEqual('1 hour');
      expect(formatMinutesAfterSleep(120)).assertEqual('2 hours');
    });

    it('case 9 numeric checks', 0, () => {
      expect(closeTo(estimateCase9Delay([120, 50, 280], [0, 1, 2]), 98.534)).assertTrue();
      expect(closeTo(estimateCase9Delay([120, 50, 280], [0, 3, 4]), 96.813)).assertTrue();
      expect(closeTo(
        estimateCase9Delay([120, 50, 280, 180, 130, 170, 155, 160], [0, 1, 2, 3, 4, 5, 6, 7]),
        152.81
      )).assertTrue();
    });

    it('case 1 returns 150 for three identical wet nights', 0, () => {
      const beds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0)];
      const starts = beds.map((bed) => sleep(bed));
      const leaks = beds.map((bed) => leakAfter(bed, 150));
      const state = computeAlarmState(starts, leaks, atLocal(2026, 9, 4, 15, 0));
      expect(state.alarm_mode).assertEqual('PREDICTIVE');
      expect(state.case_id).assertEqual(1);
      expect(state.predicted_toilet_visit_minutes_after_sleep).assertEqual(150);
    });

    it('two wet nights do not predict', 0, () => {
      const beds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0)];
      const state = computeAlarmState(
        beds.map((bed) => sleep(bed)),
        beds.map((bed) => leakAfter(bed, 150)),
        atLocal(2026, 9, 3, 15, 0)
      );
      expect(state.alarm_mode).assertEqual('REACTIVE');
      expect(state.predicted_toilet_visit_minutes_after_sleep).assertEqual(null);
    });

    it('case 9 still predicts after one dry night when three leak nights remain', 0, () => {
      const beds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0)];
      const dryBed = atLocal(2026, 9, 4, 20, 0);
      const state = computeAlarmState(
        beds.map((bed) => sleep(bed)).concat([sleep(dryBed)]),
        beds.map((bed) => leakAfter(bed, 120)),
        atLocal(2026, 9, 5, 15, 0),
        [wake(atLocal(2026, 9, 5, 7, 0))]
      );
      expect(state.alarm_mode).assertEqual('PREDICTIVE');
      expect(state.case_id).assertEqual(9);
    });

    it('three dry nights with an unused night between them hide case 9', 0, () => {
      const wetBeds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0)];
      const starts = wetBeds.map((bed) => sleep(bed)).concat([
        sleep(atLocal(2026, 9, 4, 20, 0)),
        sleep(atLocal(2026, 9, 5, 20, 0)),
        sleep(atLocal(2026, 9, 6, 20, 0)),
        sleep(atLocal(2026, 9, 7, 20, 0))
      ]);
      const stops = [
        wake(atLocal(2026, 9, 5, 7, 0)),
        wake(atLocal(2026, 9, 7, 7, 0)),
        wake(atLocal(2026, 9, 8, 7, 0))
      ];
      const state = computeAlarmState(
        starts,
        wetBeds.map((bed) => leakAfter(bed, 120)),
        atLocal(2026, 9, 8, 15, 0),
        stops
      );
      expect(state.alarm_mode).assertEqual('REACTIVE');
    });

    it('the leak night after three dry nights predicts when three leaks remain in eight days', 0, () => {
      const wetBeds = [atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0), atLocal(2026, 9, 4, 20, 0)];
      const nextBed = atLocal(2026, 9, 9, 20, 0);
      const starts = wetBeds.map((bed) => sleep(bed)).concat([
        sleep(atLocal(2026, 9, 5, 20, 0)),
        sleep(atLocal(2026, 9, 6, 20, 0)),
        sleep(atLocal(2026, 9, 7, 20, 0)),
        sleep(atLocal(2026, 9, 8, 20, 0)),
        sleep(nextBed)
      ]);
      const stops = [
        wake(atLocal(2026, 9, 6, 7, 0)),
        wake(atLocal(2026, 9, 8, 7, 0)),
        wake(atLocal(2026, 9, 9, 7, 0)),
        wake(atLocal(2026, 9, 10, 7, 0))
      ];
      const leaks = wetBeds.map((bed) => leakAfter(bed, 120)).concat([leakAfter(nextBed, 130)]);
      const state = computeAlarmState(starts, leaks, atLocal(2026, 9, 10, 15, 0), stops);
      expect(state.alarm_mode).assertEqual('PREDICTIVE');
      expect(state.case_id).assertEqual(9);
    });

    it('a new leak does not predict when fewer than three leak nights remain in eight days', 0, () => {
      const oldBeds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0)];
      const nextBed = atLocal(2026, 9, 12, 20, 0);
      const starts = oldBeds.map((bed) => sleep(bed)).concat([
        sleep(atLocal(2026, 9, 3, 20, 0)),
        sleep(atLocal(2026, 9, 4, 20, 0)),
        sleep(atLocal(2026, 9, 5, 20, 0)),
        sleep(nextBed)
      ]);
      const stops = [
        wake(atLocal(2026, 9, 4, 7, 0)),
        wake(atLocal(2026, 9, 6, 7, 0)),
        wake(atLocal(2026, 9, 13, 7, 0))
      ];
      const leaks = oldBeds.map((bed) => leakAfter(bed, 120)).concat([leakAfter(nextBed, 130)]);
      const state = computeAlarmState(starts, leaks, atLocal(2026, 9, 13, 15, 0), stops);
      expect(state.alarm_mode).assertEqual('REACTIVE');
    });

    it('an activated dry night blocks prediction until a later leak night', 0, () => {
      const beds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0)];
      const dryBed = atLocal(2026, 9, 4, 20, 0);
      const cutoff = atLocal(2026, 9, 5, 7, 0).getTime();
      const state = computeAlarmState(
        beds.map((bed) => sleep(bed)).concat([sleep(dryBed)]),
        beds.map((bed) => leakAfter(bed, 150)),
        atLocal(2026, 9, 5, 15, 0),
        [wake(atLocal(2026, 9, 5, 7, 0))],
        cutoff
      );
      expect(state.alarm_mode).assertEqual('REACTIVE');
    });

    it('an activated leak night lets the next night predict as case 9', 0, () => {
      const beds = [atLocal(2026, 9, 1, 20, 0), atLocal(2026, 9, 2, 20, 0), atLocal(2026, 9, 3, 20, 0)];
      const cutoff = atLocal(2026, 9, 4, 7, 0).getTime();
      const state = computeAlarmState(
        beds.map((bed) => sleep(bed)),
        beds.map((bed) => leakAfter(bed, 150)),
        atLocal(2026, 9, 4, 15, 0),
        [wake(atLocal(2026, 9, 4, 7, 0))],
        cutoff
      );
      expect(state.alarm_mode).assertEqual('PREDICTIVE');
      expect(state.case_id).assertEqual(9);
    });
  });
}
