// entry/src/main/ets/utils/Utils.ets
import { LiquidVolumeUnit, LiquidVolumeUnitHelper } from '../enum/LiquidVolumeUnit';
import { DrinkType } from '../enum/DrinkType';

export class Utils {
  static convertLiquidVolume(
    value: number,
    fromUnit: LiquidVolumeUnit,
    toUnit: LiquidVolumeUnit
  ): number {
    if (fromUnit === toUnit) {
      return value;
    }

    // Convert to ml first
    const inMl: number = value * LiquidVolumeUnitHelper.getConversionRate(fromUnit);

    // Convert from ml to target unit
    return inMl / LiquidVolumeUnitHelper.getConversionRate(toUnit);
  }

  static formatTime(date: Date): string {
    const hours: string = date.getHours().toString().padStart(2, '0');
    const minutes: string = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  static getDrinkTypeFromString(typeString: string): DrinkType | null {
    switch (typeString) {
      case 'Water':
        return DrinkType.Water;
      case 'Coffee':
        return DrinkType.Coffee;
      case 'Tea':
        return DrinkType.Tea;
      case 'Carbonated':
        return DrinkType.Carbonated;
      case 'Alcohol':
        return DrinkType.Alcohol;
      case 'NonCarbonated':
        return DrinkType.NonCarbonated;
      default:
        return null;
    }
  }
}