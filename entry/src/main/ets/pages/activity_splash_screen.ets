import router from '@ohos.router';

@Entry
@Component
struct ActivitySplashScreen {
  aboutToAppear() {
    setTimeout(() => {
      router.pushUrl({
        url: 'pages/activity_intro'
      });
    }, 3000);
  }

  build() {
    Stack({ alignContent: Alignment.Center }) {
      Image($r('app.media.carin_start_screen_70q'))
        .objectFit(ImageFit.Cover) // Ensures image covers space without distortion
        .width('100%')
        .height('100%')
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
  }
}