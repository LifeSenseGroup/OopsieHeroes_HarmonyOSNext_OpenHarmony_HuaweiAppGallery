import ble from '@ohos.bluetooth.ble';
import emitter from '@ohos.events.emitter';
import { BusinessError } from '@kit.BasicServicesKit';
import { SensorCommand } from '../enum/SensorCommand';
import { DBManager, Cycle } from './DBManager';
import { SettingBoolean, SettingInt, SettingString, SettingsManager } from './SettingsManager';
import { SensorEvent } from '../model/SensorEvent';

export const SENSOR_EVENT_ID = 1001;

// Define exact UUIDs from Android source
const SERVICE_UUID = '00001523-3EDB-ECAC-9B4B-631F8A7F885E';
const CHARACTERISTIC_UUID = '00001525-3EDB-ECAC-9B4B-631F8A7F885E';
const MILLIS_IN_CYCLE = 24 * 60 * 60 * 1000;

export interface SensorUpdateEvent {
  status?: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING';
  battery?: number;
  message?: string;
}

export class SensorManager {
  private static instance: SensorManager;
  private gattClient: ble.GattClientDevice | null = null;
  private characteristic: ble.BLECharacteristic | null = null;
  public isConnected: boolean = false;
  private deviceId: string = '';
  private isServiceReady: boolean = false;
  private readingOutEvent: boolean = false;
  private onlySyncNoMeasuring: boolean = false;
  private sensorEvent: SensorEvent | null = null;
  private currentEventFromSensor: number = 0;
  private expectingFirmwareVersion: boolean = false;
  private retryCount: number = 0;
  private readonly maxRetries: number = 3;
  private readonly retryDelayMs: number = 15000;
  private retryTimerId: number = -1;
  private readTimerId: number = -1;
  private readDueAt: number = 0;
  private bleOperation: Promise<void> = Promise.resolve();
  private reconnectTimerId: number = -1;
  private shouldReconnect: boolean = false;
  private isConnecting: boolean = false;

  private queuedStart: boolean = false;
  private queuedStop: boolean = false;
  private queuedClearFlash: boolean = false;
  private queuedReadFirmware: boolean = false;
  private queuedTimer: number = 0;

  private constructor() {}

  public static getInstance(): SensorManager {
    if (!SensorManager.instance) {
      SensorManager.instance = new SensorManager();
    }
    return SensorManager.instance;
  }

  // --- PUBLIC API ---

  public async start(_context?: Object) {
    const savedAddress = await SettingsManager.getInstance().getString(SettingString.SensorAddress);
    this.deviceId = savedAddress;
    this.shouldReconnect = !!savedAddress;
    if (savedAddress && !this.isConnected) {
      this.connect(savedAddress);
    }
  }

  /**
   * Stops the sensor service.
   * Disconnects Bluetooth and cleans up resources.
   */
  public stop() {
    this.isConnected = false;
    this.isServiceReady = false;
    this.characteristic = null;
    this.shouldReconnect = false;
    this.isConnecting = false;
    this.cancelRetry();
    this.cancelScheduledRead();
    this.cancelReconnect();
    if (this.gattClient) {
      try {
        this.gattClient.disconnect();
        this.gattClient.close(); // Clean up native resources
        this.gattClient = null;
        console.info('SensorManager: Stopped and disconnected.');
      } catch (err) {
        console.error('SensorManager: Error stopping', err);
      }
    }
    this.emitStatus('DISCONNECTED');
  }

  public getIsConnected(): boolean {
    return this.isConnected;
  }

  public connect(deviceId: string) {
    if (!deviceId || this.isConnected || this.isConnecting) return;

    this.deviceId = deviceId;
    this.shouldReconnect = true;
    this.isConnecting = true;
    try {
      this.cancelReconnect();
      this.closeGattClient();
      this.gattClient = ble.createGattClientDevice(deviceId);

      this.gattClient.on('BLEConnectionStateChange', (state) => {
        if (state.state === 0) { // Disconnected
          console.info('SensorManager: disconnected');
          this.isConnected = false;
          this.isServiceReady = false;
          this.isConnecting = false;
          this.characteristic = null;
          this.cancelScheduledRead();
          this.emitStatus('DISCONNECTED');
          this.scheduleReconnect();
        } else if (state.state === 2) { // Connected
          console.info('SensorManager: connected');
          this.isConnected = true;
          this.isConnecting = false;
          this.cancelReconnect();
          this.emitStatus('CONNECTED');
          this.discoverServices();
        }
      });

      this.gattClient.connect();
    } catch (err) {
      this.isConnecting = false;
      console.error('SensorManager: connect failed ' + JSON.stringify(err));
      this.scheduleReconnect();
    }
  }

