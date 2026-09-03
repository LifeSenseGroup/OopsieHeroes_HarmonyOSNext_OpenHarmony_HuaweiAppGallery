// entry/src/main/ets/enum/LiquidVolumeUnit.ets
export enum LiquidVolumeUnit {
  Ml = 0,
  Oz = 1,
  Cup = 2
}

export class LiquidVolumeUnitHelper {
  static getDisplayName(unit: LiquidVolumeUnit): string {
    switch (unit) {
      case LiquidVolumeUnit.Ml:
        return 'ml';
      case LiquidVolumeUnit.Oz:
        return 'oz';
      case LiquidVolumeUnit.Cup:
        return 'cup';
      default:
        return 'ml';
    }
  }

  static getConversionRate(unit: LiquidVolumeUnit): number {
    switch (unit) {
      case LiquidVolumeUnit.Ml:
        return 1;
      case LiquidVolumeUnit.Oz:
        return 29.57;
      case LiquidVolumeUnit.Cup:
        return 240;
      default:
        return 1;
    }
  }

  static getAllUnits(): LiquidVolumeUnit[] {
    return [LiquidVolumeUnit.Ml, LiquidVolumeUnit.Oz, LiquidVolumeUnit.Cup];
  }
}