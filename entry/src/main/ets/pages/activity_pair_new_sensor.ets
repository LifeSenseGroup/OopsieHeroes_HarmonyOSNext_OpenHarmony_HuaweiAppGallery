import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { BluetoothPermissionPopup } from '../components/BluetoothPermissionPopup';
import bluetooth from '@ohos.bluetooth.access';
import ble from '@ohos.bluetooth.ble';
import constant from '@ohos.bluetooth.constant';
import { BusinessError } from '@kit.BasicServicesKit';
import { abilityAccessCtrl, Permissions } from '@kit.AbilityKit';
import { SettingInt, SettingsManager, SettingString } from '../manager/SettingsManager';
import { SensorCommand } from '../enum/SensorCommand';

// --- CONFIGURATION (From BluetoothUtils.kt & SensorCommand.kt) ---
const SERVICE_UUID = '00001523-3EDB-ECAC-9B4B-631F8A7F885E';
const WRITE_CHAR_UUID = '00001525-3EDB-ECAC-9B4B-631F8A7F885E';

interface SensorDevice {
  id: string;
  name: string;
  address: string;
  rssi: number;
}

@Entry
@Component
struct ActivityPairNewSensor {
  // --- STATE ---
  @State showBluetoothPermissionPopup: boolean = true;
  @State isScanning: boolean = false;
  @State pairButtonEnabled: boolean = false;
  @State foundSensors: SensorDevice[] = [];
  @State selectedSensorIndex: number = -1;
  @State isPairing: boolean = false;
  @State isBlinking: boolean = false;

  // --- COLORS ---
  private readonly colorPersianGreen: string = '#00A896';
  private readonly colorGreyBg: string = '#F2F2F2';
  private readonly colorBorder: string = '#E5E5E5';

  // --- BLUETOOTH OBJECTS ---
  private blinkGattClient: ble.GattClientDevice | null = null;
  private blinkCharacteristic: ble.BLECharacteristic | null = null;
  private blinkIntervalId: number = -1;
  private readonly bluetoothPermissions: Permissions[] = [
    'ohos.permission.ACCESS_BLUETOOTH',
    'ohos.permission.DISCOVER_BLUETOOTH',
    'ohos.permission.APPROXIMATELY_LOCATION'
  ];

  // --- LIFECYCLE ---
  aboutToAppear() {
    try {
      const state = bluetooth.getState();
      console.info(`ActivityPairNewSensor: Bluetooth state ${state}`);
    } catch (err) {
      console.error("Bluetooth check failed: " + JSON.stringify(err));
    }
  }

  aboutToDisappear() {
    this.stopScanning();
    this.stopBlinkingSequence();
  }

  // --- SCANNING LOGIC ---
  private async requestBluetoothPermissions(): Promise<boolean> {
    try {
      const context = getContext(this);
      const atManager = abilityAccessCtrl.createAtManager();
      const result = await atManager.requestPermissionsFromUser(context, this.bluetoothPermissions);
      const granted = result.authResults.every((item) => item === abilityAccessCtrl.GrantStatus.PERMISSION_GRANTED);
      console.info(`ActivityPairNewSensor: Bluetooth permission result ${JSON.stringify(result)}`);
      if (!granted) {
        promptAction.showToast({ message: 'Bluetooth permission is required to scan.' });
      }
      return granted;
    } catch (err) {
      console.error('ActivityPairNewSensor: Permission request failed: ' + JSON.stringify(err));
      promptAction.showToast({ message: 'Bluetooth permission request failed.' });
      return false;
    }
  }

  private async ensureBluetoothReady(): Promise<boolean> {
    try {
      if (bluetooth.getState() === bluetooth.BluetoothState.STATE_ON) {
        return true;
      }

      promptAction.showToast({ message: 'Please turn on Bluetooth.' });
      return false;
    } catch (err) {
      console.error('ActivityPairNewSensor: Bluetooth state check failed: ' + JSON.stringify(err));
      return false;
    }
  }

