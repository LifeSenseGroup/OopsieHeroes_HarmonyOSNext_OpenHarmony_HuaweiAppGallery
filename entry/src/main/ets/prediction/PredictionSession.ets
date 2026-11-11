import common from '@ohos.app.ability.common';
import { DBManager } from '../manager/DBManager';
import { SettingsManager } from '../manager/SettingsManager';
import { AlarmPlayback } from './AlarmPlayback';
import { PlannedPhase, planStaircase } from './StaircasePlan';
import { SleepHistoryEvents, sleepEventsFromRecords } from './SleepHistory';
import { PredictionStore, StoredSchedule } from './PredictionStore';
import {
  anchorStartsForPredictiveLeakTiming,
  computeAlarmState,
  isSleepNightOpen,
  predictionBoxText
} from './PredictionEngine';
import { OopsieEvent } from './OopsieEvent';
import { PredictionHooks, setPredictionHooks } from './PredictionHooks';

const VISIBLE_KEY = 'predictionBoxVisible';
const TEXT_KEY = 'predictionBoxText';
const ACTIVATED_KEY = 'predictionActivated';
const AVAILABLE_KEY = 'predictionOfferAvailable';

interface PhaseTimer {
  id: number;
}

/**
 * Connects the on-device engine to cycles, leaks, and MeasuringDayFinished logs.
 */
export class PredictionSession {
  private static context: common.UIAbilityContext | null = null;
  private static timers: PhaseTimer[] = [];
  private static playingUntilMs: number = 0;
  private static betweenPhases: boolean = false;

  static publishDefaults(): void {
    PredictionSession.bindHooks();
    AppStorage.SetOrCreate(VISIBLE_KEY, false);
    AppStorage.SetOrCreate(TEXT_KEY, '');
    AppStorage.SetOrCreate(ACTIVATED_KEY, false);
    AppStorage.SetOrCreate(AVAILABLE_KEY, false);
  }

  static attach(context: common.UIAbilityContext): void {
    PredictionSession.context = context;
    AlarmPlayback.bind(context);
    void PredictionSession.prepare(context);
  }

  static async prepare(context: common.UIAbilityContext): Promise<void> {
    PredictionSession.bindHooks();
    PredictionSession.context = context;
    AlarmPlayback.bind(context);
    await SettingsManager.getInstance().init(context);
    await DBManager.getInstance().init(context);
    await PredictionSession.resumeIfNeeded();
    await PredictionSession.refresh();
  }

  private static bindHooks(): void {
    const hooks: PredictionHooks = {
      onGoToSleep: (started: Date): Promise<void> => PredictionSession.onGoToSleep(started),
      onWake: (ended: Date): Promise<void> => PredictionSession.onWake(ended),
      onLeak: (at: Date): Promise<void> => PredictionSession.onLeak(at)
    };
    setPredictionHooks(hooks);
  }

  static async refresh(): Promise<void> {
    const history = await PredictionSession.loadHistory();
    const now = new Date();
    const cutoff = await PredictionStore.getCutoff();
    const open = isSleepNightOpen(history.starts, history.stops, history.leaks);
    const anchored = anchorStartsForPredictiveLeakTiming(history.starts, null);
    const state = computeAlarmState(anchored, history.leaks, now, history.stops, cutoff);
    const delay = state.predicted_toilet_visit_minutes_after_sleep;
    const canOffer = !open && state.alarm_mode === 'PREDICTIVE' && delay != null;
    const signature = canOffer ? PredictionSession.signature(anchored, history.leaks, history.stops, delay as number) : '';
    const dismissed = await PredictionStore.getDismissedSignature();
    const activated = await PredictionStore.isActivated(now.getTime());
    AppStorage.SetOrCreate(ACTIVATED_KEY, activated);
    AppStorage.SetOrCreate(AVAILABLE_KEY, canOffer);
    AppStorage.SetOrCreate(TEXT_KEY, canOffer ? predictionBoxText(delay as number) : '');
    AppStorage.SetOrCreate(VISIBLE_KEY, canOffer && signature !== dismissed);
  }

  static async toggleActivate(): Promise<void> {
    const history = await PredictionSession.loadHistory();
    const now = new Date();
    if (await PredictionStore.hasActivation()) {
      await PredictionStore.clearActivation();
      if (!isSleepNightOpen(history.starts, history.stops, history.leaks)) {
        await PredictionStore.setSchedule(null);
        PredictionSession.clearTimers();
        await AlarmPlayback.stop();
      }
      await PredictionSession.refresh();
      return;
    }
    const cutoff = await PredictionStore.getCutoff();
    const anchored = anchorStartsForPredictiveLeakTiming(history.starts, null);
    const state = computeAlarmState(anchored, history.leaks, now, history.stops, cutoff);
    const target = state.target_alarm_timestamp;
    if (state.alarm_mode !== 'PREDICTIVE' || target == null) {
      return;
    }
    await PredictionStore.setActivationTarget(target.getTime());
    await PredictionSession.refresh();
  }

  static async dismiss(): Promise<void> {
    const history = await PredictionSession.loadHistory();
    const cutoff = await PredictionStore.getCutoff();
    const anchored = anchorStartsForPredictiveLeakTiming(history.starts, null);
    const state = computeAlarmState(anchored, history.leaks, new Date(), history.stops, cutoff);
    const delay = state.predicted_toilet_visit_minutes_after_sleep;
    if (delay != null) {
      await PredictionStore.setDismissedSignature(
        PredictionSession.signature(anchored, history.leaks, history.stops, delay)
      );
    }
    AppStorage.SetOrCreate(VISIBLE_KEY, false);
  }

  static async reopen(): Promise<void> {
    await PredictionStore.setDismissedSignature('');
    await PredictionSession.refresh();
  }

