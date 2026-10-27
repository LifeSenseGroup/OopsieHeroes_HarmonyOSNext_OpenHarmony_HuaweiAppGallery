import { webview } from '@kit.ArkWeb';
import { hilog } from '@kit.PerformanceAnalysisKit';

const DOMAIN = 0x0000;

@Entry
@Component
struct ActivityOopsieWeb {
  private controller: webview.WebviewController = new webview.WebviewController();

  build() {
    Column() {
      Web({
        src: $rawfile('oopsie/index.html'),
        controller: this.controller
      })
        .javaScriptAccess(true)
        .domStorageAccess(true)
        .fileAccess(true)
        .imageAccess(true)
        .onPageBegin(() => {
          hilog.info(DOMAIN, 'testTag', '%{public}s', 'Oopsie WebView page load started');
        })
        .onPageEnd(() => {
          hilog.info(DOMAIN, 'testTag', '%{public}s', 'Oopsie WebView page load finished');
        })
        .onErrorReceive((event: OnErrorReceiveEvent) => {
          const errorInfo = event.error.getErrorInfo();
          hilog.error(DOMAIN, 'testTag', 'Oopsie WebView load error: %{public}s', errorInfo);
        })
        .onConsole((event: OnConsoleEvent) => {
          const message = event.message.getMessage();
          hilog.info(DOMAIN, 'testTag', 'Oopsie web console: %{public}s', message);
          return false;
        })
        .width('100%')
        .height('100%')
        .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
    }
    .width('100%')
    .height('100%')
  }
}
