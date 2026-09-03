@Component
export struct CellHistoryButton {
  @State buttonText: string | Resource = "History";

  onHistoryClicked: () => void = () => {};

  build() {
    Row() {
      Button(this.buttonText.toString())
        .type(ButtonType.Normal)
        .borderRadius(28)
        .fontSize(16)
        .fontColor(Color.White)
        .fontWeight(FontWeight.Medium)
        .backgroundColor('#9F86C0')
        .opacity(0.7)
        .padding({ top: 10, bottom: 10, left: 16, right: 16 })
        .constraintSize({ minWidth: 60 })
        .onClick(() => {
          this.onHistoryClicked();
        })
    }
    .width('100%')
    .justifyContent(FlexAlign.Center)
    .padding(28)
  }
}