  private async startScanning() {
    if (!(await this.requestBluetoothPermissions())) {
      return;
    }

    if (!(await this.ensureBluetoothReady())) {
      return;
    }

    this.stopScanning();
    this.isScanning = true;
    this.foundSensors = [];
    this.selectedSensorIndex = -1;
    this.pairButtonEnabled = false;

    ble.on('BLEDeviceFind', (data: Array<ble.ScanResult>) => {
      console.info(`ActivityPairNewSensor: BLEDeviceFind ${data.length} result(s)`);
      data.forEach((result) => {
        let devName = result.deviceName || "Unknown Device";
        let devAddr = result.deviceId;

        // Simple duplicate check
        const exists = this.foundSensors.some(s => s.address === devAddr);
        if (!exists) {
          this.foundSensors.push({
            id: devAddr,
            name: devName,
            address: devAddr,
            rssi: result.rssi
          });
        }
      });
    });

    try {
      ble.startBLEScan(null);
      console.info('ActivityPairNewSensor: BLE scan started');

      // Auto-stop after 10s to save battery
      setTimeout(() => { if (this.isScanning) this.stopScanning(); }, 10000);
    } catch (err) {
      this.isScanning = false;
      console.error('ActivityPairNewSensor: Start scan failed: ' + JSON.stringify(err));
      promptAction.showToast({ message: 'Could not start Bluetooth scan.' });
    }
  }

  private stopScanning() {
    try {
      ble.stopBLEScan();
      ble.off('BLEDeviceFind');
      this.isScanning = false;
    } catch (err) {
      console.error('Stop scan failed: ' + JSON.stringify(err));
    }
  }

  // --- PAIRING (SAVE & EXIT) ---
  private async onPairClicked() {
    if (this.selectedSensorIndex === -1) return;

    this.stopScanning();
    this.stopBlinkingSequence();
    this.isPairing = true;

    // Simulate 2s delay (Matching Android 'pairingHandler')
    setTimeout(async () => {
      const sensor = this.foundSensors[this.selectedSensorIndex];

      // Save Persistent Data using our new Manager
      const settings = SettingsManager.getInstance();
      await settings.setString(SettingString.SensorName, sensor.name);
      await settings.setString(SettingString.SensorAddress, sensor.address);
      await settings.setInt(SettingInt.SensorFirmwareVersion, 0);

      this.isPairing = false;
      promptAction.showToast({ message: "Pairing Successful!" });

      router.replaceUrl({ url: 'pages/activity_home' })
        .catch((err: BusinessError) => {
          console.error('ActivityPairNewSensor: Navigate home failed: ' + JSON.stringify(err));
        });
    }, 2000);
  }

  // --- BLINKING LOGIC ---
  private onSensorClicked(index: number) {
    this.selectedSensorIndex = index;
    this.pairButtonEnabled = true;

    // Stop scanning to allow connection
    this.stopScanning();

    // Start blinking sequence immediately on selection
    this.blinkSensor(this.foundSensors[index].address);
  }

  private blinkSensor(address: string) {
    this.isBlinking = true;

    try {
      this.blinkGattClient = ble.createGattClientDevice(address);

      this.blinkGattClient.on('BLEConnectionStateChange', async (stateData) => {
        if (stateData.state === constant.ProfileConnectionState.STATE_CONNECTED) {
          console.info('Connected for Blinking');
          await this.discoverBlinkCharacteristic();
          this.startBlinkLoop();
        }
        else if (stateData.state === constant.ProfileConnectionState.STATE_DISCONNECTED) {
          console.info('Blink Disconnected');
          this.stopBlinkingSequence();
        }
      });

      this.blinkGattClient.connect();

    } catch (err) {
      this.stopBlinkingSequence();
      console.error('Blink connect failed: ' + JSON.stringify(err));
    }
  }

