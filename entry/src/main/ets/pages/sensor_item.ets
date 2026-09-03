@Component
export struct SensorItem {
  @State sensorName: string = "DEVICE NAME";
  @State macAddress: string = "DEVICE MAC ADDRESS";
  @State showBlinkButton: boolean = false;

  // Event callbacks
  onItemClick: () => void = () => {};
  onBlinkClick: () => void = () => {};

  build() {
    Column() {
      Row() {
        Column({ space: 10 }) {
          Text(this.sensorName)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Black)

          Text(this.macAddress)
            .fontSize(14)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.Black)
        }
        .layoutWeight(1)
        .alignItems(HorizontalAlign.Start)
        .margin({ top: 18, bottom: 18, left: 12 })

        if (this.showBlinkButton) {
          Button($r('app.string.blink'))
            .type(ButtonType.Normal)
            .backgroundColor(Color.Transparent)
            .fontColor('#00A693')
            .fontWeight(FontWeight.Bold)
            .onClick(() => {
              this.onBlinkClick();
            })
        }
      }
      .width('100%')
      .alignItems(VerticalAlign.Center)
      .onClick(() => {
        this.onItemClick();
      })

      Divider()
        .strokeWidth(1)
        .margin({ left: 12, right: 12 })
    }
    .width('100%')
    .backgroundColor(Color.White)
  }
}