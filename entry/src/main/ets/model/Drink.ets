// entry/src/main/ets/model/Drink.ets
export class Drink {
  id?: number;
  type: string = '';
  quantity: number = 0;
  date: Date = new Date();
  cycleNumber: number = 0;

  constructor() {
  }
}