  private startBlinkLoop() {
    let blinkCount = 0;
    let isLedOn = false;
    const maxBlinks = 3 * 2; // 3 blinks (ON/OFF = 6 steps)

    this.blinkIntervalId = setInterval(() => {
      if (blinkCount >= maxBlinks) {
        // Finished -> Turn OFF and Disconnect
        this.writeCommand(SensorCommand.LED_OFF);
        setTimeout(() => { this.stopBlinkingSequence(); }, 500);
        return;
      }

      isLedOn = !isLedOn;
      const cmd = isLedOn ? SensorCommand.LED_ON : SensorCommand.LED_OFF;
      this.writeCommand(cmd);

      blinkCount++;
    }, 1000); // 1 Second Interval
  }

  private async discoverBlinkCharacteristic(): Promise<void> {
    if (!this.blinkGattClient) return;

    try {
      const services = await this.blinkGattClient.getServices();
      const service = services.find((item) => item.serviceUuid.toUpperCase() === SERVICE_UUID);
      const characteristic = service?.characteristics.find((item) => item.characteristicUuid.toUpperCase() === WRITE_CHAR_UUID);
      if (characteristic) {
        this.blinkCharacteristic = characteristic;
        console.info('ActivityPairNewSensor: Blink characteristic discovered');
      } else {
        console.error('ActivityPairNewSensor: Blink characteristic not found');
        promptAction.showToast({ message: 'Could not find sensor write characteristic.' });
      }
    } catch (err) {
      console.error('ActivityPairNewSensor: Service discovery failed: ' + JSON.stringify(err));
      promptAction.showToast({ message: 'Could not discover sensor services.' });
    }
  }

  private writeCommand(commandString: string) {
    if (!this.blinkGattClient) return;
    if (!this.blinkCharacteristic) {
      console.error('ActivityPairNewSensor: Write skipped, characteristic not ready');
      return;
    }

    // Convert String to ArrayBuffer for BLE
    const buffer = new ArrayBuffer(commandString.length);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < commandString.length; i++) {
      view[i] = commandString.charCodeAt(i);
    }

    let characteristic: ble.BLECharacteristic = {
      serviceUuid: this.blinkCharacteristic.serviceUuid,
      characteristicUuid: this.blinkCharacteristic.characteristicUuid,
      characteristicValue: buffer,
      descriptors: this.blinkCharacteristic.descriptors
    };

