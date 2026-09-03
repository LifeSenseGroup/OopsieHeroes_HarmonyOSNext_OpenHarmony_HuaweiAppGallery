import router from '@ohos.router';
import { DBManager, Cycle } from '../manager/DBManager';
import { CycleManager } from '../manager/CycleManager';
import { MeasuringDayFragment } from './fragment_measuring_day';

@Entry
@Component
struct ActivityMeasure {
  @State cycles: Cycle[] = [];
  @State currentIndex: number = 0;
  @State isLoading: boolean = true;
  private controller: TabsController = new TabsController();

  private readonly colorPersianGreen: string = '#00A896';

  aboutToAppear() {
    this.loadData();
  }

  async loadData() {
    const db = DBManager.getInstance();
    await CycleManager.getInstance().finishCyclesIfNeeded();

    const cycles = await db.getAllCycles();
    this.cycles = cycles.sort((left, right) => left.number - right.number);
    if (this.cycles.length > 0) {
      this.currentIndex = this.cycles.length - 1; // Select last one
      this.isLoading = false;
    } else {
      this.isLoading = false;
    }
  }

  build() {
    Column() {
      // --- HEADER ---
      Row() {
        Image($r('app.media.ic_round_close_24px')) // Using the resource we know exists
          .width(24).height(24)
          .fillColor('#D1C4E9')
          .onClick(() => router.back())

        Text('Measurement History')
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        Blank().width(24)
      }
      .height(56)
      .width('100%')
      .padding({ left: 16, right: 16 })
      .backgroundColor(Color.White)

      // --- CONTENT ---
      if (this.isLoading) {
        LoadingProgress().color(this.colorPersianGreen)
      }
      else if (this.cycles.length === 0) {
        this.NoDataView()
      }
      else {
        Tabs({ barPosition: BarPosition.Start, index: this.currentIndex, controller: this.controller }) {
          ForEach(this.cycles, (cycle: Cycle) => {
            TabContent() {
              MeasuringDayFragment({ cycleNumber: cycle.number })
            }
            .tabBar("Day " + cycle.number)
          })
        }
        .barMode(BarMode.Scrollable)
        .barWidth('100%')
        .barHeight(56)
        .animationDuration(300)
        .onChange((index: number) => {
          this.currentIndex = index;
        })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }

  @Builder
  NoDataView() {
    Column({ space: 20 }) {
      Image($r('app.media.ic_carin_logo_pink')) // Placeholder if no_data icon missing
        .width(100).height(100)
        .opacity(0.3)

      Text("No measurements yet.")
        .fontSize(16)
        .fontColor(Color.Gray)

      Button("Start Measuring")
        .backgroundColor(this.colorPersianGreen)
        .onClick(() => {
          // Logic to start measuring
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
  }
}
