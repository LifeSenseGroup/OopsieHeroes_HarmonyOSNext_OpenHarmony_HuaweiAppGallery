@Component
export struct BluetoothPermissionPopup {
  @Link isVisible: boolean;
  onAllow?: () => void;
  onDeny?: () => void;

  build() {
    if (this.isVisible) {
      // Full screen overlay
      Column() {
        // Popup content centered
        Column({ space: 24 }) {
          // App name
          Text('Oopsie Heroes')
            .fontSize(20)
            .fontFamily($r('app.media.futura_std_heavy'))
            .fontColor(Color.Black)

          // Permission message
          Text('needs Bluetooth permission to scan for your Carin sensor')
            .fontSize(16)
            .fontFamily($r('app.media.futura_std_medium'))
            .fontColor(Color.Black)

          // Buttons row
          Row({ space: 16 }) {
            Button('Deny')
              .onClick(() => {
                this.isVisible = false; // This will update parent state
                this.onDeny?.();
              })
              .layoutWeight(1)
              .height(44)
              .backgroundColor(Color.White)
              .fontColor(Color.Black)
              .fontSize(16)
              .fontFamily($r('app.media.futura_std_medium'))
              .border({
                width: 1,
                color: '#E5E5E5'
              })

            Button('Allow')
              .onClick(() => {
                this.isVisible = false; // This will update parent state
                this.onAllow?.();
              })
              .layoutWeight(1)
              .height(44)
              .backgroundColor($r('app.color.lifesense_dark_purple'))
              .fontColor(Color.White)
              .fontSize(16)
              .fontFamily($r('app.media.futura_std_heavy'))
          }
          .width('100%')
        }
        .width('80%')
        .padding(32)
        .backgroundColor(Color.White)
        .borderRadius(12)
        .shadow({ radius: 24, color: '#000000', offsetX: 0, offsetY: 8 })
      }
      .width('100%')
      .height('100%')
      .justifyContent(FlexAlign.Center)
      .alignItems(HorizontalAlign.Center)
      .backgroundColor('#80000000') // Semi-transparent black overlay
    }
  }
}