  public async sendStartCommand() {
    if (!this.isConnected) return;

    this.queuedTimer = Math.floor(Date.now() / 1000);
    this.queuedStart = true;
    await this.processQueuedCommands();
  }

  public async sendStopCommand() {
    if (!this.isConnected) return;
    this.queuedStop = true;
    this.queuedClearFlash = true;
    await this.processQueuedCommands();
  }

  public async stopMeasurementCommand() {
    await this.sendStopCommand();
  }

  public async startSync() {
    await SettingsManager.getInstance().setInt(SettingInt.ExpectedEvent, 1);
    await SettingsManager.getInstance().setBoolean(SettingBoolean.HasEverMeasured, true);
    this.onlySyncNoMeasuring = true;
    this.clearOutstandingCommands();
    this.queuedReadFirmware = true;

    if (!this.isConnected && this.deviceId) {
      this.connect(this.deviceId);
      return;
    }

    await this.processQueuedCommands();
    this.scheduleRead(1);
  }

  // --- INTERNAL LOGIC ---

  private discoverServices() {
    if (!this.gattClient) return;

    this.gattClient.getServices().then((services) => {
      let service = services.find(s => s.serviceUuid.toUpperCase() === SERVICE_UUID);
      let characteristic = service?.characteristics.find(c => c.characteristicUuid.toUpperCase() === CHARACTERISTIC_UUID);
      if (service && characteristic) {
        this.characteristic = characteristic;
        this.isServiceReady = true;
        console.info(`SensorManager: service ready ${service.serviceUuid} / ${characteristic.characteristicUuid}`);
        this.enableNotifications();
        this.clearOutstandingCommands();
        this.queuedReadFirmware = true;
        this.queuedTimer = Math.floor(Date.now() / 1000);
        this.processQueuedCommands();
        this.scheduleRead(1);
      } else {
        console.error(`SensorManager: sensor service/characteristic not found. services=${services.length}`);
      }
    }).catch((err: BusinessError) => {
      console.error(`SensorManager: service discovery failed ${err.code} ${err.message}`);
    });
  }

  private enableNotifications() {
    if (!this.gattClient || !this.characteristic) return;

    this.gattClient.setCharacteristicChangeNotification(this.characteristic, true)
      .then(() => {
        console.info('SensorManager: notifications enabled');
        // Now listen for the change events
        this.gattClient!.on('BLECharacteristicChange', (data) => {
          this.handleIncomingData(data.characteristicValue);
        });
      })
      .catch((err: BusinessError) => {
        console.error(`SensorManager: failed to enable notifications ${err.code} ${err.message}`);
      });
  }

  private async handleIncomingData(buffer: ArrayBuffer) {
    let text = String.fromCharCode.apply(null, new Uint8Array(buffer));
    console.info(`SensorManager: sensor data ${text}`);
    await this.processSensorInput(text);
  }

  private async syncTime() {
    const epoch = Math.floor(Date.now() / 1000);
    const cmd = SensorCommand.SEND_TIMER.replace('%d', epoch.toString());
    await this.writeCommand(cmd);
  }

  private async writeCommand(command: string): Promise<boolean> {
    if (!this.gattClient || !this.characteristic) {
      console.error(`SensorManager: write skipped, characteristic not ready for ${command}`);
      return false;
    }

    let buffer = new ArrayBuffer(command.length);
    let view = new Uint8Array(buffer);
    for (let i = 0; i < command.length; i++) {
      view[i] = command.charCodeAt(i);
    }

    let characteristic: ble.BLECharacteristic = {
      serviceUuid: this.characteristic.serviceUuid,
      characteristicUuid: this.characteristic.characteristicUuid,
      characteristicValue: buffer,
      descriptors: this.characteristic.descriptors
    };

    // FIX 2: Pass Write Type as the second argument
    // GattWriteType.WRITE (default response) or WRITE_NO_RESPONSE
    try {
      await this.runBleOperation(`write ${command}`, async () => {
        await this.gattClient!.writeCharacteristicValue(characteristic, ble.GattWriteType.WRITE);
      });
      console.info(`SensorManager: wrote ${command}`);
      return true;
    } catch (err) {
      const businessError = err as BusinessError;
      console.error(`SensorManager: write failed for ${command}: ${businessError.code} ${businessError.message}`);
      return false;
    }
  }

