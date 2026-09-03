@Component
export struct ExoPlaybackControlView {
  @Link isPlaying: boolean;
  @Link currentTime: number;
  @Link duration: number;

  onClose: () => void = () => {};
  onPlayPause: () => void = () => {};
  onRewind: () => void = () => {};
  onFastForward: () => void = () => {};
  onSeek: (value: number) => void = () => {};

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  build() {
    Stack({ alignContent: Alignment.Bottom }) {
      // Top Left Close Button
      Row() {
        Button({ type: ButtonType.Normal }) {
          Image($r('app.media.ic_round_close_24px'))
            .width(24).height(24)
            .fillColor(Color.White)
        }
        .backgroundColor(Color.Transparent)
        .width(32).height(32)
        .margin({ top: 8, left: 8 })
        .onClick(() => { this.onClose(); })
      }
      .width('100%')
      .height('100%')
      .alignItems(VerticalAlign.Top)
      .justifyContent(FlexAlign.Start)
      .hitTestBehavior(HitTestMode.Transparent)

      // Bottom Controls
      Column() {
        // Playback Buttons
        Row() {
          // Rewind
          Button({ type: ButtonType.Circle }) {
            Image($r('app.media.ic_media_rewind')) // Create SVG below
              .width(24).height(24).fillColor(Color.White)
          }
          .backgroundColor(Color.Transparent)
          .onClick(() => this.onRewind())

          // Play / Pause
          Button({ type: ButtonType.Circle }) {
            Image(this.isPlaying ? $r('app.media.ic_media_pause') : $r('app.media.ic_media_play')) // Create SVGs below
              .width(32).height(32).fillColor(Color.White)
          }
          .backgroundColor(Color.Transparent)
          .margin({ left: 16, right: 16 })
          .onClick(() => this.onPlayPause())

          // Fast Forward
          Button({ type: ButtonType.Circle }) {
            Image($r('app.media.ic_media_fast_forward')) // Create SVG below
              .width(24).height(24).fillColor(Color.White)
          }
          .backgroundColor(Color.Transparent)
          .onClick(() => this.onFastForward())
        }
        .width('100%')
        .justifyContent(FlexAlign.Center)
        .padding({ bottom: 4 })

        // Progress Bar
        Row() {
          Text(this.formatTime(this.currentTime))
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#BEBEBE')
            .margin({ right: 8 })

          Slider({
            value: this.currentTime,
            min: 0,
            max: this.duration,
            step: 1
          })
            .layoutWeight(1)
            .trackColor('#BEBEBE')
            .selectedColor(Color.White)
            .onChange((value: number) => {
              this.onSeek(value);
            })

          Text(this.formatTime(this.duration))
            .fontSize(14)
            .fontWeight(FontWeight.Bold)
            .fontColor('#BEBEBE')
            .margin({ left: 8 })
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)
        .padding({ top: 4 })
      }
      .width('100%')
      .backgroundColor('#55000000')
      .padding({ top: 4, bottom: 12, left: 12, right: 12 })
    }
    .width('100%')
    .height('100%')
  }
}