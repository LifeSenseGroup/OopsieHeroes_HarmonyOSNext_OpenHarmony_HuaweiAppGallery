export interface PredictionHooks {
  onGoToSleep(started: Date): Promise<void>;
  onWake(ended: Date): Promise<void>;
  onLeak(at: Date): Promise<void>;
}

let hooks: PredictionHooks | null = null;

export function setPredictionHooks(next: PredictionHooks | null): void {
  hooks = next;
}

export async function notifyGoToSleep(started: Date): Promise<void> {
  if (hooks != null) {
    await hooks.onGoToSleep(started);
  }
}

export async function notifyWake(ended: Date): Promise<void> {
  if (hooks != null) {
    await hooks.onWake(ended);
  }
}

export async function notifyLeak(at: Date): Promise<void> {
  if (hooks != null) {
    await hooks.onLeak(at);
  }
}