  private async processSensorInput(input: string) {
    const cleanedInput = this.chopOffBadCharacters(input);
    let delay = 1;

    if (cleanedInput.indexOf('{') < 0) {
      if (this.expectingFirmwareVersion) {
        this.expectingFirmwareVersion = false;
        await this.saveFirmwareVersion(cleanedInput);
        await this.processQueuedCommands();
      }
      this.scheduleRead(delay);
      return;
    }

    const jsonObj = this.parseJson(cleanedInput);
    if (!jsonObj) {
      this.scheduleRead(delay);
      return;
    }

    if (Object.prototype.hasOwnProperty.call(jsonObj, 'CUR_EVT')) {
      console.info(`SensorManager: CUR_EVT received ${jsonObj['CUR_EVT']}`);
      await this.handleCurrentEvent(jsonObj);
      return;
    }

    if (this.sensorEvent) {
      console.info(`SensorManager: event fragment ${JSON.stringify(jsonObj)}`);
      const lastCycle = await DBManager.getInstance().getLastCycle();
      this.sensorEvent.add(jsonObj, lastCycle?.startDate);
    }

    this.scheduleRead(delay);
  }

  private async handleCurrentEvent(jsonObj: Record<string, Object>) {
    await this.finishCurrentSensorEventIfValid();

    this.cancelRetry();
    this.sensorEvent = null;
    this.readingOutEvent = false;
    this.currentEventFromSensor = Number(jsonObj['CUR_EVT']) || 0;

    const settings = SettingsManager.getInstance();
    let expectedEvent = await settings.getInt(SettingInt.ExpectedEvent);
    if (expectedEvent <= 0) {
      expectedEvent = 1;
      await settings.setInt(SettingInt.ExpectedEvent, expectedEvent);
    }

    if (expectedEvent <= this.currentEventFromSensor) {
      this.sensorEvent = new SensorEvent();
      this.readingOutEvent = true;
      this.emitStatus('SYNCING', `Processing ${expectedEvent} / ${this.currentEventFromSensor}`);
      await this.requestExpectedEvent(expectedEvent);
      this.scheduleRead(5);
      this.scheduleEventRetry(expectedEvent);
      return;
    }

    if (this.onlySyncNoMeasuring && this.currentEventFromSensor > 0) {
      this.queuedClearFlash = true;
      this.onlySyncNoMeasuring = false;
    }

    await this.processQueuedCommands();
    await settings.setString(SettingString.LastTimeDidSensorSync, new Date().toISOString());
    this.emitStatus('SYNCING', 'lasttimesynced');
    await this.dumpLeakDbToLog('sync complete');
    this.scheduleRead(3);
  }

  private async requestExpectedEvent(expectedEvent: number) {
    const command = SensorCommand.REQUEST_EVENT.replace('%d', expectedEvent.toString());
    console.info(`SensorManager: requesting event ${expectedEvent}`);
    const ok = await this.writeCommand(command);
    if (!ok) {
      console.error(`SensorManager: request event ${expectedEvent} write failed`);
    }
  }

