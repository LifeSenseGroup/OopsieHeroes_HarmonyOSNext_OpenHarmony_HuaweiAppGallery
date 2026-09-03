@Component
export struct CellVideo {
  @State title: string = "Title";
  @State duration: string = "Duration";
  @State description: string = "Description";
  @State thumbnailImage: Resource = $r('app.media.app_icon');
  @State isExpanded: boolean = false;

  onPlayClicked: () => void = () => {};

  build() {
    Column() {
      Row() {
        Stack({ alignContent: Alignment.Center }) {
          Image(this.thumbnailImage)
            .width(125)
            .height(75)
            .objectFit(ImageFit.Cover)

          Image($r('app.media.ic_play_arrow_black_24dp'))
            .width(24)
            .height(24)
            .fillColor(Color.White)
            .opacity(0.7)
        }
        .width(125)
        .height(75)
        .margin({ left: 10, top: 20, bottom: 10 })
        .onClick(() => this.onPlayClicked())

        Column({ space: 6 }) {
          Text(this.title)
            .fontSize(15)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Black)
            .maxLines(4)
            .textOverflow({ overflow: TextOverflow.Ellipsis })

          Text(this.duration)
            .fontSize(12)
            .fontWeight(FontWeight.Medium)
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)
        .margin({ left: 12, right: 12 })

        Button({ type: ButtonType.Circle, stateEffect: true }) {
          Image($r('app.media.ic_round_keyboard_arrow_down_24px'))
            .width(24)
            .height(24)
            .fillColor(Color.Gray)
            .rotate({ angle: this.isExpanded ? 180 : 0 })
        }
        .backgroundColor(Color.Transparent)
        .width(40)
        .height(40)
        .margin({ right: 10 })
        .onClick(() => {
          animateTo({ duration: 250 }, () => {
            this.isExpanded = !this.isExpanded;
          })
        })
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)

      if (this.isExpanded) {
        Text(this.description)
          .width('100%')
          .padding(8)
          .margin(10)
      }
    }
    .width('100%')
  }
}