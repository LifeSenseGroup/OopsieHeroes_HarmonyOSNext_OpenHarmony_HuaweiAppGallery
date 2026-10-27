import { describe, expect, it } from 'vitest';
import { eMode, eTypes, type EventOopsie } from './dataStructures';
import { atLocal, makeLeak, makeStart, makeStop } from '../test/helpers';
import {
  CHILD_MESSAGES,
  buildCoachNights,
  debounceEventTimes,
  median,
  nightKeyFromSleepStart,
  resolveHeroCoachMessage,
  selectMorningCoach,
  type CoachNight
} from './bedtimeCoach';

function cn(
  day: number,
  leakOffsetsMin: number[],
  extras: Partial<CoachNight> = {}
): CoachNight {
  const sleep = atLocal(2026, 9, day, 20, 0);
  const events = leakOffsetsMin.map((m) => new Date(sleep.getTime() + m * 60_000));
  const wake = extras.wakeTime ?? new Date(sleep.getTime() + 10 * 60 * 60_000);
  const coverage = extras.sensorCoverage ?? 100;
  const valid = extras.valid ?? coverage >= 80;
  return {
    nightId: nightKeyFromSleepStart(sleep),
    sleepStart: sleep,
    wakeTime: wake,
    events,
    eventCount: extras.eventCount ?? events.length,
    firstEventMin: extras.firstEventMin ?? (events.length ? leakOffsetsMin[0] : null),
    lastEventMin: extras.lastEventMin ?? (events.length ? leakOffsetsMin[leakOffsetsMin.length - 1] : null),
    dryNight: extras.dryNight ?? (valid && events.length === 0),
    sensorCoverage: coverage,
    valid,
    completed: extras.completed ?? true,
    hasRedFlagParentInput: extras.hasRedFlagParentInput ?? false,
    ...extras,
    sleepStart: extras.sleepStart ?? sleep
  };
}

function idsOf(nights: CoachNight[]) {
  return selectMorningCoach(nights)?.id ?? null;
}

function makePredictionWake(dismissedAt: Date, predictedTime: Date, stage = 3): EventOopsie {
  return {
    type: eTypes.WAKE,
    value: stage,
    date: dismissedAt,
    extra_info: JSON.stringify({
      stage_reached: stage,
      predicted_time: predictedTime.getTime()
    })
  };
}

describe('helpers', () => {
  it('debounces events within 10 minutes', () => {
    const a = atLocal(2026, 9, 10, 1, 0);
    const b = atLocal(2026, 9, 10, 1, 8);
    const c = atLocal(2026, 9, 10, 1, 25);
    const merged = debounceEventTimes([a, b, c]);
    expect(merged).toHaveLength(2);
    expect(merged[0].getTime()).toBe(a.getTime());
    expect(merged[1].getTime()).toBe(c.getTime());
  });

  it('computes integer median', () => {
    expect(median([2, 2, 3])).toBe(2);
    expect(median([1, 2, 3, 4])).toBe(3);
  });
});

