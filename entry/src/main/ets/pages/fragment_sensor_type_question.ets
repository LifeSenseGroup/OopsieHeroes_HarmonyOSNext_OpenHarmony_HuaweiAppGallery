@Component
export struct FragmentSensorTypeQuestion {
  // Track selected sensor index (-1 = none)
  @State selectedIndex: number = -1;

  // Reusable builder for a Sensor Option Row
  @Builder SensorOption(icon: Resource, text: ResourceStr, index: number) {
    Row() {
      // Image Button (Weight 1)
      Button({ type: ButtonType.Normal }) {
        Image(icon)
          .objectFit(ImageFit.Contain)
          .width('80%')
          .height('80%')
      }
      .backgroundColor(Color.Transparent)
      .layoutWeight(1)
      .height('100%')
      // Make the image button also trigger selection for better UX
      .onClick(() => {
        this.selectedIndex = index;
      })

      // Text Label (Weight 1)
      Text(text)
        .fontSize(16)
        .fontColor(Color.Black)
        .layoutWeight(1)
        .textAlign(TextAlign.Start)
        .padding({ left: 16 })
    }
    .width('100%')
    .layoutWeight(1) // Takes up 1/3 of the available vertical space
    .alignItems(VerticalAlign.Center)
    // --- CHANGE: Selection Background Logic ---
    // If this row is selected, show Grey (#E0E0E0), otherwise Transparent
    .backgroundColor(this.selectedIndex === index ? '#E0E0E0' : Color.Transparent)
    .onClick(() => {
      this.selectedIndex = index;
    })
  }

  build() {
    Column() {
      // Header Question
      Text($r('app.string.sensor_type_question'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .margin({ top: 40, bottom: 10 })
        .textAlign(TextAlign.Center)

      // Option 1: Carin Pro (Index 0)
      this.SensorOption($r('app.media.ic_app_carin_pro'), "Carin Pro", 0)

      // Option 2: Carin Mini (Index 1)
      this.SensorOption($r('app.media.ic_app_carin_mini'), "Carin Mini", 1)

      // Option 3: Carin Training (Index 2)
      this.SensorOption($r('app.media.ic_app_carin_training'), $r('app.string.sensor_type_training'), 2)
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}