@Entry
@Component
struct ActivitySensorConnectionGuidePopup {
  // Placeholder text
  @State guideText: string = "GUIDE text";

  build() {
    Column() {
      // Guide Text
      Text(this.guideText)
        .fontSize(17)
        .fontWeight(FontWeight.Regular)
        .fontColor(Color.Black)
        .lineHeight(26)
        .margin({ top: 24, left: 24, right: 24 })
        .textAlign(TextAlign.Start)

      // Close Button
      Button($r('app.string.close'))
        .type(ButtonType.Normal)
        .backgroundColor(Color.Transparent)
        .fontColor('#00A693')
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .margin(24)
        .onClick(() => {
        })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
  }
}