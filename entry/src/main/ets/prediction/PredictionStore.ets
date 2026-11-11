import { SettingString, SettingsManager } from '../manager/SettingsManager';

export interface StoredSchedule {
  predictedTimeMs: number;
  nightStartMs: number;
  delayMin: number;
  completed: string[];
}

export class PredictionStore {
  static async getCutoff(): Promise<number | null> {
    const raw = await SettingsManager.getInstance().getString(SettingString.PredictionCutoffMs);
    if (!raw) {
      return null;
    }
    const ms = Number(raw);
    return Number.isFinite(ms) ? ms : null;
  }

  static async setCutoff(ms: number): Promise<void> {
    if (!Number.isFinite(ms)) {
      return;
    }
    await SettingsManager.getInstance().setString(SettingString.PredictionCutoffMs, String(ms));
  }

  static async hasActivation(): Promise<boolean> {
    const raw = await SettingsManager.getInstance().getString(SettingString.PredictionActivationTargetMs);
    return raw.length > 0 && Number.isFinite(Number(raw));
  }

  static async getActivationTarget(): Promise<number | null> {
    const raw = await SettingsManager.getInstance().getString(SettingString.PredictionActivationTargetMs);
    if (!raw) {
      return null;
    }
    const ms = Number(raw);
    return Number.isFinite(ms) ? ms : null;
  }

  static async setActivationTarget(ms: number): Promise<void> {
    await SettingsManager.getInstance().setString(SettingString.PredictionActivationTargetMs, String(ms));
  }

  static async clearActivation(): Promise<void> {
    await SettingsManager.getInstance().setString(SettingString.PredictionActivationTargetMs, '');
  }

  static async isActivated(nowMs: number): Promise<boolean> {
    const target = await PredictionStore.getActivationTarget();
    if (target == null) {
      return false;
    }
    const schedule = await PredictionStore.getSchedule();
    if (schedule == null || schedule.nightStartMs <= 0) {
      return true;
    }
    return nowMs <= target + 60 * 60000;
  }

  static async getSchedule(): Promise<StoredSchedule | null> {
    const raw = await SettingsManager.getInstance().getString(SettingString.PredictionStaircaseSchedule);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as StoredSchedule;
      if (!parsed || typeof parsed.predictedTimeMs !== 'number' || typeof parsed.nightStartMs !== 'number') {
        return null;
      }
      if (!Array.isArray(parsed.completed)) {
        parsed.completed = [];
      }
      return parsed;
    } catch (_err) {
      return null;
    }
  }

  static async setSchedule(schedule: StoredSchedule | null): Promise<void> {
    if (schedule == null) {
      await SettingsManager.getInstance().setString(SettingString.PredictionStaircaseSchedule, '');
      return;
    }
    await SettingsManager.getInstance().setString(SettingString.PredictionStaircaseSchedule, JSON.stringify(schedule));
  }

  static async getDismissedSignature(): Promise<string> {
    return await SettingsManager.getInstance().getString(SettingString.PredictionDismissedSignature);
  }

  static async setDismissedSignature(signature: string): Promise<void> {
    await SettingsManager.getInstance().setString(SettingString.PredictionDismissedSignature, signature);
  }
}
