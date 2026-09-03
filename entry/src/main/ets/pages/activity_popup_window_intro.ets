@Component
export struct ActivityPopupWindowIntro {
  @State title: string = "Title";
  @State message: string = "Text";

  onOk: () => void = () => {};

  build() {
    Stack({ alignContent: Alignment.Center }) {

      Column() {
        // Title
        Text(this.title)
          .width('100%')
          .height(45)
          .textAlign(TextAlign.Center)
          .fontSize(20)
          .fontColor('#9F86C0')
          .backgroundColor(Color.White)

        // Message Text
        Text(this.message)
          .width('100%')
          .padding(8)
          .textAlign(TextAlign.Center)
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.Black)
          .layoutWeight(1)

        // OK Button (Full Width)
        Button("OK")
          .type(ButtonType.Normal)
          .backgroundColor('#851635')
          .fontColor(Color.White)
          .fontSize(14)
          .height(40)
          .width('100%')
          .margin({ left: 8, right: 8, bottom: 20 })
          .onClick(() => { this.onOk(); })
      }
      .width(300)
      .constraintSize({ minHeight: 220 })
      .backgroundColor(Color.White)
      .borderRadius(30)
      .padding(20)
      .shadow({ radius: 10, color: 'rgba(0,0,0,0.2)' })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.Transparent)
  }
}