export interface Cycle {
  number: number;      // Primary Key
  startDate: number;   // Epoch Milliseconds
  isFinished: boolean;
}

export interface Leak {
  id?: number;         // Auto-increment
  cycleNumber: number;
  startDate: number;
  endDate?: number;    // Nullable
  activity: number;
}

export interface Drink {
  id?: number;
  cycleNumber: number;
  type: string;
  quantity: number;
  date: number;
}

export interface DBEntry {
  id?: number;
  type: string;
  value: number;
  date: number;
  extraInfo: string;
}