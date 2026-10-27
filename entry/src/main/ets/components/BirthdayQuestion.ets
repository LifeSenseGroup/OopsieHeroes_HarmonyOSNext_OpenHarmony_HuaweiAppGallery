@Component
export struct BirthdayQuestion {
  private selectedDate: Date = new Date(1970, 0, 1);

  build() {
    Column({ space: 20 }) {
      // 🎂 Image (ic_birthday)
      Image($r('app.media.ic_birthday'))
        .width('50%')
        .aspectRatio(1)
        .margin({ top: 50 })
        .fillColor($r('app.color.lifesense_dark_purple'))
        .objectFit(ImageFit.Contain)

      // 🟣 TextView: "Birthday"
      Text($r('app.string.birthday'))
        .fontFamily($r('app.media.futura_std_heavy'))
        .fontSize(18)
        .fontColor($r('app.color.lifesense_dark_purple'))

      // 📅 DatePicker
      DatePicker({
        start: new Date(1960, 0, 1),
        end: new Date(2030, 11, 31),
        selected: this.selectedDate,
      })

        .lunar(false)
        .margin({ bottom: 8, top: 8 })
    }
    .width('100%')
    .height('100%')
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .backgroundColor(Color.White)
  }

}
