import router from '@ohos.router';
import promptAction from '@ohos.promptAction';
// Import all your ported fragments
import { FragmentBirthdayQuestion } from './fragment_birthday_question';
import { FragmentCountryQuestion } from './fragment_country_question';
import { FragmentWeightQuestion } from './fragment_weight_question';
import { FragmentLeakPeriodQuestion } from './fragment_leak_period_question';
import { QuestionsIntroPopup } from '../components/QuestionsIntroPopup';

@Entry
@Component
struct ActivityQuestions {
  @State currentIndex: number = 0;
  private controller: TabsController = new TabsController();
  @State showIntroPopup: boolean = true;

  // Watch for the "Too Young" flag set by FragmentBirthdayQuestion
  @StorageProp('Birthday_IsTooYoung') isBirthdayInvalid: boolean = false;
  // User has to input a weight
  @StorageLink('User_Weight') userWeight: string = ""

  // Total pages: Birthday, Country, Weight, Leak, Quality, Sensor Type
  private readonly PAGE_COUNT = 4;

  build() {
    Stack() {
      Column({ space: 0 }) {

        // --- Main Wizard Content ---
        Tabs({ barPosition: BarPosition.Start, controller: this.controller }) {

          // 1. Birthday (Index 0)
          TabContent() { FragmentBirthdayQuestion() }

          // 2. Country (Index 1)
          TabContent() { FragmentCountryQuestion() }

          // 3. Weight (Index 2)
          TabContent() { FragmentWeightQuestion() }

          // 4. Leak Period (Index 3)
          TabContent() { FragmentLeakPeriodQuestion() }

        }
        .vertical(false)
        .barHeight(0)
        .scrollable(false)
        .layoutWeight(86)
        .backgroundColor($r('app.color.grey242'))
        .onChange((index: number) => {
          this.currentIndex = index;
        })

        // --- Navigation Bar ---
        this.NavigationBar()
      }
      .width('100%')
      .height('100%')

      // Intro Popup
      if (this.showIntroPopup) {
        QuestionsIntroPopup({ isVisible: $showIntroPopup })
      }
    }
    .width('100%')
    .height('100%')
  }

  @Builder
  NavigationBar() {
    Row() {
      // Back Button
      Image($r('app.media.ic_round_keyboard_arrow_left_24px'))
        .width(56).height(56)
        .fillColor(Color.White)
        .padding(12)
        .onClick(() => {
          if (this.currentIndex > 0) {
            this.currentIndex--;
            this.controller.changeIndex(this.currentIndex);
          } else {
            router.back();
          }
        })

      // Page Indicators
      Row({ space: 8 }) {
        ForEach([0, 1, 2, 3,], (index: number) => {
          Circle({ width: 8, height: 8 })
            .fill(this.currentIndex === index ? Color.White : '#80FFFFFF')
        })
      }
      .layoutWeight(1)
      .justifyContent(FlexAlign.Center)

      // Next Button
      Image($r('app.media.ic_round_keyboard_arrow_right_24px'))
        .width(56).height(56)
        .fillColor(Color.White)
        .padding(12)
        .opacity(
          // If on Birthday page (0) AND invalid, fade the button
          (this.currentIndex === 0 && this.isBirthdayInvalid) ? 0.5 : 1.0
        )
        .onClick(() => {
          // Block if on Birthday page and too young
          if (this.currentIndex === 0 && this.isBirthdayInvalid) {
            promptAction.showToast({ message: "You must be at least 12 years old." });
            return;
          }

          if (this.currentIndex < this.PAGE_COUNT - 1) {
            this.currentIndex++;
            this.controller.changeIndex(this.currentIndex);
          } else {
            // Finish onboarding without requiring a hardware sensor.
            router.replaceUrl({ url: 'pages/activity_home' });
          }
        })
    }
    .width('100%')
    .height(56)
    .backgroundColor($r('app.color.lifesense_dark_purple'))
    .alignItems(VerticalAlign.Center)
  }
}