describe('buildCoachNights', () => {
  it('pairs starts, leaks and stops and keeps discrete leak episodes', () => {
    const sleep = atLocal(2026, 9, 10, 20, 0);
    const leak1 = atLocal(2026, 9, 11, 1, 0);
    const leak1b = atLocal(2026, 9, 11, 1, 5);
    const leak2 = atLocal(2026, 9, 11, 3, 0);
    const wake = atLocal(2026, 9, 11, 7, 0);
    const nights = buildCoachNights(
      [makeStart(sleep)],
      [makeStop(wake)],
      [makeLeak(leak1), makeLeak(leak1b), makeLeak(leak2)]
    );
    expect(nights).toHaveLength(1);
    expect(nights[0].eventCount).toBe(3);
    expect(nights[0].valid).toBe(true);
    expect(nights[0].dryNight).toBe(false);
  });

  it('counts leaks from each return to sleep as one night', () => {
    const firstSleep = atLocal(2026, 9, 10, 20, 0);
    const firstLeak = atLocal(2026, 9, 11, 1, 0);
    const backToSleep = atLocal(2026, 9, 11, 1, 20);
    const secondLeak = atLocal(2026, 9, 11, 4, 0);
    const nights = buildCoachNights(
      [makeStart(firstSleep), makeStart(backToSleep)],
      [],
      [makeLeak(firstLeak), makeLeak(secondLeak)]
    );
    expect(nights).toHaveLength(1);
    expect(nights[0].eventCount).toBe(2);
    expect(nights[0].dryNight).toBe(false);
  });

  it('counts same-day dry nights even when the first Wake up was not stored', () => {
    const nights = buildCoachNights(
      [makeStart(atLocal(2026, 10, 6, 10, 0)), makeStart(atLocal(2026, 10, 6, 14, 0))],
      [makeStop(atLocal(2026, 10, 6, 16, 0))],
      []
    );
    expect(nights.filter((n) => n.dryNight)).toHaveLength(2);
    expect(selectMorningCoach(nights)?.id).toBe('N10');
  });

  it('counts same-day Wake-up dry nights as a streak', () => {
    const nights = buildCoachNights(
      [makeStart(atLocal(2026, 10, 6, 10, 0)), makeStart(atLocal(2026, 10, 6, 14, 0))],
      [makeStop(atLocal(2026, 10, 6, 11, 0)), makeStop(atLocal(2026, 10, 6, 15, 0))],
      []
    );
    expect(nights).toHaveLength(2);
    expect(selectMorningCoach(nights)?.id).toBe('N10');
  });

  it('counts each Wake-up dry night separately toward the streak', () => {
    const starts = [];
    const stops = [];
    for (let day = 1; day <= 4; day++) {
      starts.push(makeStart(atLocal(2026, 10, day, 20, 0)));
      stops.push(makeStop(atLocal(2026, 10, day + 1, 7, 0)));
    }
    const nights = buildCoachNights(starts, stops, []);
    expect(nights).toHaveLength(4);
    expect(nights.every((n) => n.dryNight)).toBe(true);
    expect(selectMorningCoach(nights)?.id).toBe('N11');
    expect(selectMorningCoach(nights)?.text).toContain('4 dry nights');
  });

  it('starts a new night at the next evening Go to sleep', () => {
    const nights = buildCoachNights(
      [makeStart(atLocal(2026, 9, 10, 20, 0)), makeStart(atLocal(2026, 9, 11, 20, 0))],
      [],
      [makeLeak(atLocal(2026, 9, 11, 1, 0)), makeLeak(atLocal(2026, 9, 12, 2, 0))]
    );
    expect(nights).toHaveLength(2);
    expect(nights[0].eventCount).toBe(1);
    expect(nights[1].eventCount).toBe(1);
  });

  it('treats a wet night as complete even without a Wake-up stop', () => {
    const sleep = atLocal(2026, 9, 10, 20, 0);
    const leak1 = atLocal(2026, 9, 10, 20, 20);
    const leak2 = atLocal(2026, 9, 10, 20, 35);
    const nights = buildCoachNights(
      [makeStart(sleep)],
      [],
      [makeLeak(leak1), makeLeak(leak2)]
    );
    expect(nights[0].completed).toBe(true);
    expect(nights[0].valid).toBe(true);
    expect(nights[0].eventCount).toBe(2);
    expect(nights[0].dryNight).toBe(false);
  });

  it('does not call a low-coverage night dry', () => {
    const sleep = atLocal(2026, 9, 10, 20, 0);
    const wake = atLocal(2026, 9, 11, 7, 0);
    const start = makeStart(sleep);
    start.extra_info = JSON.stringify({ sensor_coverage: 40 });
    const nights = buildCoachNights([start], [makeStop(wake)], []);
    expect(nights[0].eventCount).toBe(0);
    expect(nights[0].valid).toBe(false);
    expect(nights[0].dryNight).toBe(false);
  });
});