  private async processQueuedCommands() {
    if (!this.isConnected || !this.isServiceReady) return;

    if (this.queuedReadFirmware) {
      this.queuedReadFirmware = false;
      this.expectingFirmwareVersion = true;
      await this.writeCommand(SensorCommand.READ_FIRMWARE);
      this.scheduleQueuedCommandIfNeeded();
      return;
    }

    if (this.queuedClearFlash) {
      this.queuedClearFlash = false;
      await this.writeCommand(SensorCommand.CLEAR_FLASH);
      this.scheduleQueuedCommandIfNeeded();
      return;
    }

    if (this.queuedTimer > 0) {
      const timer = this.queuedTimer;
      this.queuedTimer = 0;
      await this.writeCommand(SensorCommand.SEND_TIMER.replace('%d', timer.toString()));
      this.scheduleQueuedCommandIfNeeded();
      return;
    }

    if (this.queuedStart) {
      this.queuedStart = false;
      await this.writeCommand(SensorCommand.START_MEASURING);
      this.scheduleQueuedCommandIfNeeded();
      return;
    }

    if (this.queuedStop) {
      this.queuedStop = false;
      await this.writeCommand(SensorCommand.STOP_MEASURING);
      this.scheduleQueuedCommandIfNeeded();
    }
  }

  private scheduleQueuedCommandIfNeeded() {
    if (!this.hasQueuedCommands()) return;

    setTimeout(() => {
      this.processQueuedCommands();
    }, 700);
  }

  private hasQueuedCommands(): boolean {
    return this.queuedReadFirmware ||
      this.queuedClearFlash ||
      this.queuedTimer > 0 ||
      this.queuedStart ||
      this.queuedStop;
  }

  private clearOutstandingCommands() {
    this.currentEventFromSensor = 0;
    this.queuedStart = false;
    this.queuedStop = false;
    this.queuedTimer = 0;
    this.queuedClearFlash = false;
    this.queuedReadFirmware = false;
    this.expectingFirmwareVersion = false;
    this.readingOutEvent = false;
    this.sensorEvent = null;
    this.cancelRetry();
    this.cancelScheduledRead();
  }

  private scheduleRead(seconds: number) {
    if (!this.gattClient || !this.isConnected || !this.isServiceReady) return;

    const dueAt = Date.now() + (seconds * 1000);
    if (this.readTimerId !== -1 && this.readDueAt <= dueAt) {
      console.info(`SensorManager: read already scheduled in ${Math.max(0, Math.round((this.readDueAt - Date.now()) / 1000))}s`);
      return;
    }

    this.cancelScheduledRead();
    this.readDueAt = dueAt;
    this.readTimerId = setTimeout(() => {
      this.readTimerId = -1;
      this.readDueAt = 0;
      this.readSensorValue();
    }, seconds * 1000);
  }

  private async readSensorValue() {
    if (!this.gattClient || !this.characteristic) {
      console.error('SensorManager: read skipped, characteristic not ready');
      return;
    }

    let characteristic: ble.BLECharacteristic = {
      serviceUuid: this.characteristic.serviceUuid,
      characteristicUuid: this.characteristic.characteristicUuid,
      characteristicValue: new ArrayBuffer(0),
      descriptors: this.characteristic.descriptors
    };

    try {
      const result = await this.runBleOperation('read', async () => {
        return await this.gattClient!.readCharacteristicValue(characteristic);
      });
      await this.handleIncomingData(result.characteristicValue);
    } catch (err) {
      const businessError = err as BusinessError;
      console.error(`SensorManager: read failed ${businessError.code} ${businessError.message}`);
      this.scheduleRead(2);
    }
  }

