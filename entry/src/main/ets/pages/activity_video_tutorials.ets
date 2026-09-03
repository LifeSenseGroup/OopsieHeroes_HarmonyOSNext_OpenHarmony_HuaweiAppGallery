import router from '@ohos.router';
import { TutorialManager, VideoTutorial } from '../manager/TutorialManager';

// --- CELL COMPONENT (Inline for simplicity, or keep external) ---
@Component
struct CellTutorialVideo {
  @Prop numberText: string;
  @Prop titleText: string;

  build() {
    Row() {
      Text(this.numberText)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor('#9F86C0') // Purple
        .margin({ right: 16 })

      Text(this.titleText)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .layoutWeight(1)

      Image($r('app.media.ic_arrow_right')) // Assuming you have this arrow
        .width(24).height(24)
        .fillColor('gray')
    }
    .width('100%')
    .padding(16)
    .backgroundColor(Color.White)
  }
}

@Entry
@Component
struct ActivityVideoTutorials {
  @State tutorials: VideoTutorial[] = [];

  aboutToAppear() {
    this.tutorials = TutorialManager.getInstance().getTutorials();
  }

  onTutorialClick(item: VideoTutorial) {
    // Navigate to Video Player
    router.pushUrl({
      url: 'pages/activity_video_player',
      params: {
        uri: item.url,
        title: item.title,
        code: item.id.toString(),
        exercise: false // Tutorials are not exercises, so we don't save progress
      }
    });
  }

  build() {
    Column() {
      // --- AppBar ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px')) // Using your existing resource
            .width(24).height(24)
            .fillColor('#9F86C0')
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => {
          router.back();
        })

        Text($r('app.string.tutorial'))
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .margin({ right: 48 })
      }
      .width('100%')
      .height(56)
      .alignItems(VerticalAlign.Center)
      .border({ width: { bottom: 1 }, color: '#9F86C0' })

      // --- Main Content (List) ---
      List() {
        ForEach(this.tutorials, (item: VideoTutorial, index: number) => {
          ListItem() {
            CellTutorialVideo({
              numberText: (index + 1) + ".",
              titleText: item.title
            })
          }
          .onClick(() => this.onTutorialClick(item))
        })
      }
      .width('100%')
      .layoutWeight(1)
      .divider({ strokeWidth: 1, color: '#F0F0F0', startMargin: 16, endMargin: 16 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
