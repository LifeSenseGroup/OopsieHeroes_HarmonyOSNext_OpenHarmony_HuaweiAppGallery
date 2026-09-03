import { webview } from '@kit.ArkWeb';

@Component
export struct FragmentHtml {
  controller: webview.WebviewController = new webview.WebviewController();
  // Default placeholder, replace with your actual logic/prop
  @State url: string | Resource = 'https://www.google.com';

  build() {
    Column() {
      Web({ src: this.url, controller: this.controller })
        .width('100%')
        .height('100%')
        .domStorageAccess(true)
    }
    .width('100%')
    .height('100%')
  }
}