@Entry
@Component
struct AlertSensorFirmwareUpdate {
  @State versionDetail: string = "v250 --> v270";
  @State progressValue: number = 50; // 0 to 100

  build() {
    Column() {
      // Title
      Text($r('app.string.updating_sensor'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .margin(16)

      // Version Detail
      Text(this.versionDetail)
        .fontSize(17)
        .fontWeight(FontWeight.Medium)
        .margin({ bottom: 24 })

      // Message / Instructions
      Text($r('app.string.sensor_update_instructions'))
        .fontSize(16)
        .fontWeight(FontWeight.Medium)
        .textAlign(TextAlign.Center)
        .margin({ left: 24, right: 24, bottom: 24 })

      // Progress Section (LinearLayout equivalent)
      Column() {
        Progress({ value: this.progressValue, total: 100, type: ProgressType.Linear })
          .width('100%')
          .height(10)
          .color('#00A693')
          .backgroundColor('#E0E0E0')

        Text(this.progressValue + "%")
          .fontSize(14)
          .fontWeight(FontWeight.Regular)
          .margin({ top: 16 })
      }
      .width('100%')
      .padding({ left: 24, right: 24, bottom: 24 })
      .alignItems(HorizontalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}