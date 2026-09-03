@Component
export struct CellWeekHeader {
  @State text: string = "Week";

  build() {
    Text(this.text)
      .width('100%')
      .textAlign(TextAlign.Center)
      .padding({ top: 32, bottom: 4 })
      .fontSize(18)
      .fontWeight(FontWeight.Medium)
      .textCase(TextCase.UpperCase)
  }
}