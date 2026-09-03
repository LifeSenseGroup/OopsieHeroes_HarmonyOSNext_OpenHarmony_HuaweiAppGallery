import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import emitter from '@ohos.events.emitter';
import { SensorManager, SENSOR_EVENT_ID, SensorUpdateEvent } from '../manager/SensorManager';
import { CycleManager } from '../manager/CycleManager';

// Define interface for dialog response
interface DialogResponse {
  index: number;
}

@Entry
@Component
struct ActivityHome {
  // --- STATE ---
  @State progressValue: number = 0;
  @State isConnected: boolean = false;
  @State syncStatusText: string = "Synchronizing with the sensor...";
  @State isSyncing: boolean = false;
  @State isMeasuring: boolean = false;

  // --- COLORS (Matches Android resources) ---
  private readonly colorPersianGreen: string = '#00A896';
  private readonly colorLightPurple: string = '#D1C4E9';
  private readonly colorDarkPurple: string = '#4A235A';
  private readonly colorViolet: string = '#9F86C0'; // Used for tinting buttons

  // --- LIFECYCLE ---
  aboutToAppear() {
    // 1. Check Initial State
    this.checkStatus();

    // 2. Start Sensor Manager
    SensorManager.getInstance().start(getContext(this));

    // 3. Listen for Sensor Events
    emitter.on({ eventId: SENSOR_EVENT_ID }, (eventData: emitter.EventData) => {
      let data = eventData.data as SensorUpdateEvent;
      if (data.status === 'CONNECTED') {
        this.isConnected = true;
        this.syncStatusText = "Connected";
        this.isSyncing = false;
      }
      else if (data.status === 'DISCONNECTED') {
        this.isConnected = false;
        this.syncStatusText = "Not Connected";
        this.isSyncing = false;
      }
      else if (data.status === 'SYNCING') {
        this.syncStatusText = data.message || "Synchronizing with the sensor...";
        this.isSyncing = true;
      }
    });

    // 4. Calculate Progress (Placeholder - see note below)
    this.calculateProgress();
  }

  async checkStatus() {
    this.isMeasuring = await CycleManager.getInstance().isMeasuring();
    this.isConnected = SensorManager.getInstance().isConnected;
  }

  // TODO: Logic for progress needs to be ported from Home.kt
  calculateProgress() {
    // For now, setting to 50% to match screenshot
    this.progressValue = 50;
  }

  // --- NAVIGATION HELPERS ---
  navigateTo(url: string) {
    router.pushUrl({ url: url });
  }

