import { DBManager } from './DBManager';
import { SensorManager } from './SensorManager';
import { SettingBoolean, SettingInt, SettingsManager } from './SettingsManager';
import { notifyGoToSleep, notifyWake } from '../prediction/PredictionHooks';

export class CycleManager {
  private static instance: CycleManager;

  // FIX: Made Public & Static so Calendar can see them
  public static readonly DAYS_PER_CYCLE = 1;
  public static readonly MILLIS_IN_CYCLE = 1000 * 60 * 60 * 24 * CycleManager.DAYS_PER_CYCLE;

  private constructor() {}

  public static getInstance(): CycleManager {
    if (!CycleManager.instance) {
      CycleManager.instance = new CycleManager();
    }
    return CycleManager.instance;
  }

  public async isMeasuring(): Promise<boolean> {
    const lastCycle = await DBManager.getInstance().getLastCycle();
    if (lastCycle && !lastCycle.isFinished) {
      return true;
    }
    return false;
  }

  public async startNewCycle() {
    const db = DBManager.getInstance();

    const lastCycle = await db.getLastCycle();
    const newNumber = (lastCycle?.number || 0) + 1;

    const started = new Date();
    await db.createCycle(newNumber, started);
    await db.createDBEntry('MeasuringDayStarted', newNumber, started, "");
    await SettingsManager.getInstance().setInt(SettingInt.LastCycleNumber, newNumber);
    await SettingsManager.getInstance().setInt(SettingInt.ExpectedEvent, 1);
    await SettingsManager.getInstance().setBoolean(SettingBoolean.HasEverMeasured, true);

    SensorManager.getInstance().sendStartCommand();
    await notifyGoToSleep(started);

    console.info(`CycleManager: Started Cycle ${newNumber}`);
  }

  public async stopCycle() {
    await SensorManager.getInstance().sendStopCommand();
    const lastCycle = await DBManager.getInstance().getLastCycle();
    if (lastCycle && !lastCycle.isFinished) {
      const ended = new Date();
      await DBManager.getInstance().finishCycle(lastCycle.number);
      await DBManager.getInstance().createDBEntry('MeasuringDayFinished', lastCycle.number, ended, "");
      await notifyWake(ended);
    }
  }

  public async finishCyclesIfNeeded() {
    const db = DBManager.getInstance();
    const cycles = await db.getAllCycles();
    const now = new Date().getTime();

    for (const cycle of cycles) {
      // FIX: Access static property via Class Name
      const endTime = cycle.startDate.getTime() + CycleManager.MILLIS_IN_CYCLE;

      if (now > endTime && !cycle.isFinished) {
        await db.finishCycle(cycle.number);

        await db.createDBEntry('MeasuringDayFinished', cycle.number, new Date(endTime), "");
        await notifyWake(new Date(endTime));

        console.info(`CycleManager: Auto-finished Cycle ${cycle.number}`);
      }
    }
  }
}
