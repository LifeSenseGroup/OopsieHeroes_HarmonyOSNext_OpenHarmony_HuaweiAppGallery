@Component
export struct AddDrinksKeyboard {
  onNumberTapped: (value: string) => void = () => {};
  onDeleteTapped: () => void = () => {};
  onDoneTapped: () => void = () => {};

  @Builder NumberKey(text: string) {
    Button({ type: ButtonType.Normal, stateEffect: true }) {
      Text(text)
        .fontSize(20)
        .fontColor(Color.Black)
    }
    .backgroundColor(Color.White)
    .layoutWeight(1)
    .height('100%')
    .onClick(() => {
      this.onNumberTapped(text);
    })
    .border({
      width: { right: 0.5, bottom: 0.5 },
      color: '#C5C5C5'
    })
  }

  @Builder DeleteKey() {
    Button({ type: ButtonType.Normal, stateEffect: true }) {
      Image($r('app.media.ic_keyboard_delete')) // Needs SVG
        .width(24).height(24)
        .fillColor(Color.Black)
    }
    .backgroundColor('#E0E0E0')
    .layoutWeight(1)
    .height('100%')
    .onClick(() => {
      this.onDeleteTapped();
    })
    .border({ width: { right: 0.5, bottom: 0.5 }, color: '#C5C5C5' })
  }

  @Builder DoneKey() {
    Button({ type: ButtonType.Normal, stateEffect: true }) {
      Text($r('app.string.done'))
        .fontSize(18)
        .fontColor(Color.Black)
    }
    .backgroundColor('#E0E0E0')
    .layoutWeight(1)
    .height('100%')
    .onClick(() => {
      this.onDoneTapped();
    })
    .border({ width: { bottom: 0.5 }, color: '#C5C5C5' })
  }

  build() {
    Column() {
      // Row 1
      Row() {
        this.NumberKey('1')
        this.NumberKey('2')
        this.NumberKey('3')
      }
      .width('100%')
      .height('25%')

      // Row 2
      Row() {
        this.NumberKey('4')
        this.NumberKey('5')
        this.NumberKey('6')
      }
      .width('100%')
      .height('25%')

      // Row 3
      Row() {
        this.NumberKey('7')
        this.NumberKey('8')
        this.NumberKey('9')
      }
      .width('100%')
      .height('25%')

      // Row 4 (Delete, 0, Done)
      Row() {
        this.DeleteKey()
        this.NumberKey('0')
        this.DoneKey()
      }
      .width('100%')
      .height('25%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}