describe('QA morning rules T01–T16', () => {
  it('picks N04 over N02 when one event follows a 2-event night', () => {
    const nights = [cn(10, [180, 300]), cn(11, [200])];
    expect(idsOf(nights)).toBe('N04');
  });

  it('T01: baseline [2,2,3] current 1 event → N04', () => {
    const nights = [
      cn(10, [180, 300]),
      cn(11, [180, 300]),
      cn(12, [180, 300, 420]),
      cn(13, [180])
    ];
    expect(idsOf(nights)).toBe('N04');
  });

  it('T02: one event much later than baseline first event → N05', () => {
    const nights = [
      cn(10, [310]),
      cn(11, [310]),
      cn(12, [310]),
      cn(13, [600])
    ];
    expect(idsOf(nights)).toBe('N05');
  });

  it('T03: two events, first later than previous pattern → N03', () => {
    const nights = [
      cn(10, [300, 420]),
      cn(11, [300, 420]),
      cn(12, [300, 420]),
      cn(13, [420, 600])
    ];
    expect(idsOf(nights)).toBe('N03');
  });

  it('T04: previous wet, current valid dry → N06 or N21', () => {
    const n06 = [cn(10, [180, 300]), cn(11, [])];
    expect(idsOf(n06)).toBe('N06');

    const n21 = [
      cn(10, [180, 300]),
      cn(11, [180, 300]),
      cn(12, [180, 300]),
      cn(13, [])
    ];
    expect(idsOf(n21)).toBe('N21');
  });

  it('T05: 3 dry nights then 1 event → N08', () => {
    const nights = [cn(10, []), cn(11, []), cn(12, []), cn(13, [300])];
    expect(idsOf(nights)).toBe('N08');
  });

  it('T06: 8 dry nights then 1 event → N09', () => {
    const nights = [
      cn(10, []),
      cn(11, []),
      cn(12, []),
      cn(13, []),
      cn(14, []),
      cn(15, []),
      cn(16, []),
      cn(17, []),
      cn(18, [240])
    ];
    expect(idsOf(nights)).toBe('N09');
  });

  it('two consecutive dry nights → N10, not the single dry-night line', () => {
    const nights = [cn(10, []), cn(11, [])];
    expect(idsOf(nights)).toBe('N10');
    expect(selectMorningCoach(nights)?.text).toBe(CHILD_MESSAGES.N10);
  });

  it('3 to 6 consecutive dry nights use the numbered streak line', () => {
    for (const length of [3, 4, 5, 6]) {
      const nights = Array.from({ length }, (_, i) => cn(10 + i, []));
      expect(idsOf(nights)).toBe('N11');
      expect(selectMorningCoach(nights)?.text).toBe(
        CHILD_MESSAGES.N11.replace('{dry_streak}', String(length))
      );
    }
  });

  it('T07: 7th consecutive dry night → N12', () => {
    const nights = [10, 11, 12, 13, 14, 15, 16].map((d) => cn(d, []));
    expect(idsOf(nights)).toBe('N12');
    expect(selectMorningCoach(nights)?.text).toContain('week of dry nights');
  });

  it('T08: 14th consecutive dry night → N14', () => {
    const nights = Array.from({ length: 14 }, (_, i) => cn(10 + i, []));
    expect(idsOf(nights)).toBe('N14');
  });

  it('T09: 0 events, 40% coverage → no dry conclusion / no child message', () => {
    const nights = [cn(10, [180]), cn(11, [180]), cn(12, [180]), cn(13, [], { sensorCoverage: 40, valid: false, dryNight: false })];
    expect(idsOf(nights)).toBeNull();
  });

  it('T10: 2 events, first +90 min later than 7-night median → N03', () => {
    const nights = [
      cn(10, [200, 360]),
      cn(11, [200, 360]),
      cn(12, [200, 360]),
      cn(13, [200, 360]),
      cn(14, [200, 360]),
      cn(15, [200, 360]),
      cn(16, [200, 360]),
      cn(17, [290, 450])
    ];
    expect(idsOf(nights)).toBe('N03');
  });

  it('T11: 1 event +90 min later and baseline count 3 → N17', () => {
    const nights = [
      cn(10, [200, 320, 440]),
      cn(11, [200, 320, 440]),
      cn(12, [200, 320, 440]),
      cn(13, [290])
    ];
    expect(idsOf(nights)).toBe('N17');
  });

  it('N22 beats N07 on dry, wet, dry, wet', () => {
    const nights = [cn(10, []), cn(11, [60]), cn(12, []), cn(13, [60])];
    expect(idsOf(nights)).toBe('N22');
    expect(selectMorningCoach(nights)?.text).toBe(CHILD_MESSAGES.N22);
  });

  it('T12: 3 events after 1 dry night → N07', () => {
    const nights = [cn(10, [180, 300]), cn(11, []), cn(12, [180, 300, 420])];
    expect(idsOf(nights)).toBe('N07');
  });

  it('T13: birthday / special context never treated as cause (N08 still wins)', () => {
    const nights = [
      cn(10, []),
      cn(11, []),
      cn(12, []),
      cn(13, [300], { hasRedFlagParentInput: false })
    ];
    expect(idsOf(nights)).toBe('N08');
  });

  it('N15 beats N01 when 5 leaks are followed by 2', () => {
    const nights = [
      cn(10, [120, 180, 240, 300, 360]),
      cn(11, [120, 240])
    ];
    expect(idsOf(nights)).toBe('N15');
    expect(selectMorningCoach(nights)?.text).toBe(CHILD_MESSAGES.N15);
  });

  it('N15: event count drops by 2 vs baseline', () => {
    const nights = [
      cn(10, [180, 300, 360, 420]),
      cn(11, [180, 300, 360, 420]),
      cn(12, [180, 300, 360, 420]),
      cn(13, [180, 300])
    ];
    expect(idsOf(nights)).toBe('N15');
  });

  it('T15: same event count for 8 nights, no timing improvement → N23', () => {
    const nights = Array.from({ length: 8 }, (_, i) => cn(10 + i, [240, 400]));
    expect(idsOf(nights)).toBe('N23');
  });

  it('T16: 12 weeks, no progress signals → N24', () => {
    const start = atLocal(2026, 6, 10, 20, 0);
    const nights: CoachNight[] = [];
    for (let i = 0; i < 8; i++) {
      const sleep = new Date(start.getTime() + i * 24 * 60 * 60_000);
      nights.push(
        cn(10 + i, [240, 400], { sleepStart: sleep, nightId: nightKeyFromSleepStart(sleep) })
      );
    }
    const lastSleep = new Date(start.getTime() + 12 * 7 * 24 * 60 * 60_000);
    nights.push(
      cn(30, [240, 400], { sleepStart: lastSleep, nightId: nightKeyFromSleepStart(lastSleep) })
    );
    expect(idsOf(nights)).toBe('N24');
  });
});

