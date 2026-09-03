import { CellLibrary } from './cell_library';
import router from '@ohos.router';
import bundleManager from '@ohos.bundle.bundleManager';
import common from '@ohos.app.ability.common';
import promptAction from '@ohos.promptAction';

// Define Library Interface (Matches Android Library Model)
interface Library {
  name: string;
  link: string;
  license: string;
}

@Entry
@Component
struct ActivityAbout {
  // --- STATE ---
  @State appVersion: string = "Loading...";

  // Libraries (Hardcoded list to replace JSON parsing for simplicity)
  @State libraries: Library[] = [
    { name: "MPAndroidChart", link: "https://github.com/PhilJay/MPAndroidChart", license: "Apache 2.0" },
    { name: "MaterialCalendarView", link: "https://github.com/prolificinteractive/material-calendarview", license: "MIT" },
    { name: "Realm", link: "https://realm.io", license: "Apache 2.0" }
  ];

  // Colors
  private readonly colorPurple: string = '#9F86C0';
  private readonly colorTeal: string = '#17C3B2';
  private readonly colorTextPrimary: string = '#000000';
  private readonly colorTextSecondary: string = '#666666';

  aboutToAppear() {
    this.fetchAppVersion();
  }

  // 1. Fetch App Version
  async fetchAppVersion() {
    try {
      let bundleFlags = bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION;
      let bundleInfo = await bundleManager.getBundleInfoForSelf(bundleFlags);
      this.appVersion = `Version ${bundleInfo.versionName}`;
    } catch (error) {
      this.appVersion = "Version Unknown";
    }
  }

  openUrl(url: string) {
    let context = getContext(this) as common.UIAbilityContext;
    context.startAbility({
      action: 'ohos.want.action.viewData',
      entities: ['entity.system.browsable'],
      uri: url
    }).catch((err: Error) => {
      promptAction.showToast({ message: "Could not open browser." });
    });
  }

  build() {
    Column() {
      // --- AppBar ---
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24).fillColor(this.colorTextSecondary)
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => router.back())

        Text($r('app.string.about'))
          .textCase(TextCase.UpperCase)
          .fontSize(18).fontWeight(FontWeight.Bold).layoutWeight(1).textAlign(TextAlign.Center).margin({ right: 48 })
      }
      .width('100%').height(56).border({ width: { bottom: 1 }, color: '#E0E0E0' })

      Scroll() {
        Column() {
          // --- App Info ---
          Row() {
            Image($r('app.media.logo_thin')).width(70).height(70)
            Column() {
              Text($r('app.string.app_full_name')).fontSize(16).fontWeight(FontWeight.Bold).margin({ bottom: 4 })
              Text(this.appVersion).fontSize(14).fontColor(this.colorTextSecondary)
            }
            .alignItems(HorizontalAlign.Start).justifyContent(FlexAlign.Center).margin({ left: 16 }).height(70)
          }
          .width('100%').margin({ top: 24 })

          // --- Libraries ---
          Text($r('app.string.app_uses_libraries')).fontSize(14).fontColor(this.colorTextSecondary).margin({ bottom: 12 })

          ForEach(this.libraries, (lib: Library) => {
            // Inline Cell for simplicity or keep CellLibrary
            Column() {
              Text(lib.name).fontWeight(FontWeight.Bold)
              Text(lib.license).fontSize(12).fontColor('gray')
            }.width('100%').alignItems(HorizontalAlign.Start).margin({bottom: 8})
          })

        }
        .padding(16)
      }
    }
    .width('100%').height('100%').backgroundColor(Color.White)
  }
}
