import { webview } from '@kit.ArkWeb';

@Entry
@Component
struct ActivityPrivacyPolicy {
  // Web Controller required for the Web component
  controller: webview.WebviewController = new webview.WebviewController();

  // In a real app, load this from your rawfile or a URL string
  @State privacyUrl: string = 'https://carinwear.com/privacy-policy';

  build() {
    Column() {
      // --- AppBar ---
      Row() {
        // Left: Close Button
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24)
            .fillColor('#9F86C0') // lifesense_light_purple
        }
        .backgroundColor(Color.Transparent)
        .width(48).height(48)
        .onClick(() => { /* Close logic */ })

        // Center: Title
        Text($r('app.string.privacy_policy'))
          .fontSize(18)
          .fontWeight(FontWeight.Bold)
          .layoutWeight(1)
          .textAlign(TextAlign.Center)

        // Right: Spacer (Balances the Close button to ensure true centering)
        Blank()
          .width(48)
          .height(48)
      }
      .width('100%')
      .height(56) // Standard ActionBar size
      .alignItems(VerticalAlign.Center)
      .border({ width: { bottom: 1 }, color: '#9F86C0' })

      // --- Main Content (WebView) ---
      Web({ src: this.privacyUrl, controller: this.controller })
        .width('100%')
        .layoutWeight(1) // Fills remaining height
        .domStorageAccess(true) // Usually needed for modern web pages
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}