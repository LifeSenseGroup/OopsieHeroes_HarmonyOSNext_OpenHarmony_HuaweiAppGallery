@Component
export struct QuestionsIntroPopup {
  @Link isVisible: boolean;

  build() {
    Column() {
      // Popup content
      Column({ space: 20 }) {
        // Title
        Text('To constantly improve our products and your experience, we kindly ask you to provide us with some information.')
          .fontSize(18)
          .fontFamily('Futura-Std-Medium')
          .fontColor(Color.Black)
          .textAlign(TextAlign.Center)
          .padding({ left: 24, right: 24 })

        // Got It button
        Button('GOT IT', { type: ButtonType.Normal })
          .backgroundColor($r('app.color.persianGreen'))
          .fontColor(Color.White)
          .fontSize(16)
          .fontFamily('Futura-Std-Heavy')
          .width('60%')
          .onClick(() => {
            this.isVisible = false;
          })
      }
      .width('80%')
      .padding(24)
      .backgroundColor(Color.White)
      .borderRadius(16)
      .shadow({ radius: 24, color: '#000000', offsetX: 0, offsetY: 8 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor('#CC000000') // Semi-transparent background
    .visibility(this.isVisible ? Visibility.Visible : Visibility.None)
  }
}