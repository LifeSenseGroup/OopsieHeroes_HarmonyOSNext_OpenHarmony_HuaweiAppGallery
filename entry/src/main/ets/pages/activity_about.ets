import { CellLibrary } from './cell_library';
import router from '@ohos.router';
import bundleManager from '@ohos.bundle.bundleManager';
import common from '@ohos.app.ability.common';
import promptAction from '@ohos.promptAction';
import { SettingsManager, SettingString, SettingInt } from '../manager/SettingsManager';
import { SensorManager } from '../manager/SensorManager';

// Define Library Interface (Matches Android Library Model)
interface Library {
  name: string;
  link: string;
  license: string;
}

@Entry
@Component
struct ActivityAbout {
  // --- STATE ---
  @State appVersion: string = "Loading...";
  @State sensorMac: string = "- -";
  @State sensorSoftwareVersion: string = "- -";
  @State isSensorPaired: boolean = false;

  // Libraries (Hardcoded list to replace JSON parsing for simplicity)
  @State libraries: Library[] = [
    { name: "MPAndroidChart", link: "https://github.com/PhilJay/MPAndroidChart", license: "Apache 2.0" },
    { name: "MaterialCalendarView", link: "https://github.com/prolificinteractive/material-calendarview", license: "MIT" },
    { name: "Realm", link: "https://realm.io", license: "Apache 2.0" }
  ];

  // Colors
  private readonly colorPurple: string = '#9F86C0';
  private readonly colorTeal: string = '#17C3B2';
  private readonly colorTextPrimary: string = '#000000';
  private readonly colorTextSecondary: string = '#666666';

  aboutToAppear() {
    this.fetchAppVersion();
    this.loadSensorInfo();
  }

  // 1. Fetch App Version
  async fetchAppVersion() {
    try {
      let bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION;
      let bundleInfo = await bundleManager.getBundleInfoForSelf(bundleFlags);
      this.appVersion = `Version ${bundleInfo.versionName}`;
    } catch (error) {
      this.appVersion = "Version Unknown";
    }
  }

  // 2. Fetch Sensor Info from SettingsManager
  async loadSensorInfo() {
    const settings = SettingsManager.getInstance();
    const address = await settings.getString(SettingString.SensorAddress);
    const fwVersion = await settings.getInt(SettingInt.SensorFirmwareVersion);

    if (address && address.length > 0) {
      this.sensorMac = address;
      this.isSensorPaired = true;
    } else {
      this.sensorMac = "- -";
      this.isSensorPaired = false;
    }

    if (fwVersion > 0) {
      this.sensorSoftwareVersion = fwVersion.toString();
    } else {
      this.sensorSoftwareVersion = "- -";
    }
  }

  // 3. Handle Pairing / Unpairing
  async onPairingAction() {
    if (this.isSensorPaired) {
      // Logic for Unpairing (Android didn't explicit show unpair, but typically we clear settings)
      promptAction.showDialog({
        title: 'Unpair Sensor',
        message: 'Are you sure you want to forget this sensor?',
        buttons: [
          { text: 'Cancel', color: '#000000' },
          { text: 'Unpair', color: '#FF0000' }
        ]
      }).then(async (resp) => {
        if (resp.index === 1) {
          // Clear Settings
          const settings = SettingsManager.getInstance();
          await settings.setString(SettingString.SensorAddress, "");
          await settings.setString(SettingString.SensorName, "");
          await settings.setInt(SettingInt.SensorFirmwareVersion, 0);

          // Disconnect Bluetooth
          SensorManager.getInstance().stop();

          this.loadSensorInfo(); // Refresh UI
          promptAction.showToast({ message: "Sensor Unpaired" });
        }
      });
    } else {
      // Logic for Pairing
      router.pushUrl({ url: 'pages/activity_pair_new_sensor' });
    }
  }

  openUrl(url: string) {
    let context = getContext(this) as common.UIAbilityContext;
    context.startAbility({
      action: 'ohos.want.action.viewData',
      entities: ['entity.system.browsable'],
      uri: url
    }).catch((err: Error) => {
      promptAction.showToast({ message: "Could not open browser." });
    });
  }

