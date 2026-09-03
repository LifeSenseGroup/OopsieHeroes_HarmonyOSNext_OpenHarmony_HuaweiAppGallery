// entry/src/main/ets/enum/DrinkType.ets
export enum DrinkType {
  Water = 'Water',
  Coffee = 'Coffee',
  Tea = 'Tea',
  Carbonated = 'Carbonated',
  Alcohol = 'Alcohol',
  NonCarbonated = 'NonCarbonated'
}

export class DrinkTypeHelper {
  static getDisplayName(type: DrinkType): string {
    switch (type) {
      case DrinkType.Water:
        return 'Water';
      case DrinkType.Coffee:
        return 'Coffee';
      case DrinkType.Tea:
        return 'Tea';
      case DrinkType.Carbonated:
        return 'Carbonated';
      case DrinkType.Alcohol:
        return 'Alcohol';
      case DrinkType.NonCarbonated:
        return 'Non-Carbonated';
      default:
        return '';
    }
  }

  static getAllTypes(): DrinkType[] {
    return [
      DrinkType.Water,
      DrinkType.Coffee,
      DrinkType.Tea,
      DrinkType.Carbonated,
      DrinkType.Alcohol,
      DrinkType.NonCarbonated
    ];
  }
}