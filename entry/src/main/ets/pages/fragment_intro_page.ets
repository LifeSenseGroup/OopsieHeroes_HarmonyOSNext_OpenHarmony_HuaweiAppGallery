@Component
export struct FragmentIntroPage {
  @State titleText: string = "Title";

  build() {
    Column() {
      Text(this.titleText)
        .fontSize(28)
        .fontWeight(FontWeight.Bold)
        .fontColor('#00A693')
        .textAlign(TextAlign.Center)
        .textCase(TextCase.UpperCase)
        .lineHeight(36)
        .margin(16)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}