  static async onGoToSleep(started: Date): Promise<void> {
    const activated = await PredictionStore.hasActivation();
    const history = await PredictionSession.loadHistory();
    const cutoff = await PredictionStore.getCutoff();
    const anchored = anchorStartsForPredictiveLeakTiming(history.starts, started.getTime());
    const state = computeAlarmState(anchored, history.leaks, started, history.stops, cutoff);
    const delay = state.predicted_toilet_visit_minutes_after_sleep;
    PredictionSession.clearTimers();
    if (!activated || state.alarm_mode !== 'PREDICTIVE' || delay == null) {
      await PredictionStore.clearActivation();
      await PredictionStore.setSchedule(null);
      await PredictionSession.refresh();
      return;
    }
    const phases = planStaircase(started, delay, started);
    const wake = PredictionSession.wakePhase(phases);
    if (wake == null) {
      await PredictionStore.clearActivation();
      await PredictionStore.setSchedule(null);
      await PredictionSession.refresh();
      return;
    }
    const schedule: StoredSchedule = {
      predictedTimeMs: wake.atMs,
      nightStartMs: started.getTime(),
      delayMin: delay,
      completed: []
    };
    await PredictionStore.setSchedule(schedule);
    await PredictionStore.setActivationTarget(wake.atMs);
    PredictionSession.arm(phases, started);
    await PredictionSession.refresh();
  }

  static async onWake(ended: Date): Promise<void> {
    const wasActivated = await PredictionStore.hasActivation();
    PredictionSession.clearTimers();
    PredictionSession.playingUntilMs = 0;
    PredictionSession.betweenPhases = false;
    await AlarmPlayback.stop();
    await PredictionStore.clearActivation();
    await PredictionStore.setSchedule(null);
    await PredictionStore.setDismissedSignature('');
    if (wasActivated) {
      await PredictionStore.setCutoff(ended.getTime());
    }
    await PredictionSession.refresh();
  }

  static async onLeak(at: Date): Promise<void> {
    const schedule = await PredictionStore.getSchedule();
    if (schedule == null || schedule.nightStartMs <= 0) {
      await PredictionSession.refresh();
      return;
    }
    const wasActivated = await PredictionStore.hasActivation();
    PredictionSession.clearTimers();
    PredictionSession.betweenPhases = false;
    PredictionSession.playingUntilMs = 0;
    await AlarmPlayback.play(1, 0, true);
    if (wasActivated) {
      await PredictionStore.setCutoff(at.getTime());
      await PredictionStore.clearActivation();
      await PredictionStore.setSchedule(null);
    }
    await PredictionSession.refresh();
  }

  static isBetweenPhases(nowMs: number = Date.now()): boolean {
    return PredictionSession.betweenPhases && nowMs >= PredictionSession.playingUntilMs;
  }

  private static async resumeIfNeeded(): Promise<void> {
    const schedule = await PredictionStore.getSchedule();
    if (schedule == null || schedule.nightStartMs <= 0) {
      return;
    }
    if (schedule.predictedTimeMs <= Date.now()) {
      await AlarmPlayback.play(1, 0, true);
      return;
    }
    const bedtime = new Date(schedule.nightStartMs);
    const phases = planStaircase(bedtime, schedule.delayMin, new Date());
    PredictionSession.arm(phases, new Date());
  }

  private static arm(phases: PlannedPhase[], now: Date): void {
    PredictionSession.clearTimers();
    PredictionSession.betweenPhases = false;
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const wait = phase.atMs - now.getTime();
      if (wait <= 0) {
        continue;
      }
      const timerId = setTimeout(() => {
        void PredictionSession.fire(phase);
      }, wait);
      const timer: PhaseTimer = { id: timerId };
      PredictionSession.timers.push(timer);
    }
  }

  private static async fire(phase: PlannedPhase): Promise<void> {
    PredictionSession.betweenPhases = false;
    PredictionSession.playingUntilMs = phase.durationMs > 0 ? Date.now() + phase.durationMs : Number.MAX_VALUE;
    await AlarmPlayback.play(phase.volume, phase.durationMs, phase.loop);
    if (phase.durationMs > 0) {
      setTimeout(() => {
        PredictionSession.betweenPhases = true;
        PredictionSession.playingUntilMs = Date.now();
      }, phase.durationMs);
    }
  }

  private static wakePhase(phases: PlannedPhase[]): PlannedPhase | null {
    for (let i = 0; i < phases.length; i++) {
      if (phases[i].id === 'wake') {
        return phases[i];
      }
    }
    return null;
  }

  private static clearTimers(): void {
    for (let i = 0; i < PredictionSession.timers.length; i++) {
      clearTimeout(PredictionSession.timers[i].id);
    }
    PredictionSession.timers = [];
  }

  private static async loadHistory(): Promise<SleepHistoryEvents> {
    const db = DBManager.getInstance();
    const cycles = await db.getAllCycles();
    const leaks = await db.getAllLeaks();
    const logs = await db.getAllLogEntries();
    return sleepEventsFromRecords(cycles, leaks, logs);
  }

  private static signature(starts: OopsieEvent[], leaks: OopsieEvent[], stops: OopsieEvent[], delay: number): string {
    return `prediction-v3|offset:${delay}|starts:${PredictionSession.times(starts)}|leaks:${PredictionSession.times(leaks)}|stops:${PredictionSession.times(stops)}`;
  }

  private static times(events: OopsieEvent[]): string {
    const values: number[] = [];
    for (let i = 0; i < events.length; i++) {
      if (events[i].date instanceof Date) {
        values.push(events[i].date.getTime());
      }
    }
    values.sort((a: number, b: number) => a - b);
    return values.join(',');
  }
}
