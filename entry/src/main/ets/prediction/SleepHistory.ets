import { Cycle, Leak } from '../manager/DBManager';
import { OopsieEvent, OopsieEventType } from './OopsieEvent';

export interface SleepLog {
  type: string;
  value: number;
  date: Date;
  note: string;
}

export interface SleepHistoryEvents {
  starts: OopsieEvent[];
  leaks: OopsieEvent[];
  stops: OopsieEvent[];
}

function event(type: OopsieEventType, date: Date): OopsieEvent {
  return { type: type, value: 0, date: date, extraInfo: '' };
}

/**
 * Go to sleep is a cycle start. Wake up / stop measuring is MeasuringDayFinished.
 * Leaks stay in LEAK_TABLE. Stop-alarm without that wake log does not close the night.
 */
export function sleepEventsFromRecords(cycles: Cycle[], leaks: Leak[], logs: SleepLog[]): SleepHistoryEvents {
  const starts: OopsieEvent[] = [];
  for (let i = 0; i < cycles.length; i++) {
    if (cycles[i].startDate instanceof Date) {
      starts.push(event(OopsieEventType.START, cycles[i].startDate));
    }
  }
  const leakEvents: OopsieEvent[] = [];
  for (let i = 0; i < leaks.length; i++) {
    const at = leaks[i].date instanceof Date ? leaks[i].date : leaks[i].startDate;
    if (at instanceof Date) {
      leakEvents.push(event(OopsieEventType.LEAK, at));
    }
  }
  const stops: OopsieEvent[] = [];
  for (let i = 0; i < logs.length; i++) {
    if (logs[i].type === 'MeasuringDayFinished' && logs[i].date instanceof Date) {
      stops.push(event(OopsieEventType.STOP, logs[i].date));
    }
  }
  return { starts: starts, leaks: leakEvents, stops: stops };
}
