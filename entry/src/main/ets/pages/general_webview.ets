import { webview } from '@kit.ArkWeb';

@Component
export struct GeneralWebview {
  controller: webview.WebviewController = new webview.WebviewController();

  @State url: string | Resource = 'https://www.google.com';

  build() {
    Column() {
      Web({ src: this.url, controller: this.controller })
        .width('100%')
        .height('100%')
        .domStorageAccess(true)
        .javaScriptAccess(true)
    }
    .width('100%')
    .height('100%')
  }
}