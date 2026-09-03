@Component
export struct FragmentBirthdayQuestion {
  @State selectedDate: Date = new Date();
  @State isTooYoung: boolean = false;

  // Helper to calculate age
  checkAge(date: Date) {
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
      age--;
    }
    this.isTooYoung = age < 12;

    // Save to AppStorage so the parent Activity can read it
    AppStorage.SetOrCreate('Birthday_IsTooYoung', this.isTooYoung);
  }

  aboutToAppear() {
    this.checkAge(this.selectedDate);
  }

  build() {
    Column() {
      Image($r('app.media.ic_birthday'))
        .width('40%')
        .aspectRatio(1)
        .objectFit(ImageFit.Contain)
        .fillColor($r('app.color.lifesense_dark_purple'))
        .margin({ top: 50, bottom: 20 })

      Text($r('app.string.birthday'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .margin({ bottom: 8 })

      DatePicker({
        selected: this.selectedDate,
        end: new Date() // Max date is today
      })
        .width('100%')
        .backgroundColor(Color.White)
        .onDateChange((value: Date) => {
          this.selectedDate = value;
          this.checkAge(value);
        })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}