  build() {
    Column() {
      // 1. APP BAR
      Stack({ alignContent: Alignment.Center }) {
        // Left side - Empty space to maintain centering
        Row()
          .width('100%')
          .justifyContent(FlexAlign.Start)
          .padding({ left: 16 })
          .height('100%')

        // Center: Sync Status
        Text(this.syncStatusText)
          .fontSize(12)
          .fontColor('#808080')
          .textAlign(TextAlign.Center)

        // Right: Settings & Sync
        Row() {
          // Sync Icon
          Image($r('app.media.ic_sync_black_24dp'))
            .width(24)
            .height(24)
            .fillColor(Color.Black)
            .margin({ right: 16 })
            .onClick(() => {
              if (this.isConnected) {
                promptAction.showToast({ message: "Syncing..." });
              }
            })

          // Settings Icon
          Stack({ alignContent: Alignment.TopEnd }) {
            Image($r('app.media.ic_carin_sensor'))
              .width(28)
              .height(28)
              .fillColor(this.colorLightPurple)

            if (this.isConnected) {
              Circle({ width: 9, height: 9 })
                .fill(this.colorPersianGreen)
                .stroke(Color.White)
                .strokeWidth(1)
                .position({ x: 20, y: 1 })
            }
          }
          .width(30)
          .height(30)
          .onClick(() => {
            this.navigateTo('pages/activity_about');
          })
        }
        .width('100%')
        .justifyContent(FlexAlign.End)
        .padding({ right: 16 })
        .height('100%')

        // Bottom Divider
        Divider()
          .color(this.colorLightPurple)
          .strokeWidth(1)
          .position({ x: 0, y: 55 })
      }
      .width('100%')
      .height(56)

      // 2. MAIN CONTENT
      Column() {
        // --- TOP HALF: PROGRESS ---
        Column() {
          Stack({ alignContent: Alignment.Center }) {
            // Progress Ring
            Progress({
              value: this.progressValue,
              total: 100,
              type: ProgressType.Ring
            })
              .width(220)
              .height(220)
              .color(this.colorLightPurple)
              .style({ strokeWidth: 15 })
              .backgroundColor(Color.Transparent)

            // Logo Inside
            Image($r('app.media.logo_thin'))
              .width(100)
              .height(100)
              .fillColor(this.colorViolet)
              .objectFit(ImageFit.Contain)
              .margin({ bottom: 20 })
          }

          // Progress Text
          Text(`Progress ${this.progressValue}%`)
            .fontSize(20)
            .fontColor('#606060')
            .margin({ top: 10 })
        }
        .width('100%')
        .height('45%')
        .justifyContent(FlexAlign.Center)

        // --- BOTTOM HALF: BUTTONS ---
        Column() {
          // GRID ROW 1
          Row() {
            this.GridButton($r('app.media.ic_cup0'), () => {
              this.navigateTo('pages/activity_add_drink');
            })
            this.GridButton($r('app.media.ic_underwear0'), () => {
              this.navigateTo('pages/activity_measure');
            })
          }
          .width('100%')
          .layoutWeight(1)

          // GRID ROW 2
          Row() {
            this.GridButton($r('app.media.ic_calendar'), () => {
              this.navigateTo('pages/activity_calendar');
            })
            this.GridButton($r('app.media.ic_play'), () => {
              this.navigateTo('pages/activity_exercises');
            })
          }
          .width('100%')
          .layoutWeight(1)
        }
        .width('80%')
        .height('35%')

        // FAB AREA
        Column() {
          this.ExpandableFab()
        }
        .width('100%')
        .height('20%')
        .justifyContent(FlexAlign.Center)
      }
      .width('100%')
      .layoutWeight(1)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }

  // --- BUILDERS ---

  @Builder
  GridButton(icon: Resource, action: () => void) {
    Column() {
      Button({ type: ButtonType.Normal }) {
        Image(icon)
          .width(40)
          .height(40)
          .fillColor(this.colorViolet)
      }
      .width('100%')
      .height('100%')
      .backgroundColor(Color.Transparent)
      .onClick(action)
    }
    .layoutWeight(1)
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }

  @Builder
  ExpandableFab() {
    Button({ type: ButtonType.Normal }) {
      Row() {
        Image($r('app.media.ic_carin_sensor_only_border_thick2'))
          .width(24)
          .height(24)
          .fillColor(Color.White)
          .margin({ right: 12 })

        Text(this.isMeasuring ? "MONITORING..." : "Start measuring")
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .textCase(TextCase.UpperCase)
      }
    }
    .backgroundColor(this.colorPersianGreen)
    .height(48)
    .borderRadius(24)
    .padding({ left: 24, right: 24 })
    .onClick(() => {
      this.handleStartMeasure();
    })
  }

  // --- LOGIC ---
  async handleStartMeasure() {
    // 1. If measuring, go to screen
    if (this.isMeasuring) {
      this.navigateTo('pages/activity_measure');
      return;
    }

    // 2. If not connected, prompt pair
    if (!this.isConnected) {
      promptAction.showToast({ message: "Please connect sensor first" });
      this.navigateTo('pages/activity_pair_new_sensor');
      return;
    }

    // 3. Start Logic
    promptAction.showDialog({
      title: 'Start Measuring',
      message: 'Ensure sensor is worn correctly.',
      buttons: [
        { text: 'Cancel', color: '#000000' },
        { text: 'Start', color: this.colorPersianGreen }
      ]
    }).then((resp: DialogResponse) => {
      if (resp.index === 1) {
        CycleManager.getInstance().startNewCycle().then(() => {
          this.isMeasuring = true;
          this.navigateTo('pages/activity_measure');
        });
      }
    });
  }
}
