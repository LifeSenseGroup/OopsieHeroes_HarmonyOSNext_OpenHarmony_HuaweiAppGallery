import { webview } from '@kit.ArkWeb';

@Entry
@Component
struct ActivityOopsieWeb {
  private controller: webview.WebviewController = new webview.WebviewController();

  build() {
    Web({
      src: $rawfile('oopsie/index.html'),
      controller: this.controller
    })
      .javaScriptAccess(true)
      .domStorageAccess(true)
      .fileAccess(true)
      .allowFileAccessFromFileURLs(true)
      .allowUniversalAccessFromFileURLs(true)
      .width('100%')
      .height('100%')
      .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
  }
}
