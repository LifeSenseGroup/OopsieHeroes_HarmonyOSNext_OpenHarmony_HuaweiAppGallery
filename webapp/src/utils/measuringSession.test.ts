import { describe, expect, it } from 'vitest';
import { isMeasuringNightInProgress } from './measuringSession';
import { atLocal, makeLeak, makeStart, makeStop } from '../test/helpers';

describe('isMeasuringNightInProgress', () => {
  it('returns false when there are no starts', () => {
    expect(isMeasuringNightInProgress([], [], [])).toBe(false);
  });

  it('returns true for an open night (start only)', () => {
    const sleep = atLocal(2026, 8, 30, 20, 0);
    expect(isMeasuringNightInProgress([makeStart(sleep)], [], [])).toBe(true);
  });

  it('returns false after Wake up stop', () => {
    const sleep = atLocal(2026, 8, 30, 20, 0);
    const stop = atLocal(2026, 8, 31, 7, 0);
    expect(isMeasuringNightInProgress([makeStart(sleep)], [makeStop(stop)], [])).toBe(false);
  });

  it('returns false after a leak (wet night ends at leak)', () => {
    const sleep = atLocal(2026, 8, 30, 20, 0);
    const leak = atLocal(2026, 8, 30, 22, 30);
    expect(isMeasuringNightInProgress([makeStart(sleep)], [], [makeLeak(leak)])).toBe(false);
  });

  it('uses the latest start when multiple nights exist', () => {
    const olderSleep = atLocal(2026, 8, 28, 20, 0);
    const olderStop = atLocal(2026, 8, 29, 7, 0);
    const latestSleep = atLocal(2026, 8, 30, 20, 0);

    expect(
      isMeasuringNightInProgress(
        [makeStart(olderSleep), makeStart(latestSleep)],
        [makeStop(olderStop)],
        []
      )
    ).toBe(true);
  });
});