  build() {
    Column() {
      // --- AppBar ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24).fillColor(this.colorTextSecondary)
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => router.back())

        Text($r('app.string.about'))
          .textCase(TextCase.UpperCase)
          .fontSize(18).fontWeight(FontWeight.Bold).layoutWeight(1).textAlign(TextAlign.Center).margin({ right: 48 })
      }
      .width('100%').height(56).border({ width: { bottom: 1 }, color: '#E0E0E0' })

      Scroll() {
        Column() {
          // --- App Info ---
          Row() {
            Image($r('app.media.logo_thin')).width(70).height(70)
            Column() {
              Text($r('app.string.app_full_name')).fontSize(16).fontWeight(FontWeight.Bold).margin({ bottom: 4 })
              Text(this.appVersion).fontSize(14).fontColor(this.colorTextSecondary)
            }
            .alignItems(HorizontalAlign.Start).justifyContent(FlexAlign.Center).margin({ left: 16 }).height(70)
          }
          .width('100%').margin({ top: 24 })

          // Links
          Text($r('app.string.carin_wear_website')).fontSize(14).fontColor(this.colorTeal).margin({ top: 24 }).onClick(() => this.openUrl("https://carinwear.com"))

          Divider().color(this.colorPurple).strokeWidth(1).margin({ top: 20, bottom: 20 })

          // --- Sensor Info ---
          Row() {
            // Change Icon based on connection state
            Image(this.isSensorPaired ? $r('app.media.ic_carin_sensor_only_border_thick2') : $r('app.media.ic_carin_sensor_only_border_thick2_barred')) // Assuming barred icon exists
              .width(50).height(60).objectFit(ImageFit.Contain)
            Text($r('app.string.carin_sensor')).fontSize(16).fontWeight(FontWeight.Medium).margin({ left: 24 })
          }
          .width('100%')

          Row() {
            Text($r('app.string.serial_number')).fontSize(14).fontColor(this.colorTextSecondary)
            Text(this.sensorMac).fontSize(14).fontColor(this.colorTextSecondary).margin({ left: 16 }).layoutWeight(1).textAlign(TextAlign.End)
          }
          .width('100%').margin({ top: 24 })

          Row() {
            Text($r('app.string.software_version')).fontSize(14).fontColor(this.colorTextSecondary)
            Text(this.sensorSoftwareVersion).fontSize(14).fontColor(this.colorTextSecondary).margin({ left: 16 })
            Blank().layoutWeight(1)

            // Update Button (Hidden if not paired)
            if (this.isSensorPaired) {
              Button({ type: ButtonType.Normal }) {
                Text("UPDATE").fontColor(Color.White).fontSize(12)
              }
              .backgroundColor(this.colorPurple).height(30).onClick(() => promptAction.showToast({message: "No updates available"}))
            }
          }
          .width('100%').margin({ top: 16 })

          // Pair/Unpair Button
          Button(this.isSensorPaired ? "UNPAIR SENSOR" : "PAIR NEW SENSOR") // Dynamic Text
            .type(ButtonType.Normal)
            .backgroundColor(this.isSensorPaired ? Color.White : this.colorTeal) // Outline vs Filled style
            .fontColor(this.isSensorPaired ? this.colorTeal : Color.White)
            .border(this.isSensorPaired ? { width: 1, color: this.colorTeal } : { width: 0 })
            .width('100%').height(48).margin({ top: 24 }).borderRadius(4)
            .onClick(() => this.onPairingAction())

          Divider().color(this.colorPurple).strokeWidth(1).margin({ top: 24, bottom: 24 })

          // --- Libraries ---
          Text($r('app.string.app_uses_libraries')).fontSize(14).fontColor(this.colorTextSecondary).margin({ bottom: 12 })

          ForEach(this.libraries, (lib: Library) => {
            // Inline Cell for simplicity or keep CellLibrary
            Column() {
              Text(lib.name).fontWeight(FontWeight.Bold)
              Text(lib.license).fontSize(12).fontColor('gray')
            }.width('100%').alignItems(HorizontalAlign.Start).margin({bottom: 8})
          })

        }
        .padding(16)
      }
    }
    .width('100%').height('100%').backgroundColor(Color.White)
  }
}
