export class SensorEvent {
  public eventType: string = "";
  public quantity: number = -1;
  public activity: number = -1;
  public date: Date | null = null;

  public add(jsonObj: Record<string, Object>, cycleStartDate?: Date): boolean {
    try {
      if (Object.prototype.hasOwnProperty.call(jsonObj, 'EVENT')) {
        this.eventType = String(jsonObj['EVENT']);
      }

      if (Object.prototype.hasOwnProperty.call(jsonObj, 'TMR')) {
        this.date = this.parseSensorDate(String(jsonObj['TMR']), cycleStartDate);
      }

      if (Object.prototype.hasOwnProperty.call(jsonObj, 'QTY')) {
        this.quantity = Number(jsonObj['QTY']);
      }

      if (Object.prototype.hasOwnProperty.call(jsonObj, 'ACT')) {
        this.activity = Number(jsonObj['ACT']);
      }

      return true;
    } catch (e) {
      console.error("SensorEvent parse error: " + JSON.stringify(e));
      return false;
    }
  }

  public isValid(): boolean {
    if (!this.eventType || !this.date) {
      return false;
    }

    if (this.eventType.indexOf('LEAK') >= 0) {
      return this.activity !== -1 && this.quantity !== -1;
    }

    return true;
  }

  private parseSensorDate(value: string, cycleStartDate?: Date): Date {
    const epochTime = Number(value);
    if (!Number.isNaN(epochTime)) {
      if (epochTime < 1535708025) {
        const base = cycleStartDate ? cycleStartDate.getTime() : Date.now();
        return new Date(base + epochTime * 1000);
      }
      return new Date(epochTime * 1000);
    }

    const parts = value.split(':').map((part) => Number(part));
    if (parts.length === 3 && parts.every((part) => !Number.isNaN(part))) {
      const millis = ((parts[0] * 60 * 60) + (parts[1] * 60) + parts[2]) * 1000;
      const base = cycleStartDate ? cycleStartDate.getTime() : Date.now();
      return new Date(base + millis);
    }

    return new Date();
  }
}
