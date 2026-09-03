@Entry
@Component
struct ActivityLicensePopup {
  @State title: string = "License Title";
  // In the app, this would likely be a long string loaded from resources
  @State textContent: string = "License Text";

  build() {
    Scroll() {
      Column() {
        // Title
        Text(this.title)
          .fontSize(16)
          .fontWeight(FontWeight.Bold)
          .textAlign(TextAlign.Center)
          .width('100%')

        // License Text
        Text(this.textContent)
          .fontSize(14)
          .margin({ top: 20 })
          .textAlign(TextAlign.Center)
          .width('100%')
      }
      .width('100%')
      .padding(20)
      .alignItems(HorizontalAlign.Center)
    }
    .width('100%')
    .height('100%')
    .align(Alignment.TopStart)
    .backgroundColor(Color.White)
  }
}