    try {
      const writeResult = this.blinkGattClient.writeCharacteristicValue(characteristic, ble.GattWriteType.WRITE);
      if (writeResult && typeof writeResult.catch === 'function') {
        writeResult.catch((err: BusinessError) => {
          console.error('Write failed Code: ' + err.code + ', Message: ' + err.message);
        });
      }
    } catch (err) {
      const businessError = err as BusinessError;
      console.error('Write failed Code: ' + businessError.code + ', Message: ' + businessError.message);
    }
  }

  private stopBlinkingSequence() {
    this.isBlinking = false;
    this.blinkCharacteristic = null;
    if (this.blinkIntervalId !== -1) {
      clearInterval(this.blinkIntervalId);
      this.blinkIntervalId = -1;
    }
    if (this.blinkGattClient) {
      this.blinkGattClient.close();
      this.blinkGattClient = null;
    }
  }

  // --- UI BUILDER ---
  build() {
    Stack() {
      Column({ space: 0 }) {
        this.AppBar()

        Column({ space: 0 }) {
          List() {
            ForEach(this.foundSensors, (sensor: SensorDevice, index: number) => {
              ListItem() {
                this.SensorListItem(sensor, index)
              }
            })
          }
          .layoutWeight(1)
          .width('100%')
          .backgroundColor(Color.White)
          .divider({ strokeWidth: 1, color: this.colorBorder })
          .margin({ top: 8, bottom: 8, left: 8, right: 8 })

          this.ScanningInfoSection()
        }
        .layoutWeight(1)
        .width('100%')
        .backgroundColor(this.colorGreyBg)

        this.BottomButtons()
      }
      .width('100%')
      .height('100%')
      .backgroundColor(Color.White)

      if (this.showBluetoothPermissionPopup) {
        BluetoothPermissionPopup({
          isVisible: $showBluetoothPermissionPopup,
          onAllow: () => {
            this.showBluetoothPermissionPopup = false;
            this.startScanning();
          },
          onDeny: () => { router.back(); }
        })
      }

      if (this.isPairing) { this.LoadingOverlay("Pairing...") }
      if (this.isBlinking) { this.LoadingOverlay("Connecting...") }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  AppBar() {
    Row({ space: 0 }) {
      Blank().width(56).height(56)
      Text('PAIR A NEW SENSOR')
        .fontSize(18).fontWeight(FontWeight.Bold).fontColor('#4A235A').textAlign(TextAlign.Center).layoutWeight(1)
      Image($r('app.media.ic_info_outline_black_24dp'))
        .width(56).height(56).fillColor(this.colorPersianGreen).padding(16)
        .onClick(() => {
          promptAction.showDialog({
            title: 'Guide',
            message: 'Make sure your sensor is charged and nearby.',
            buttons: [{ text: 'Got it', color: '#0000FF' }]
          });
        })
    }
    .width('100%').height(56).alignItems(VerticalAlign.Center).backgroundColor(Color.White)
  }

  @Builder
  SensorListItem(sensor: SensorDevice, index: number) {
    Row() {
      Column() {
        Text(sensor.name || "Unknown").fontSize(16).fontWeight(FontWeight.Bold).fontColor(Color.Black)
        Text(sensor.address).fontSize(14).fontColor(Color.Gray).margin({ top: 4 })
      }
      .alignItems(HorizontalAlign.Start)
      Blank().layoutWeight(1)
      if (this.selectedSensorIndex === index) {
        Image($r('app.media.ic_check_circle_24px')).width(24).height(24).fillColor(this.colorPersianGreen)
      }
    }
    .width('100%').padding(16).backgroundColor(this.selectedSensorIndex === index ? '#E8F5E9' : Color.White)
    .onClick(() => { this.onSensorClicked(index); })
  }

  @Builder
  ScanningInfoSection() {
    Row({ space: 16 }) {
      if (this.isScanning) {
        LoadingProgress().width(24).height(24).color(this.colorPersianGreen)
      } else {
        Image($r('app.media.ic_refresh_black_24dp')).width(24).height(24).fillColor(this.colorPersianGreen)
          .onClick(() => this.startScanning())
      }
      Text(this.isScanning ? 'Looking for sensors...' : 'Scan finished').fontSize(16).fontColor(Color.Black).layoutWeight(1)
    }
    .width('100%').height(56).padding({ left: 16, right: 16 }).backgroundColor(Color.White).alignItems(VerticalAlign.Center)
    .shadow({ radius: 4, color: '#20000000', offsetY: -2 })
  }

  @Builder
  BottomButtons() {
    Column() {
      Button('PAIR', { type: ButtonType.Normal })
        .onClick(() => this.onPairClicked()).width('90%').height(48)
        .enabled(this.pairButtonEnabled).backgroundColor(this.colorPersianGreen)
        .opacity(this.pairButtonEnabled ? 1.0 : 0.24).margin({ top: 24, bottom: 6 })
      Button('Later')
        .onClick(() => { router.replaceUrl({ url: 'pages/activity_home' }); }).width('90%')
        .backgroundColor(Color.Transparent).fontColor(Color.Black).margin({ bottom: 12 })
    }
    .width('100%').alignItems(HorizontalAlign.Center).backgroundColor(Color.White)
  }

  @Builder
  LoadingOverlay(text: string) {
    Stack() {
      Rect().width('100%').height('100%').fill('#80000000').onClick(() => {})
      Column() {
        LoadingProgress().width(40).height(40).color(Color.White)
        Text(text).fontSize(16).fontColor(Color.White).margin({ top: 16 })
      }
      .width(150).height(150).backgroundColor('#CC000000').borderRadius(12).justifyContent(FlexAlign.Center)
    }
    .width('100%').height('100%')
  }
}
