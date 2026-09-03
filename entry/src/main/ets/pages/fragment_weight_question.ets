@Component
export struct FragmentWeightQuestion {
  // CHANGE: Use @StorageLink to share this data with the parent page
  @StorageLink('User_Weight') weightInput: string = "";
  @State selectedUnitIndex: number = 0;

  // Placeholder options
  private unitOptions: SelectOption[] = [
    { value: 'kg' },
    { value: 'lbs' }
  ];

  build() {
    Column() {
      Image($r('app.media.ic_scale'))
        .width('40%')
        .aspectRatio(1)
        .fillColor($r('app.color.lifesense_dark_purple'))
        .margin({ top: 50, bottom: 20 })

      Text($r('app.string.weight'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .margin({ bottom: 20 })

      Row() {
        TextInput({ text: this.weightInput, placeholder: "0" })
          .type(InputType.Number)
          .maxLength(3)
          .textAlign(TextAlign.Center)
          .width(100)
          .margin({ right: 24 })
          .onChange((value) => {
            this.weightInput = value; // This now updates AppStorage directly
          })

        Select(this.unitOptions)
          .selected(this.selectedUnitIndex)
          .value(this.unitOptions[this.selectedUnitIndex].value as string)
          .font({ size: 16 })
          .onSelect((index: number) => {
            this.selectedUnitIndex = index;
          })
          .width(80)
      }
      .justifyContent(FlexAlign.Center)
      .width('100%')
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    .backgroundColor(Color.White)
  }
}