describe('priority / conflict examples', () => {
  it('wet after 3 dry nights wins over later-timing N05', () => {
    const nights = [cn(10, []), cn(11, []), cn(12, []), cn(13, [600])];
    expect(idsOf(nights)).toBe('N08');
  });

  it('14 dry nights beat generic dry copy', () => {
    const nights = Array.from({ length: 14 }, (_, i) => cn(10 + i, []));
    expect(idsOf(nights)).toBe('N14');
  });

  it('fills dry-streak copy', () => {
    const nights = [10, 11, 12, 13].map((d) => cn(d, []));
    expect(selectMorningCoach(nights)?.text).toBe(
      CHILD_MESSAGES.N11.replace('{dry_streak}', '4')
    );
  });

  it('hides the bubble when there is no completed night', () => {
    expect(selectMorningCoach([])).toBeNull();
  });
});

describe('resolveHeroCoachMessage', () => {
  const sleep = atLocal(2026, 9, 29, 20, 0);
  const leak = atLocal(2026, 9, 30, 1, 0);
  const wake = atLocal(2026, 9, 30, 7, 0);
  const events = {
    starts: [makeStart(sleep)],
    stops: [makeStop(wake)],
    leaks: [makeLeak(leak)]
  };

  it('shows the morning insight after wake on the following day', () => {
    const result = resolveHeroCoachMessage({
      ...events,
      now: atLocal(2026, 9, 30, 9, 0),
      mode: eMode.WAKE
    });
    expect(result?.surface).toBe('morning');
    expect(result?.id).toBe('N02');
    expect(result?.text).toBe(CHILD_MESSAGES.N02);
  });

  it('hides the bubble while asleep', () => {
    const result = resolveHeroCoachMessage({
      ...events,
      now: atLocal(2026, 9, 30, 9, 0),
      mode: eMode.SLEEPING
    });
    expect(result).toBeNull();
  });

  it('hides when no night data', () => {
    const result = resolveHeroCoachMessage({
      starts: [],
      stops: [],
      leaks: [],
      now: atLocal(2026, 9, 30, 11, 0),
      mode: eMode.WAKE
    });
    expect(result).toBeNull();
  });

  it('shows N01 for two leaks after the alarm is dismissed, even without Wake up', () => {
    const sleep = atLocal(2026, 9, 30, 20, 0);
    const result = resolveHeroCoachMessage({
      starts: [makeStart(sleep)],
      stops: [],
      leaks: [makeLeak(atLocal(2026, 9, 30, 20, 20)), makeLeak(atLocal(2026, 9, 30, 20, 28))],
      now: atLocal(2026, 9, 30, 20, 30),
      mode: eMode.WAKE
    });
    expect(result?.id).toBe('N01');
  });

  it('treats a prediction wake-up as a dry night', () => {
    const wetStart = atLocal(2026, 9, 29, 20, 0);
    const sleep = atLocal(2026, 9, 30, 20, 0);
    const predicted = atLocal(2026, 9, 30, 22, 30);
    const dismissed = atLocal(2026, 9, 30, 22, 32);
    const result = resolveHeroCoachMessage({
      starts: [makeStart(wetStart), makeStart(sleep)],
      stops: [makeStop(atLocal(2026, 9, 30, 7, 0))],
      leaks: [makeLeak(atLocal(2026, 9, 30, 1, 0))],
      wakes: [makePredictionWake(dismissed, predicted)],
      now: atLocal(2026, 9, 30, 22, 40),
      mode: eMode.WAKE
    });
    expect(result?.id).toBe('N06');
    expect(result?.text).toBe(CHILD_MESSAGES.N06);
  });

  it('still counts a leak saved during a prediction ring', () => {
    const wetStart = atLocal(2026, 9, 29, 20, 0);
    const sleep = atLocal(2026, 9, 30, 20, 0);
    const predicted = atLocal(2026, 9, 30, 22, 30);
    const dismissed = atLocal(2026, 9, 30, 22, 32);
    const result = resolveHeroCoachMessage({
      starts: [makeStart(wetStart), makeStart(sleep)],
      stops: [makeStop(atLocal(2026, 9, 30, 7, 0))],
      leaks: [
        makeLeak(atLocal(2026, 9, 30, 1, 0)),
        makeLeak(atLocal(2026, 9, 30, 22, 20))
      ],
      wakes: [makePredictionWake(dismissed, predicted, 1)],
      now: atLocal(2026, 9, 30, 22, 40),
      mode: eMode.WAKE
    });
    expect(result?.id).toBe('N02');
  });

  it('still counts a leak from earlier in a prediction night', () => {
    const sleep = atLocal(2026, 9, 30, 20, 0);
    const predicted = atLocal(2026, 9, 30, 22, 30);
    const result = resolveHeroCoachMessage({
      starts: [makeStart(sleep)],
      stops: [],
      leaks: [makeLeak(atLocal(2026, 9, 30, 21, 0))],
      wakes: [makePredictionWake(atLocal(2026, 9, 30, 22, 32), predicted)],
      now: atLocal(2026, 9, 30, 22, 40),
      mode: eMode.WAKE
    });
    expect(result?.id).toBe('N02');
  });

  it('shows N06 for a dry night after a wet night that had no stop', () => {
    const wetStart = atLocal(2026, 9, 30, 19, 0);
    const dryStart = atLocal(2026, 10, 1, 19, 0);
    const dryStop = atLocal(2026, 10, 2, 7, 0);
    const result = resolveHeroCoachMessage({
      starts: [makeStart(wetStart), makeStart(dryStart)],
      stops: [makeStop(dryStop)],
      leaks: [makeLeak(atLocal(2026, 9, 30, 21, 0))],
      now: atLocal(2026, 10, 2, 8, 0),
      mode: eMode.WAKE
    });
    expect(result?.id).toBe('N06');
  });
});
