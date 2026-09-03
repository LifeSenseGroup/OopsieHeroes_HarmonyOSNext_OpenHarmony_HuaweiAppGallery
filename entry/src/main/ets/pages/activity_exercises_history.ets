import router from '@ohos.router';
import { VideoManager, VideoExercise } from '../manager/VideoManager';

// Helper Interface for Grouping
interface HistoryGroup {
  week: number;
  exercises: VideoExercise[];
}

@Entry
@Component
struct ActivityExerciseHistory {
  @State historyGroups: HistoryGroup[] = [];
  @State isLoading: boolean = true;
  @State hasHistory: boolean = false;

  // Colors
  private readonly colorPrimary: string = '#00A896';
  private readonly colorPurple: string = '#9F86C0';

  aboutToAppear() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading = true;
    const videoMgr = VideoManager.getInstance();
    const currentWeek = videoMgr.getCurrentWeek();

    // Logic: Ported from 'createEntitiesListFrom' in Android
    // We loop backwards from (currentWeek - 1) down to 1
    let groups: HistoryGroup[] = [];

    for (let w = currentWeek - 1; w >= 1; w--) {
      const exercises = videoMgr.getExercisesForWeek(w);
      if (exercises && exercises.length > 0) {
        groups.push({
          week: w,
          exercises: exercises
        });
      }
    }

    this.historyGroups = groups;
    this.hasHistory = groups.length > 0;
    this.isLoading = false;
  }

  build() {
    Column() {
      // --- APP BAR ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_keyboard_arrow_left_24px')) // Using your generic arrow or back icon
            .width(24).height(24)
            .fillColor(this.colorPurple)
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => {
          router.back();
        })

        Text($r('app.string.history')) // "History"
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .margin({ right: 48 }) // Balance back button
      }
      .width('100%')
      .height(56)
      .border({ width: { bottom: 1 }, color: this.colorPurple })

      // --- CONTENT ---
      if (this.isLoading) {
        // Loading State
        Column() {
          LoadingProgress().color(this.colorPrimary).width(50).height(50)
        }
        .width('100%').height('100%').justifyContent(FlexAlign.Center)
      }
      else if (!this.hasHistory) {
        // Empty State (e.g. User is in Week 1)
        Column() {
          Image($r('app.media.ic_no_data')) // Placeholder icon
            .width(100).height(100).opacity(0.5).margin({ bottom: 20 })
          Text("No history yet.")
            .fontSize(16).fontColor('gray')
          Text("Complete Week 1 to see past exercises.")
            .fontSize(14).fontColor('gray').margin({ top: 8 })
        }
        .width('100%').height('100%').justifyContent(FlexAlign.Center)
      }
      else {
        // History List
        List() {
          ForEach(this.historyGroups, (group: HistoryGroup) => {
            ListItemGroup({ header: this.GroupHeader(group.week) }) {
              ForEach(group.exercises, (exercise: VideoExercise) => {
                ListItem() {
                  this.ExerciseRow(exercise)
                }
              })
            }
          })
        }
        .width('100%')
        .layoutWeight(1)
        .sticky(StickyStyle.Header) // Keeps "Week X" pinned to top while scrolling
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }

  // --- BUILDERS ---

  @Builder
  GroupHeader(weekNum: number) {
    Row() {
      Text(`Week ${weekNum}`)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor('gray')
        .textCase(TextCase.UpperCase)
    }
    .width('100%')
    .padding({ left: 16, top: 16, bottom: 8 })
    .backgroundColor('#F9F9F9') // Light grey background for header
  }

  @Builder
  ExerciseRow(item: VideoExercise) {
    Row() {
      // Thumbnail (Placeholder)
      Rect()
        .width(80)
        .height(50)
        .fill('#E0E0E0')
        .radius(4)
        .margin({ right: 12 })

      Column() {
        Text(item.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .margin({ bottom: 4 })

        Text(item.description)
          .fontSize(12)
          .fontColor('gray')
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })
      }
      .layoutWeight(1)
      .alignItems(HorizontalAlign.Start)

      // Completed Checkmark (Visual only since it's history)
      Image($r('app.media.ic_check_circle')) // Assuming a checkmark icon exists, or reuse another
        .width(20)
        .height(20)
        .fillColor(this.colorPrimary)
        .opacity(0.6)
    }
    .width('100%')
    .padding({ left: 16, right: 16, top: 12, bottom: 12 })
    .backgroundColor(Color.White)
  }
}