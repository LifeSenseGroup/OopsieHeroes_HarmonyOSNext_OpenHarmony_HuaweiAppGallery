import promptAction from '@ohos.promptAction';
import emitter from '@ohos.events.emitter';
import { CycleManager } from '../manager/CycleManager';
import { DBManager, DrinkRecord, Leak } from '../manager/DBManager';
import { SensorManager, SENSOR_EVENT_ID, SensorUpdateEvent } from '../manager/SensorManager';

@Component
export struct MeasuringDayFragment {
  @Prop cycleNumber: number;

  @State isMeasuring: boolean = false;
  @State cycleDateStr: string = "";
  @State leaks: Leak[] = [];
  @State drinks: DrinkRecord[] = [];
  @State cycleStartTime: number = 0;

  // Chart Configuration (25 Hours in Minutes)
  private readonly CHART_DURATION_MINS = 25 * 60;

  // Colors
  private readonly colorPersianGreen: string = '#00A896';
  private readonly colorRed: string = '#E53935';
  private readonly colorBlue: string = '#2196F3'; // For Activity
  private readonly colorDarkGreen: string = '#2E7D32'; // For Leaks

  aboutToAppear() {
    this.loadData();
    // Listen for live updates
    emitter.on({ eventId: SENSOR_EVENT_ID }, (eventData) => {
      this.loadData(); // Refresh on new event
    });
  }

  async loadData() {
    const db = DBManager.getInstance();

    // 1. Get Cycle Info
    const cycle = await db.getCycleByNumber(this.cycleNumber);
    if (cycle) {
      this.cycleStartTime = cycle.startDate.getTime();
      this.cycleDateStr = cycle.startDate.toDateString();

      // Check if active
      const activeState = await CycleManager.getInstance().isMeasuring();
      const lastCycle = await db.getLastCycle();
      this.isMeasuring = (activeState && lastCycle?.number === this.cycleNumber);
    }

    // 2. Get Events
    this.leaks = await db.getLeaksForCycle(this.cycleNumber);
    this.drinks = await db.getDrinksForCycle(this.cycleNumber);
  }

  // --- CHART HELPERS ---

  // Calculate horizontal position (0% to 100%) based on time
  private getPositionPercentage(eventTime: number): string {
    if (this.cycleStartTime === 0) return '0%';

    // Calculate difference in minutes
    const diffMs = eventTime - this.cycleStartTime;
    const diffMins = diffMs / (1000 * 60);

    // Normalize to 25 hour window
    let percent = (diffMins / this.CHART_DURATION_MINS) * 100;
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    return percent + '%';
  }

  getDrinkColor(type: string): string {
    // Matching Android DrinkType colors
    switch(type) {
      case 'Water': return '#2196F3';
      case 'Coffee': return '#795548';
      case 'Tea': return '#FF9800';
      case 'Alcohol': return '#E91E63';
      case 'Carbonated': return '#9C27B0';
      default: return '#607D8B';
    }
  }

  build() {
    Scroll() {
      Column() {
        // --- HEADER INFO ---
        Row() {
          Text(this.cycleDateStr)
            .fontSize(16).fontWeight(FontWeight.Bold)
          Blank()
          Column() {
            Text(this.leaks.length.toString())
              .fontSize(24).fontWeight(FontWeight.Bold).fontColor(this.colorPersianGreen)
            Text("Leaks").fontSize(12).fontColor(Color.Gray)
          }
        }
        .width('100%').padding(16).backgroundColor('#F5F5F5')

        // --- CHARTS SECTION (Custom Timeline) ---
        Column({ space: 10 }) {
          Text("Timeline (24h)").fontSize(12).fontColor(Color.Gray).width('100%')

          Stack({ alignContent: Alignment.Start }) {
            // 1. Background Grid/Axis
            Row().width('100%').height(150).backgroundColor('#FAFAFA').border({ width: 1, color: '#EEEEEE' })

            // 2. ACTIVITY CHART (Bottom Bars)
            ForEach(this.leaks, (leak: Leak) => {
              // Activity Bar height depends on 'activity' value (0-100)
              Column()
                .width(4)
                .height((leak.activity || 10) / 2) // Scale down
                .backgroundColor(this.colorBlue)
                .position({ x: this.getPositionPercentage(leak.startDate.getTime()), y: 100 }) // Approx position
            })

            // 3. DRINKS CHART (Middle Bars)
            ForEach(this.drinks, (drink: DrinkRecord) => {
              Column()
                .width(6)
                .height(drink.amount ? Math.min(drink.amount / 5, 60) : 20) // Scale quantity to height
                .backgroundColor(this.getDrinkColor(drink.type))
                .position({ x: this.getPositionPercentage(drink.date.getTime()), y: 40 })
            })

            // 4. LEAKS CHART (Top Dots - Scatter)
            ForEach(this.leaks, (leak: Leak) => {
              Circle({ width: 10, height: 10 })
                .fill(this.colorDarkGreen)
                .position({ x: this.getPositionPercentage(leak.startDate.getTime()), y: 10 })
            })
          }
          .width('100%').height(150)
          .clip(true) // Ensure items don't draw outside bounds
        }
        .padding(16)

        // --- DRINK STATS (Detailed Info) ---
        Column() {
          Text("Drinks Breakdown").fontSize(14).fontWeight(FontWeight.Bold).margin({ bottom: 10 })

          Flex({ wrap: FlexWrap.Wrap, justifyContent: FlexAlign.SpaceBetween }) {
            this.DrinkStatItem("Water", 'Water')
            this.DrinkStatItem("Coffee", 'Coffee')
            this.DrinkStatItem("Tea", 'Tea')
            this.DrinkStatItem("Soda", 'Carbonated')
            this.DrinkStatItem("Alcohol", 'Alcohol')
            this.DrinkStatItem("Other", 'NonCarbonated')
          }
        }
        .padding(16)

        // --- STOP BUTTON ---
        if (this.isMeasuring) {
          Button("STOP MEASURING")
            .backgroundColor(this.colorRed)
            .width('90%')
            .height(50)
            .margin({ top: 20, bottom: 30 })
            .onClick(() => {
              // Stop Logic
              promptAction.showDialog({
                title: 'Stop Measuring',
                message: 'End this cycle?',
                buttons: [{text:'Cancel', color:'#000'}, {text:'Stop', color: this.colorRed}]
              }).then((resp) => {
                if (resp.index === 1) {
                  CycleManager.getInstance().stopCycle();
                  promptAction.showToast({ message: "Cycle Stopped" });
                }
              })
            })
        }
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  DrinkStatItem(label: string, typeKey: string) {
    Column() {
      Text(label).fontSize(12).fontColor(Color.Gray)
      // Count drinks of this type
      Text(this.drinks.filter(d => d.type === typeKey).length.toString())
        .fontSize(16).fontWeight(FontWeight.Bold)
      // Sum Quantity
      Text(this.drinks.filter(d => d.type === typeKey).reduce((sum, current) => sum + (current.amount || 0), 0) + " ml")
        .fontSize(10).fontColor(Color.Gray)
    }
    .width('30%')
    .height(70)
    .backgroundColor('#F5F5F5')
    .borderRadius(8)
    .justifyContent(FlexAlign.Center)
    .margin({ bottom: 8 })
  }
}
