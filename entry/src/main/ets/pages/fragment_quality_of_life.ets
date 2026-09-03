@Component
export struct FragmentQualityOfLife {
  @State selectedIndex: number = -1; // -1 = none
  @State sentimentLabel: ResourceStr = $r('app.string.make_a_choice');
  // Default empty or prompt, updates on click
  @State sentimentDescription: ResourceStr = "";

  // Helper to map index to string resource
  private getSentimentString(index: number): ResourceStr {
    switch (index) {
      case 0: return $r('app.string.sentiment_1'); // Very Dissatisfied
      case 1: return $r('app.string.sentiment_2'); // Dissatisfied
      case 2: return $r('app.string.sentiment_3'); // Neutral
      case 3: return $r('app.string.sentiment_4'); // Satisfied
      case 4: return $r('app.string.sentiment_5'); // Very Satisfied
      default: return "";
    }
  }

  @Builder SentimentIcon(index: number, icon: Resource) {
    Button({ type: ButtonType.Circle, stateEffect: true }) {
      Image(icon)
        .width(40)
        .height(40)
        // Keep original icon color (or tint if needed, but usually these are colored SVGs)
        // If you want them to be colored only when selected, use logic here.
        // Based on Android XML, they seem to be colored icons.
        .objectFit(ImageFit.Contain)
    }
    .width(60)
    .height(60)
    // --- SELECTION LOGIC ---
    // If selected -> Gray Background (#E0E0E0). If not -> Transparent.
    .backgroundColor(this.selectedIndex === index ? '#E0E0E0' : Color.Transparent)
    .onClick(() => {
      this.selectedIndex = index;
      this.sentimentDescription = this.getSentimentString(index);
    })
  }

  build() {
    Column() {
      // 1. Question
      Text($r('app.string.rate_condition_question_start'))
        .fontSize(18)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .textAlign(TextAlign.Center)
        .margin({ top: 48, bottom: 48, left: 48, right: 48 })

      // 2. Icons Row
      Row() {
        this.SentimentIcon(0, $r('app.media.ic_round_sentiment_very_dissatisfied'))
        this.SentimentIcon(1, $r('app.media.ic_round_sentiment_dissatisfied'))
        this.SentimentIcon(2, $r('app.media.ic_round_sentiment_neutral'))
        this.SentimentIcon(3, $r('app.media.ic_round_sentiment_satisfied'))
        this.SentimentIcon(4, $r('app.media.ic_round_sentiment_very_satisfied'))
      }
      .width('100%')
      .justifyContent(FlexAlign.Center)
      .margin({ bottom: 48 })

      // 3. "Make a choice" Label
      Text(this.sentimentLabel)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .textAlign(TextAlign.Center)
        .margin({ bottom: 8 })

      // 4. Dynamic Description (Updates on click)
      Text(this.sentimentDescription)
        .fontSize(14)
        .fontWeight(FontWeight.Medium)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .textAlign(TextAlign.Center)
        .margin({ bottom: 48 })
        .height(20) // Fixed height to prevent jumping layout if text is empty

      // 5. Enter Button
      Button($r('app.string.enter'))
        .type(ButtonType.Normal)
        .backgroundColor($r('app.color.persianGreen'))
        .fontColor(Color.White)
        .width(120)
        .onClick(() => {
          // Handle Enter logic
        })
        .margin({ bottom: 48 })
    }
    .width('100%')
    .height('100%')
    .justifyContent(FlexAlign.Center)
    .backgroundColor(Color.White)
  }
}