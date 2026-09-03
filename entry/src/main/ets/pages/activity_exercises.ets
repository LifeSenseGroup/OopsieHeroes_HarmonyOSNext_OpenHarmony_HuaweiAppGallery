import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
import { VideoManager, VideoExercise } from '../manager/VideoManager';

@Entry
@Component
struct ActivityExercises {
  @State exercises: VideoExercise[] = [];
  @State currentWeek: number = 1;

  // Colors
  private readonly colorPrimary: string = '#00A896';

  aboutToAppear() {
    this.loadData();
  }

  loadData() {
    // 1. Get Current Week (Standard for all users now)
    this.currentWeek = VideoManager.getInstance().getCurrentWeek();

    // 2. Load Exercises
    this.exercises = VideoManager.getInstance().getExercisesForWeek(this.currentWeek);
  }

  onVideoClicked(video: VideoExercise) {
    // Placeholder for Video Player logic
    // When China Cloud is ready, you will update VideoManager to return those URLs
    promptAction.showDialog({
      title: 'Play Video',
      message: `Playing ${video.title}...`,
      buttons: [{ text: 'Close', color: '#000000' }]
    });
  }

  build() {
    Column() {
      // --- APP BAR ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_close_black_24dp'))
            .width(24).height(24).fillColor(Color.Black)
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => router.back())

        Text(`WEEK ${this.currentWeek}`)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .margin({ right: 48 }) // Balance close button
      }
      .width('100%')
      .height(56)
      .border({ width: { bottom: 1 }, color: '#E0E0E0' })

      // --- MAIN CONTENT ---
      Scroll() {
        Column() {
          // Introduction / Title
          Text("Your Weekly Exercises")
            .fontSize(20)
            .fontWeight(FontWeight.Bold)
            .width('100%')
            .margin({ top: 20, bottom: 4 })

          Text("Complete these exercises to strengthen your pelvic floor.")
            .fontSize(14)
            .fontColor('gray')
            .width('100%')
            .margin({ bottom: 20 })

          // --- EXERCISE LIST ---
          List() {
            ForEach(this.exercises, (item: VideoExercise) => {
              ListItem() {
                Row() {
                  // Thumbnail (Placeholder - would use item.thumbnailUrl)
                  Rect()
                    .width(100)
                    .height(60)
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
                      .maxLines(2)
                      .textOverflow({ overflow: TextOverflow.Ellipsis })
                  }
                  .layoutWeight(1)
                  .alignItems(HorizontalAlign.Start)

                  // Play Icon / Arrow
                  Image($r('app.media.ic_arrow_right'))
                    .width(24)
                    .height(24)
                    .fillColor('gray')
                }
                .width('100%')
                .padding({ top: 12, bottom: 12 })
                .backgroundColor(Color.White)
                .onClick(() => this.onVideoClicked(item))
              }
            })
          }
          .width('100%')
          // List height handles itself inside Scroll, or use fixed ratio if needed
          .divider({ strokeWidth: 1, color: '#F0F0F0', startMargin: 112 })

          // --- HISTORY BUTTON ---
          Button("VIEW HISTORY")
            .backgroundColor(Color.White)
            .fontColor(this.colorPrimary)
            .border({ width: 1, color: this.colorPrimary })
            .width('100%')
            .height(50)
            .margin({ top: 30, bottom: 20 })
            .onClick(() => {
              router.pushUrl({ url: 'pages/activity_exercises_history' });
            })
        }
        .padding(16)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
