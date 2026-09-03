import dataPreferences from '@ohos.data.preferences';
import { BusinessError } from '@kit.BasicServicesKit';
import common from '@ohos.app.ability.common';

// Porting the Setting Enums from Android
export enum SettingString {
  SensorName = 'SensorName',
  SensorAddress = 'SensorAddress',
  Email = 'Email',
  VideosWatched = 'Videos_watched',
  LastTimeDidSensorSync = 'LastTimeDidSensorSync'
}


export enum SettingInt {
  LastCycleNumber = 'LastCycleNumber',
  SensorFirmwareVersion = 'SensorFirmwareVersion',
  ExpectedEvent = 'ExpectedEvent',
  FavouriteLiquidVolumeUnit = 'FavouriteLiquidVolumeUnit'  // Add this line
}

export enum SettingBoolean {
  HasEverMeasured = 'HasEverMeasured',
  DidShowQualityOfLifeDialogStart = 'DidShowQualityOfLifeDialogStart',
  DidShowQualityOfLifeDialogEnd = 'DidShowQualityOfLifeDialogEnd'
}

export class SettingsManager {
  private static instance: SettingsManager;
  private preferences: dataPreferences.Preferences | null = null;
  private readonly PREF_NAME = 'CarinPrefs';

  private constructor() {}

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  // --- INITIALIZATION ---
  public async init(context: common.UIAbilityContext) {
    try {
      this.preferences = await dataPreferences.getPreferences(context, this.PREF_NAME);
      console.info('SettingsManager: Preferences initialized');
    } catch (err) {
      console.error('SettingsManager: Failed to load preferences. ' + JSON.stringify(err));
    }
  }

  // --- GETTERS (Synchronous-like for logic flow) ---
  // Note: Preferences in ArkTS are async, but for simple values we often cache them
  // or await them. For simplicity in porting, we will use await where possible or defaults.

  public async getString(key: SettingString): Promise<string> {
    if (!this.preferences) return "";
    return (await this.preferences.get(key, "")) as string;
  }

  public async getInt(key: SettingInt): Promise<number> {
    if (!this.preferences) return 0;
    return (await this.preferences.get(key, 0)) as number;
  }

  public async getBoolean(key: SettingBoolean): Promise<boolean> {
    if (!this.preferences) return false;
    return (await this.preferences.get(key, false)) as boolean;
  }

  // --- SETTERS ---

  public async setString(key: SettingString, value: string) {
    if (!this.preferences) return;
    await this.preferences.put(key, value);
    await this.preferences.flush(); // Commit changes

    // Also sync to AppStorage for UI reactivity if needed
    AppStorage.SetOrCreate(key, value);
  }

  public async setInt(key: SettingInt, value: number) {
    if (!this.preferences) return;
    await this.preferences.put(key, value);
    await this.preferences.flush();
  }

  public async setBoolean(key: SettingBoolean, value: boolean) {
    if (!this.preferences) return;
    await this.preferences.put(key, value);
    await this.preferences.flush();
  }

  // --- LOGIC HELPERS ---

  public async increaseLastCycleNumber() {
    let current = await this.getInt(SettingInt.LastCycleNumber);
    await this.setInt(SettingInt.LastCycleNumber, current + 1);
  }

  public async increaseExpectedEvent() {
    let current = await this.getInt(SettingInt.ExpectedEvent);
    await this.setInt(SettingInt.ExpectedEvent, current + 1);
  }
}
