@Component
export struct CellLibrary {
  @State libraryName: string = "Library name";
  @State copyrightText: string = "Copyright";
  @State licenseText: string = "License";

  onLinkClick: () => void = () => {};

  build() {
    Column({ space: 4 }) {

      // Link Section (Name + Launch Icon)
      Row() {
        Text(this.libraryName)
          .fontSize(14)
          .fontWeight(FontWeight.Bold)

        Image($r('app.media.ic_launch_black_24dp'))
          .width(16)
          .height(16)
          .fillColor('#444444')
          .margin({ left: 8 })
      }
      .onClick(() => {
        this.onLinkClick();
      })

      Text(this.copyrightText)
        .fontSize(14)

      Text(this.licenseText)
        .fontSize(14)
    }
    .width('100%')
    .alignItems(HorizontalAlign.Start)
    .padding({ top: 12, bottom: 12 })
  }
}