  private scheduleEventRetry(expectedEvent: number, resetCount: boolean = true) {
    const currentRetryCount = this.retryCount;
    this.cancelRetry();
    if (!resetCount) {
      this.retryCount = currentRetryCount;
    }

    this.retryTimerId = setTimeout(async () => {
      if (!this.readingOutEvent) {
        this.cancelRetry();
        return;
      }

      if (await this.finishCurrentSensorEventIfValid()) {
        const settings = SettingsManager.getInstance();
        const nextExpectedEvent = await settings.getInt(SettingInt.ExpectedEvent);
        console.info(`SensorManager: event ${expectedEvent} completed by retry watchdog, next ${nextExpectedEvent}/${this.currentEventFromSensor}`);

        if (nextExpectedEvent <= this.currentEventFromSensor) {
          this.sensorEvent = new SensorEvent();
          this.readingOutEvent = true;
          this.emitStatus('SYNCING', `Processing ${nextExpectedEvent} / ${this.currentEventFromSensor}`);
          await this.requestExpectedEvent(nextExpectedEvent);
          this.scheduleRead(5);
          this.scheduleEventRetry(nextExpectedEvent);
          return;
        }

        if (this.onlySyncNoMeasuring && this.currentEventFromSensor > 0) {
          this.queuedClearFlash = true;
          this.onlySyncNoMeasuring = false;
        }

        await this.processQueuedCommands();
        await settings.setString(SettingString.LastTimeDidSensorSync, new Date().toISOString());
        this.emitStatus('SYNCING', 'lasttimesynced');
        await this.dumpLeakDbToLog('sync complete after watchdog');
        this.scheduleRead(3);
        return;
      }

      this.retryCount++;
      if (this.retryCount > this.maxRetries) {
        console.error(`SensorManager: retry event ${expectedEvent} failed after ${this.maxRetries} retries`);
        await this.dumpLeakDbToLog(`retry event ${expectedEvent} failed`);
        this.emitStatus('SYNCING', `Retrying event ${expectedEvent} failed`);
        this.cancelRetry();
        this.scheduleRead(3);
        return;
      }

      console.info(`SensorManager: retry ${this.retryCount}/${this.maxRetries} for event ${expectedEvent}`);
      this.requestExpectedEvent(expectedEvent).then(() => {
        this.scheduleRead(5);
        this.scheduleEventRetry(expectedEvent, false);
      });
    }, this.retryDelayMs);
  }

  private cancelRetry() {
    if (this.retryTimerId !== -1) {
      clearTimeout(this.retryTimerId);
      this.retryTimerId = -1;
    }
    this.retryCount = 0;
  }

  private cancelScheduledRead() {
    if (this.readTimerId !== -1) {
      clearTimeout(this.readTimerId);
      this.readTimerId = -1;
    }
    this.readDueAt = 0;
  }

  private scheduleReconnect() {
    if (!this.shouldReconnect || !this.deviceId || this.reconnectTimerId !== -1 || this.isConnected || this.isConnecting) {
      return;
    }

    console.info('SensorManager: reconnect scheduled');
    this.reconnectTimerId = setTimeout(() => {
      this.reconnectTimerId = -1;
      if (!this.shouldReconnect || this.isConnected || this.isConnecting || !this.deviceId) {
        return;
      }

      console.info('SensorManager: reconnecting');
      this.connect(this.deviceId);
    }, 5000);
  }

  private cancelReconnect() {
    if (this.reconnectTimerId !== -1) {
      clearTimeout(this.reconnectTimerId);
      this.reconnectTimerId = -1;
    }
  }

  private closeGattClient() {
    if (!this.gattClient) return;

    try {
      this.gattClient.close();
    } catch (err) {
      console.error('SensorManager: close gatt failed ' + JSON.stringify(err));
    }
    this.gattClient = null;
  }

  private async runBleOperation<T>(name: string, operation: () => Promise<T>): Promise<T> {
    let release: () => void = () => {};
    const previousOperation = this.bleOperation.catch(() => {});
    this.bleOperation = previousOperation.then(() => {
      return new Promise<void>((resolve) => {
        release = resolve;
      });
    });

    await previousOperation;

    try {
      console.info(`SensorManager: BLE operation start ${name}`);
      return await operation();
    } finally {
      setTimeout(() => {
        console.info(`SensorManager: BLE operation done ${name}`);
        release();
      }, 250);
    }
  }

  private parseJson(input: string): Record<string, Object> | null {
    const fixedQuotes = input.replace(/'/g, '"');
    const start = fixedQuotes.indexOf('{');
    const end = fixedQuotes.lastIndexOf('}');
    if (start < 0 || end < start) return null;

    try {
      return JSON.parse(fixedQuotes.substring(start, end + 1)) as Record<string, Object>;
    } catch (err) {
      console.error(`SensorManager: JSON parse failed for ${input}`);
      return null;
    }
  }

  private chopOffBadCharacters(input: string): string {
    let result = '';
    for (let i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) > 31) {
        result += input.charAt(i);
      }
    }

