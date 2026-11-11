import { PredictionSession } from '../prediction/PredictionSession';

@Component
export struct PredictionBox {
  @StorageLink('predictionBoxVisible') visible: boolean = false;
  @StorageLink('predictionBoxText') text: string = '';
  @StorageLink('predictionActivated') activated: boolean = false;
  @StorageLink('predictionOfferAvailable') available: boolean = false;

  build() {
    Column() {
      if (this.visible) {
        Column() {
          Row() {
            Text('Tonight')
              .fontSize(11)
              .fontColor('#D6E6FF')
            Blank().layoutWeight(1)
            Text('×')
              .fontSize(18)
              .fontColor('#FFFFFF')
              .onClick(() => {
                void PredictionSession.dismiss();
              })
          }
          .width('100%')

          Text(this.text)
            .fontSize(16)
            .fontWeight(FontWeight.Bold)
            .fontColor('#FFF5CC')
            .margin({ top: 8 })

          Button(this.activated ? 'Deactivate' : 'Activate')
            .width('100%')
            .margin({ top: 12 })
            .backgroundColor(this.activated ? '#2E7D4F' : '#1B4F8A')
            .onClick(() => {
              void PredictionSession.toggleActivate();
            })
        }
        .width('100%')
        .padding(14)
        .borderRadius(16)
        .backgroundColor('#1A2A3A')
        .margin({ left: 16, right: 16, top: 8, bottom: 8 })
      } else if (this.available) {
        Button('Prediction')
          .fontSize(12)
          .backgroundColor('#1B4F8A')
          .margin({ top: 8, bottom: 8 })
          .onClick(() => {
            void PredictionSession.reopen();
          })
      }
    }
    .width('100%')
  }
}
