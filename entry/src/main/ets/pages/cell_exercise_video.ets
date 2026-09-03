@Component
export struct ExerciseVideoCell {
  @State title: string = "Title";
  @State thumbnailImage: Resource = $r('app.media.app_icon');
  @State showCompletedIcon: boolean = true;

  onPlayClicked: () => void = () => {};
  onInfoClicked: () => void = () => {};

  build() {
    Row() {
      Row() {
        Stack({ alignContent: Alignment.TopStart }) {
          Image(this.thumbnailImage)
            .width('100%')
            .aspectRatio(16 / 9)
            .objectFit(ImageFit.Cover)
            .borderRadius(4)

          if (this.showCompletedIcon) {
            Image($r('app.media.ic_vink_tumb'))
              .width(36)
              .height(36)
              .fillColor('#A4C400')
              .margin({ top: 2, left: 0 })
          }
        }
        .width('38%')
        .margin({
          left: 8,
          top: 12,
          bottom: 12,
          right: 12
        })

        Text(this.title)
          .fontSize(16)
          .fontWeight(FontWeight.Medium)
          .layoutWeight(1)
          .margin(12)
          .alignSelf(ItemAlign.Center)

      }
      .layoutWeight(1)
      .height('100%')
      .onClick(() => {
        this.onPlayClicked();
      })

      Button({ type: ButtonType.Circle, stateEffect: true }) {
        Image($r('app.media.ic_info_outline_black_24dp'))
          .width(24)
          .height(24)
          .fillColor('#9F86C0')
      }
      .width(48)
      .height(48)
      .backgroundColor(Color.Transparent)
      .margin({ right: 12 })
      .onClick(() => {
        this.onInfoClicked();
      })

    }
    .width('100%')
    .backgroundColor(Color.White)
  }
}