    if (result.indexOf('{') >= 0 && result.indexOf('}') < 0) {
      return result + '}';
    }
    return result;
  }

  private async saveSensorEvent(event: SensorEvent) {
    const db = DBManager.getInstance();
    if (!event.date || !event.eventType) return;

    if (event.eventType.indexOf('LEAK') >= 0) {
      const lastLeak = await db.getLastLeak();
      if (lastLeak && !lastLeak.endDate) {
        await db.finishLeak(lastLeak.id, event.date, false);
      }
      await this.addLeakToBestCycle(event.date, event.activity, event.quantity);
    }

    if (event.eventType.indexOf('DRY') >= 0) {
      const lastLeak = await db.getLastLeak();
      if (lastLeak && !lastLeak.endDate) {
        await db.finishLeak(lastLeak.id, event.date, true);
      }
    }
  }

  private async finishCurrentSensorEventIfValid(): Promise<boolean> {
    if (!this.readingOutEvent || !this.sensorEvent?.isValid()) {
      return false;
    }

    await this.saveSensorEvent(this.sensorEvent);
    await SettingsManager.getInstance().increaseExpectedEvent();
    this.sensorEvent = null;
    this.readingOutEvent = false;
    this.cancelRetry();
    return true;
  }

  private async dumpLeakDbToLog(reason: string): Promise<void> {
    try {
      const db = DBManager.getInstance();
      const cycles = await db.getAllCycles();
      const leaks = await db.getAllLeaks();
      console.info(`SensorManager: Leak DB dump (${reason}) cycles=${cycles.length} leaks=${leaks.length}`);

      cycles.forEach((cycle) => {
        console.info(`SensorManager: DB cycle #${cycle.number} start=${cycle.startDate.toISOString()} finished=${cycle.isFinished}`);
      });

      leaks.forEach((leak) => {
        const endDate = leak.endDate ? leak.endDate.toISOString() : '-';
        console.info(`SensorManager: DB leak id=${leak.id} cycle=${leak.cycleNumber} start=${leak.startDate.toISOString()} end=${endDate} activity=${leak.activity} volume=${leak.volume} duration=${leak.duration}`);
      });
    } catch (err) {
      console.error('SensorManager: Leak DB dump failed ' + JSON.stringify(err));
    }
  }

  private async addLeakToBestCycle(date: Date, activity: number, volume: number) {
    const db = DBManager.getInstance();
    const lastCycle = await db.getLastCycle();
    if (lastCycle && await this.tryAddLeakToCycle(lastCycle, date, activity, volume)) {
      return;
    }

    const lastFinishedCycle = await db.getLastFinishedCycle();
    if (lastFinishedCycle) {
      await this.tryAddLeakToCycle(lastFinishedCycle, date, activity, volume);
    }
  }

  private async tryAddLeakToCycle(cycle: Cycle, date: Date, activity: number, volume: number): Promise<boolean> {
    const start = cycle.startDate.getTime();
    const end = start + MILLIS_IN_CYCLE;
    const eventTime = date.getTime();
    if (eventTime < start || eventTime > end) {
      return false;
    }

    const secondsOfThisEvent = Math.floor((eventTime - start) / 1000);
    const allLeaks = await DBManager.getInstance().getAllLeaks();
    const duplicate = allLeaks.some((leak) => {
      if (leak.cycleNumber !== cycle.number) return false;
      const leakSeconds = Math.floor((leak.startDate.getTime() - start) / 1000);
      return leakSeconds === secondsOfThisEvent;
    });

    if (duplicate) {
      return false;
    }

    await DBManager.getInstance().addLeakToCycle(cycle.number, date, activity, volume);
    await DBManager.getInstance().createDBEntry('Leak', 0, date, `Activity: ${activity} - Day: ${cycle.number}`);
    return true;
  }

  private async saveFirmwareVersion(input: string) {
    const hex = input.replace(/[^0-9a-fA-F]/g, '');
    if (!hex) return;

    const version = Number.parseInt(hex, 16);
    if (version > 0 && version < 20000) {
      await SettingsManager.getInstance().setInt(SettingInt.SensorFirmwareVersion, version);
      console.info(`SensorManager: Sensor Version ${version}`);
    }
  }

  private emitStatus(status: 'CONNECTED' | 'DISCONNECTED' | 'SYNCING', msg?: string) {
    let event: SensorUpdateEvent = { status: status, message: msg };
    emitter.emit({ eventId: SENSOR_EVENT_ID }, { data: event });
  }
}
