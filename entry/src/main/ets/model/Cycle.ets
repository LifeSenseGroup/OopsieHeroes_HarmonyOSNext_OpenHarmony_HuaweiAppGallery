// entry/src/main/ets/model/Cycle.ets
export class Cycle {
  number: number = 0;
  startDate: Date = new Date();
  isFinished: boolean = false;
  // Add endDate to match DBManager interface
  endDate?: Date;

  constructor() {
  }
}