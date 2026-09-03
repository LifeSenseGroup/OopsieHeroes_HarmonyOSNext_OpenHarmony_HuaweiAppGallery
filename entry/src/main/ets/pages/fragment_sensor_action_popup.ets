@Component
export struct FragmentSensorActionPopup {
  // Placeholder for the action text
  @State actionName: string = "SensorAction";

  build() {
    Column() {
      // Progress Spinner
      LoadingProgress()
        .width(48)
        .height(48)
        .color('#9F86C0')
        .margin({ top: 48, left: 56, right: 56 })

      // Action Text
      Text(this.actionName)
        .fontSize(18)
        .fontWeight(FontWeight.Medium)
        .fontColor(Color.Black)
        .margin({ top: 32, left: 56, right: 56, bottom: 48 })
        .textAlign(TextAlign.Center)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}