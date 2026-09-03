import router from '@ohos.router';
// FIX: Correct Import Path for Cycle interface
import { DBManager, Cycle } from '../manager/DBManager';
import { CycleManager } from '../manager/CycleManager';

// --- VISUAL CONSTANTS ---
const COLOR_PAST = '#D1C4E9';
const COLOR_PRESENT = '#4A235A';
const COLOR_FUTURE = '#E0E0E0';
const COLOR_TEXT_DEFAULT = '#000000';
const COLOR_TEXT_SELECTED = '#FFFFFF';

interface DayState {
  date: Date;
  dayNum: number;
  isCurrentMonth: boolean;
  type: 'PAST' | 'PRESENT' | 'FUTURE' | 'NONE';
  cycleNumber?: number;
}

@Entry
@Component
struct ActivityCalendar {
  @State currentMonth: Date = new Date();
  @State calendarDays: DayState[] = [];
  @State monthTitle: string = "";

  private cycles: Cycle[] = [];

  aboutToAppear() {
    this.loadData();
  }

  async loadData() {
    const db = DBManager.getInstance();

    // FIX: Use Real Data
    this.cycles = await db.getAllCycles();

    // Fallback Mock Data (Only if DB is empty for testing)
    if (this.cycles.length === 0) {
      const mockStart = new Date();
      mockStart.setDate(mockStart.getDate() - 5);
      this.cycles = [{
        number: 1,
        startDate: mockStart, // FIX: Pass Date object, not number
        isFinished: false
      }];
    }

    this.generateCalendar();
  }

  generateCalendar() {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    this.monthTitle = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let days: DayState[] = [];

    // 1. Padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ date: new Date(0), dayNum: 0, isCurrentMonth: false, type: 'NONE' });
    }

    // 2. Actual Days
    for (let i = 1; i <= daysInMonth; i++) {
      let date = new Date(year, month, i);
      let type: 'PAST' | 'PRESENT' | 'FUTURE' | 'NONE' = 'NONE';
      let cycleNum: number | undefined = undefined;

      // --- DECORATOR LOGIC ---
      for (let cycle of this.cycles) {
        let start = new Date(cycle.startDate);
        start.setHours(0,0,0,0);

        let end = new Date(start);
        // FIX: Access Static Property
        end.setDate(start.getDate() + CycleManager.DAYS_PER_CYCLE);

        if (date >= start && date <= end) {
          cycleNum = cycle.number;
          const today = new Date();
          today.setHours(0,0,0,0);

          if (date.getTime() < today.getTime()) {
            type = 'PAST';
          } else if (date.getTime() === today.getTime()) {
            type = 'PRESENT';
          } else {
            type = 'FUTURE';
          }
          break;
        }
      }

      days.push({
        date: date,
        dayNum: i,
        isCurrentMonth: true,
        type: type,
        cycleNumber: cycleNum
      });
    }

    this.calendarDays = days;
  }

  changeMonth(delta: number) {
    const newDate = new Date(this.currentMonth);
    newDate.setMonth(newDate.getMonth() + delta);
    this.currentMonth = newDate;
    this.generateCalendar();
  }

  build() {
    Column() {
      // --- APP BAR ---
      Row() {
        Image($r('app.media.ic_round_close_24px')) // Ensure this resource exists
          .width(24).height(24)
          .fillColor('#D1C4E9')
          .onClick(() => router.back())

        Text("Calendar")
          .fontSize(18).fontWeight(FontWeight.Bold).layoutWeight(1).textAlign(TextAlign.Center)
          .margin({ right: 24 })

      }
      .height(56).width('100%').padding({ left: 16, right: 16 })
      .border({ width: { bottom: 1 }, color: '#D1C4E9' })

      // --- MONTH NAVIGATOR ---
      Row() {
        Image($r('app.media.ic_arrow_left'))
          .width(32).height(32).padding(8)
          .fillColor('#4A235A')
          .onClick(() => this.changeMonth(-1))

        Text(this.monthTitle)
          .fontSize(20).fontWeight(FontWeight.Bold)

        Image($r('app.media.ic_arrow_right'))
          .width(32).height(32).padding(8)
          .fillColor('#4A235A')
          .onClick(() => this.changeMonth(1))
      }
      .width('100%').justifyContent(FlexAlign.SpaceBetween).padding(16)

      // --- DAYS OF WEEK ---
      Flex({ justifyContent: FlexAlign.SpaceAround }) {
        ForEach(['S', 'M', 'T', 'W', 'T', 'F', 'S'], (day: string) => {
          Text(day).fontSize(14).fontColor(Color.Gray)
        })
      }
      .width('100%').padding({ bottom: 10 })

      // --- CALENDAR GRID ---
      Grid() {
        ForEach(this.calendarDays, (day: DayState) => {
          GridItem() {
            if (day.isCurrentMonth) {
              this.DayCell(day)
            } else {
              Blank()
            }
          }
        })
      }
      .columnsTemplate('1fr 1fr 1fr 1fr 1fr 1fr 1fr')
      .rowsGap(12)
      .width('100%')
      .padding(8)

    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }

  @Builder
  DayCell(day: DayState) {
    Stack() {
      // 1. Background Circle
      if (day.type !== 'NONE') {
        if (day.type === 'FUTURE') {
          Circle({ width: 36, height: 36 })
            .fill('none')
            .stroke(COLOR_FUTURE)
            .strokeWidth(2)
        } else {
          Circle({ width: 36, height: 36 })
            .fill(day.type === 'PRESENT' ? COLOR_PRESENT : COLOR_PAST)
        }
      }

      // 2. Day Number
      Text(day.dayNum.toString())
        .fontSize(14)
        .fontColor((day.type === 'PAST' || day.type === 'PRESENT') ? COLOR_TEXT_SELECTED : COLOR_TEXT_DEFAULT)
        .fontWeight(day.type === 'PRESENT' ? FontWeight.Bold : FontWeight.Normal)
    }
    .width(40).height(40)
  }
}