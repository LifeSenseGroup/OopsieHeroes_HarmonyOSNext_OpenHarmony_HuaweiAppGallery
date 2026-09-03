// entry/src/main/ets/manager/AddDrinkManager.ets
import promptAction from '@ohos.promptAction';
import { DrinkType, DrinkTypeHelper } from '../enum/DrinkType';
import { LiquidVolumeUnit, LiquidVolumeUnitHelper } from '../enum/LiquidVolumeUnit';
import { SettingsManager, SettingInt } from './SettingsManager';
import { DBManager } from './DBManager';
import { Drink } from '../model/Drink';
import { Cycle } from '../model/Cycle';
import { ValidationResult } from '../model/ValidationResult';
import { Utils } from '../utils/Utils';

export class AddDrinkManager {
  private static instance: AddDrinkManager;
  private dbManager: DBManager;
  private settingsManager: SettingsManager;

  private constructor() {
    this.dbManager = DBManager.getInstance();
    this.settingsManager = SettingsManager.getInstance();
  }

  static getInstance(): AddDrinkManager {
    if (!AddDrinkManager.instance) {
      AddDrinkManager.instance = new AddDrinkManager();
    }
    return AddDrinkManager.instance;
  }

  async getOrCreateActiveCycle(): Promise<Cycle | null> {
    try {
      const dbCycle: import('./DBManager').Cycle | null = await this.dbManager.getLastCycle();

      // Convert DBManager Cycle to model Cycle
      let activeCycle: Cycle | null = null;
      if (dbCycle) {
        activeCycle = new Cycle();
        activeCycle.number = dbCycle.number;
        activeCycle.startDate = dbCycle.startDate;
        activeCycle.isFinished = dbCycle.isFinished;
      }

      if (!activeCycle) {
        // Create a new cycle if none exists
        const dbCycles: import('./DBManager').Cycle[] = await this.dbManager.getAllCycles();
        let maxNumber: number = 0;
        dbCycles.forEach((dbCycle: import('./DBManager').Cycle) => {
          if (dbCycle.number && dbCycle.number > maxNumber) {
            maxNumber = dbCycle.number;
          }
        });

        const newCycleNumber: number = maxNumber + 1;
        const now: Date = new Date();

        // Create new cycle
        await this.dbManager.createCycle(newCycleNumber, now);

        // Get the newly created cycle
        const newDbCycle: import('./DBManager').Cycle | null = await this.dbManager.getLastCycle();
        if (newDbCycle) {
          activeCycle = new Cycle();
          activeCycle.number = newDbCycle.number;
          activeCycle.startDate = newDbCycle.startDate;
          activeCycle.isFinished = newDbCycle.isFinished;
        }

        // Update cycle number in settings
        await this.settingsManager.setInt(SettingInt.LastCycleNumber, newCycleNumber);
      }

      return activeCycle;
    } catch (error) {
      console.error('Failed to get or create active cycle:', JSON.stringify(error));
      return null;
    }
  }

  async saveDrink(
    drinkType: DrinkType,
    quantity: number,
    unit: LiquidVolumeUnit,
    selectedTime: Date,
    cycle: Cycle
  ): Promise<boolean> {
    try {
      // Convert quantity to ml if needed
      let finalQuantity: number = quantity;
      if (unit !== LiquidVolumeUnit.Ml) {
        finalQuantity = Utils.convertLiquidVolume(quantity, unit, LiquidVolumeUnit.Ml);
      }

      // Create date based on cycle's start date
      const selectedDateTime: Date = this.createDateTimeFromCycle(cycle, selectedTime);

      // Save to database using the existing DBManager method
      await this.dbManager.addDrink(
        cycle.number,
        drinkType,
        Math.round(finalQuantity), // Convert to integer as your DB expects
        selectedDateTime
      );

      console.info(`Drink saved successfully. Type: ${drinkType}, Quantity: ${finalQuantity} ml, Cycle: ${cycle.number}`);

      return true;
    } catch (error) {
      console.error('Failed to save drink:', JSON.stringify(error));
      await promptAction.showToast({
        message: 'Failed to save drink',
        duration: 2000
      });
      return false;
    }
  }

  private createDateTimeFromCycle(cycle: Cycle, selectedTime: Date): Date {
    if (cycle.startDate) {
      const calendar: Date = new Date(cycle.startDate);
      calendar.setHours(selectedTime.getHours());
      calendar.setMinutes(selectedTime.getMinutes());
      calendar.setSeconds(0);
      calendar.setMilliseconds(0);
      return calendar;
    } else {
      const fallback: Date = new Date();
      fallback.setHours(selectedTime.getHours());
      fallback.setMinutes(selectedTime.getMinutes());
      fallback.setSeconds(0);
      fallback.setMilliseconds(0);
      return fallback;
    }
  }

  async getFavoriteVolumeUnit(): Promise<LiquidVolumeUnit> {
    try {
      const savedUnit: number = await this.settingsManager.getInt(SettingInt.FavouriteLiquidVolumeUnit);
      if (savedUnit !== undefined && savedUnit >= 0 && savedUnit < 3) {
        return savedUnit as LiquidVolumeUnit;
      }
    } catch (error) {
      console.error('Failed to get favorite volume unit:', JSON.stringify(error));
    }
    return LiquidVolumeUnit.Ml;
  }

  async saveFavoriteVolumeUnit(unit: LiquidVolumeUnit): Promise<void> {
    try {
      await this.settingsManager.setInt(SettingInt.FavouriteLiquidVolumeUnit, unit);
    } catch (error) {
      console.error('Failed to save favorite volume unit:', JSON.stringify(error));
    }
  }

  validateDrinkInput(
    selectedDrinkType: DrinkType | null,
    quantityInput: string
  ): ValidationResult {
    if (!selectedDrinkType) {
      return new ValidationResult(false, 'Please choose a drink type');
    }

    const quantity: number = parseInt(quantityInput);
    if (isNaN(quantity) || quantity <= 0) {
      return new ValidationResult(false, 'Please enter a valid amount');
    }

    return new ValidationResult(true, '');
  }
}