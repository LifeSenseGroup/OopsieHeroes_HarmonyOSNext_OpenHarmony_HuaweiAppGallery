@Component
export struct CustomSpinner {
  @State text: string = "Spinner Item";

  build() {
    Text(this.text)
      .width('100%')
      .textAlign(TextAlign.Start)
      .fontSize(16)
      .fontWeight(FontWeight.Medium)
      .padding(10)
      .fontColor(Color.Black)
  }
}