@Component
export struct CellTutorialVideo {
  @State numberText: string = "1.";
  @State titleText: string = "Video Title";

  onPlayClicked: () => void = () => {};

  build() {
    Row() {
      Image($r('app.media.ic_round_play_arrow_24px'))
        .width(36)
        .height(36)
        .fillColor('#EE82EE') // @color/violet
        .margin({ left: 12, top: 16, bottom: 16 })

      Text(this.numberText)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .margin(12)

      Text(this.titleText)
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .layoutWeight(1)
        .margin(12)
    }
    .width('100%')
    .onClick(() => {
      this.onPlayClicked();
    })
  }
}