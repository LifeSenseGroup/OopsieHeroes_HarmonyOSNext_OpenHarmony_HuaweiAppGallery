@Component
export struct ActivityPopupWindow {
  @State title: string = "Title";
  @State message: string = "Text";

  // Callbacks
  onCancel: () => void = () => {};
  onOk: () => void = () => {};

  build() {
    // Root container (Transparent background)
    Stack({ alignContent: Alignment.Center }) {

      // Card Container
      //
      Column() {
        // Title
        Text(this.title)
          .width('100%')
          .height(45)
          .textAlign(TextAlign.Center)
          .fontSize(20)
          .fontColor('#9F86C0') // lifesense_light_purple
          .backgroundColor(Color.White)

        // Message Text
        Text(this.message)
          .width('100%')
          .padding({ top: 8, bottom: 8, left: 8, right: 8 })
          .textAlign(TextAlign.Center)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Black)
          .layoutWeight(1) // Push buttons down

        // Buttons Row
        Row() {
          // Cancel/Abort Button
          Button($r('app.string.abort')) // Add string
            .type(ButtonType.Normal)
            .backgroundColor('#851635') // Custom dark red
            .fontColor(Color.White)
            .fontSize(14)
            .height(40)
            .onClick(() => { this.onCancel(); })
            .margin({ right: 10 }) // Spacing between buttons

          // OK Button
          Button($r('app.string.ok')) // Add string
            .type(ButtonType.Normal)
            .backgroundColor('#851635') // Custom dark red
            .fontColor(Color.White)
            .fontSize(14)
            .height(40)
            .onClick(() => { this.onOk(); })
        }
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .padding({ bottom: 20 }) // Bottom padding for buttons inside card
      }
      .width(300) // Matches android:layout_width="300dp"
      .constraintSize({ minHeight: 220 })
      .backgroundColor(Color.White)
      .borderRadius(30) // Matches app:cardCornerRadius="30dp"
      .padding(20) // Inner card margin simulation
      .shadow({ radius: 10, color: 'rgba(0,0,0,0.2)' }) // Elevation effect
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.Transparent) // Root background
  }
}