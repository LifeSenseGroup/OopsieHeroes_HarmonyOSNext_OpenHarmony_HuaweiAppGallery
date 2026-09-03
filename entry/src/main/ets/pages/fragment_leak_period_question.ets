@Component
export struct FragmentLeakPeriodQuestion {
  // Track selection state for the 4 options:
  // Index 0: Sleeping, 1: Sneezing, 2: Exercising, 3: Still
  @State selectedItems: boolean[] = [false, false, false, false];

  @Builder LeakOption(icon: Resource, label: ResourceStr, tag: number) {
    Column() {
      Image(icon)
        .width('60%')
        .aspectRatio(1)
        .objectFit(ImageFit.Contain)
        .margin({ top: 6 })

      Text(label)
        .fontSize(14)
        .textAlign(TextAlign.Center)
        .margin({ top: 6, bottom: 6 })
    }
    .width('100%')
    .aspectRatio(1)
    .justifyContent(FlexAlign.Center)
    .alignItems(HorizontalAlign.Center)
    // --- CHANGE: Persistent Background Color ---
    // If selected, show Gray (#E0E0E0). If not, show Transparent.
    .backgroundColor(this.selectedItems[tag] ? '#E0E0E0' : Color.Transparent)
    .onClick(() => {
      // --- CHANGE: Toggle Logic ---
      // We clone the array to ensure the UI updates immediately
      let newSelections = [...this.selectedItems];
      newSelections[tag] = !newSelections[tag];
      this.selectedItems = newSelections;
    })
  }

  build() {
    Column() {
      // --- Header Section ---
      Text($r('app.string.you_have_leak_while'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .textAlign(TextAlign.Center)
        .margin({ top: 24 })

      Text($r('app.string.multiple_choices'))
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .margin({ top: 10 })

      // --- 2x2 Grid Section ---
      Grid() {
        GridItem() {
          this.LeakOption($r('app.media.ic_sleeping'), $r('app.string.sleeping'), 0)
        }
        GridItem() {
          this.LeakOption($r('app.media.ic_sneezing'), $r('app.string.sneezing'), 1)
        }
        GridItem() {
          this.LeakOption($r('app.media.ic_exercising'), $r('app.string.exercising'), 2)
        }
        GridItem() {
          this.LeakOption($r('app.media.ic_still'), $r('app.string.staying_still'), 3)
        }
      }
      .columnsTemplate('1fr 1fr')
      .rowsTemplate('1fr 1fr')
      .width('100%')
      .constraintSize({ maxWidth: 400 })
      .aspectRatio(1)
      .margin({ top: 40, left: 24, right: 24, bottom: 24 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Start)
    .backgroundColor(Color.White)
  }
}