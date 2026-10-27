/** Prevents native moisture callback from firing while predictive staircase audio could be mistaken for a leak. */

let suppressMoistureAlarmUntilMs = 0;

type MoistureAlarmGate = (nowMs: number) => boolean;
const moistureAlarmGates: MoistureAlarmGate[] = [];

/** Staircase scheduler registers extra suppress rules (avoids NativeBridge ↔ scheduler circular imports). */
export function registerMoistureAlarmGate(gate: MoistureAlarmGate) {
  moistureAlarmGates.push(gate);
}

export function extendMoistureAlarmSuppressMs(msFromNow: number) {
  suppressMoistureAlarmUntilMs = Math.max(suppressMoistureAlarmUntilMs, Date.now() + msFromNow);
}

export function clearMoistureAlarmSuppress() {
  suppressMoistureAlarmUntilMs = 0;
}

export function isWithinTimedMoistureSuppress(nowMs: number = Date.now()): boolean {
  return nowMs < suppressMoistureAlarmUntilMs;
}

export function shouldSuppressMoistureAlarm(nowMs: number = Date.now()): boolean {
  if (isWithinTimedMoistureSuppress(nowMs)) return true;
  for (const gate of moistureAlarmGates) {
    if (gate(nowMs)) return true;
  }
  return false;
}
