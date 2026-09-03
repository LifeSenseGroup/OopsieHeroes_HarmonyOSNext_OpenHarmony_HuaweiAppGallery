@Entry
@Component
struct ActivityTermsAndConditions {
  private controller: TabsController = new TabsController();

  build() {
    Column() {
      // --- AppBar ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24)
            .fillColor('#9F86C0')
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => { /* Close logic */ })

        // Center: Title
        Text($r('app.string.terms_and_conditions'))
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .maxLines(1)
          .textOverflow({ overflow: TextOverflow.Ellipsis })

        Blank()
          .width(48)
          .height(48)
      }
      .width('100%')
      .height(56)
      .alignItems(VerticalAlign.Center)
      .border({ width: { bottom: 1 }, color: '#9F86C0' })

      // --- Tabs Content ---
      Tabs({ barPosition: BarPosition.Start, controller: this.controller }) {
        // Placeholder Tab 1
        TabContent() {
          Column() {
            Text("Terms content would go here.")
              .fontSize(16)
              .margin(20)
          }
          .width('100%').height('100%')
        }.tabBar("Terms")

        // Placeholder Tab 2
        TabContent() {
          Column() {
            Text("Conditions content would go here.")
              .fontSize(16)
              .margin(20)
          }
          .width('100%').height('100%')
        }.tabBar("Conditions")
      }
      .vertical(false)
      .scrollable(false)
      .barMode(BarMode.Fixed)
      .width('100%')
      .layoutWeight(1)
      .backgroundColor(Color.White)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}