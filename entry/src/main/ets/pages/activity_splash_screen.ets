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
      Column({ space: 18 }) {
        Image($r('app.media.activity'))
          .width(96)
          .height(96)
          .objectFit(ImageFit.Contain)

        Text('OOPSIE HEROES')
          .fontSize(28)
          .fontWeight(FontWeight.Bold)
          .fontColor(Color.White)
          .letterSpacing(2)
      }
    }
    .width('100%')
    .height('100%')
    .backgroundColor('#101D3A')
    .expandSafeArea([SafeAreaType.SYSTEM], [SafeAreaEdge.TOP, SafeAreaEdge.BOTTOM])
  }
}