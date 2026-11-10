import { advanceOnsetUntilFutureTarget } from './PredictionEngine';

export interface PlannedPhase {
  id: string;
  atMs: number;
  volume: number;
  durationMs: number;
  loop: boolean;
}

/**
 * From the real Go to sleep time, whisper at T−15, nudge at T−7, full alarm at T.
 * Steps whose time has already passed are omitted and are not played late.
 */
export function planStaircase(bedtime: Date, delayMin: number, now: Date): PlannedPhase[] {
  const advanced = advanceOnsetUntilFutureTarget(bedtime, delayMin, now, 14);
  if (advanced == null) {
    return [];
  }
  const specs: PlannedPhase[] = [
    { id: 'whisper', atMs: advanced.targetMs - 15 * 60000, volume: 0.25, durationMs: 15000, loop: false },
    { id: 'nudge', atMs: advanced.targetMs - 7 * 60000, volume: 0.8, durationMs: 30000, loop: false },
    { id: 'wake', atMs: advanced.targetMs, volume: 1, durationMs: 0, loop: true }
  ];
  const pending: PlannedPhase[] = [];
  for (let i = 0; i < specs.length; i++) {
    if (specs[i].atMs <= now.getTime()) {
      continue;
    }
    pending.push(specs[i]);
  }
  return pending;
}
