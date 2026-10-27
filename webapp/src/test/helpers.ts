import { eTypes, type EventOopsie } from '../utils/dataStructures';

export function makeEvent(type: eTypes, date: Date): EventOopsie {
  return { type, value: 0, date, extra_info: '' };
}

export function makeStart(date: Date): EventOopsie {
  return makeEvent(eTypes.MEASURINGDAY_STARTED, date);
}

export function makeStop(date: Date): EventOopsie {
  return makeEvent(eTypes.MEASURINGDAY_STOPPED, date);
}

export function makeLeak(date: Date): EventOopsie {
  return makeEvent(eTypes.LEAK, date);
}

/** Three consecutive evenings with the same leak offset (stable pattern for PREDICTIVE mode). */
export function seedThreeStableWetNights(
  lastNightSleep: Date,
  leakMinutesAfterSleep = 150
): { starts: EventOopsie[]; leaks: EventOopsie[] } {
  const starts: EventOopsie[] = [];
  const leaks: EventOopsie[] = [];

  for (let nightsAgo = 2; nightsAgo >= 0; nightsAgo -= 1) {
    const sleep = new Date(lastNightSleep);
    sleep.setDate(sleep.getDate() - nightsAgo);
    const leak = new Date(sleep.getTime() + leakMinutesAfterSleep * 60_000);
    starts.push(makeStart(sleep));
    leaks.push(makeLeak(leak));
  }

  return { starts, leaks };
}

export function atLocal(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  return new Date(year, month - 1, day, hour, minute, 0, 0);
}
