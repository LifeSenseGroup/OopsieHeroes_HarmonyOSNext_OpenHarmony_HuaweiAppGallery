@Entry
@Component
struct ActivitySettings {
  // State for Notification Settings (0 = All, 1 = Measure Day, 2 = Quiet)
  @State notificationMode: number = 0;

  @State connectionStatus: string = "Not connected"; // Needs localization in real app

  @Builder SectionHeader(text: ResourceStr) {
    Row() {
      Text(text)
        .fontSize(14)
        .fontWeight(FontWeight.Bold)
        .fontColor(Color.Black)
        .textCase(TextCase.UpperCase)
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#E0E0E0')
    .justifyContent(FlexAlign.Center)
  }

  // Builder for a Clickable Row with optional Checkmark
  @Builder SettingsRow(text: ResourceStr, showCheck: boolean, onClick: () => void) {
    Row() {
      Text(text)
        .fontSize(16)
        .fontColor(Color.Black)
        .layoutWeight(1)
        .margin({ left: 20 })

      // Checkbox container
      if (showCheck) {
        Stack({ alignContent: Alignment.Center }) {
          Image($r('app.media.ic_check'))
            .width(16).height(16)
            .fillColor(Color.Black)
        }
        .width(20).height(20)
        .backgroundColor('#EFEFF4')
        .margin({ right: 20 })
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
    .onClick(onClick)
  }

  build() {
    Column() {
      // --- AppBar (Standard) ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24)
            .fillColor('#9F86C0')
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => { /* Close */ })

        Text($r('app.string.settings'))
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)
          .margin({ right: 48 })
      }
      .width('100%')
      .height(56)
      .alignItems(VerticalAlign.Center)
      .border({ width: { bottom: 1 }, color: '#9F86C0' })

      // --- Main Container ---
      Column() {

        // 1. Top Info Section
        Column() {
          Text($r('app.string.carin_sensor'))
            .fontSize(20)
            .fontWeight(FontWeight.Medium)
            .margin({ top: 16 })

          Text($r('app.string.not_connected'))
            .fontSize(20)
            .fontWeight(FontWeight.Medium)
            .fontColor(Color.Gray)
            .margin({ top: 8 })

          Blank().layoutWeight(1)

          Text("Last Time Synced")
            .fontSize(14)
            .margin({ bottom: 28 })
        }
        .width('100%')
        .height('25%')
        .alignItems(HorizontalAlign.Center)

        // 2. Settings List Section
        Column() {

          // A. Notifications Section
          Column() {
            // Header
            Stack() { this.SectionHeader($r('app.string.notifications_settings_header')) }
            .height('18%')

            // Option 1
            Stack() {
              this.SettingsRow($r('app.string.send_all_notifications'), this.notificationMode === 0, () => { this.notificationMode = 0 })
            }
            .height('27%')
            .border({ width: { top: 1 }, color: '#E0E0E0' }) // Divider

            // Option 2
            Stack() {
              this.SettingsRow($r('app.string.send_measuring_day_notifications'), this.notificationMode === 1, () => { this.notificationMode = 1 })
            }
            .height('27%')
            .border({ width: { top: 1 }, color: '#E0E0E0' })

            // Option 3
            Stack() {
              this.SettingsRow($r('app.string.keep_it_quiet'), this.notificationMode === 2, () => { this.notificationMode = 2 })
            }
            .height('28%') // Slightly larger to fill gap
            .border({ width: { top: 1 }, color: '#E0E0E0' })
          }
          .height('55%')
          .width('100%')

          // B. Data Summary Section
          Column() {
            // Header
            Stack() { this.SectionHeader($r('app.string.data_summary_header')) }
            .height('40%')

            // Row
            Stack() {
              this.SettingsRow($r('app.string.send_summary'), false, () => {})
            }
            .height('60%')
            .border({ width: { top: 1 }, color: '#E0E0E0' })
          }
          .height('22.5%')
          .width('100%')

          // C. Info Section
          Column() {
            // Header
            Stack() { this.SectionHeader($r('app.string.information')) }
            .height('40%')

            // Row
            Stack() {
              this.SettingsRow($r('app.string.about'), false, () => {})
            }
            .height('60%')
            .border({ width: { top: 1 }, color: '#E0E0E0' })
          }
          .height('22.5%')
          .width('100%')

        }
        .height('65%')
        .width('100%')

      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}