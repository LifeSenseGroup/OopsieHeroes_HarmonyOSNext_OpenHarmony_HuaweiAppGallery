/** Local sleep record used by the prediction engine. Dates stay on the device. */
export enum OopsieEventType {
  START = 'start',
  STOP = 'stop',
  LEAK = 'leak',
  WAKE = 'wake'
}

export interface OopsieEvent {
  type: OopsieEventType;
  value: number;
  date: Date;
  extraInfo: string;
}
