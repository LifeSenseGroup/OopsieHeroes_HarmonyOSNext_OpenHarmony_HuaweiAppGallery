import router from '@ohos.router';
import { BusinessError } from '@ohos.base';

@Entry
@Component
struct ActivityIntro {
  @State contactInput: string = '';  // Can be email or phone
  @State privacyAccepted: boolean = false;
  @State inputType: string = 'unknown'; // Track detected type: 'email' or 'phone'

  // Helper to validate email format
  isValidEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Helper to validate 8-digit phone number
  isValidPhone(phone: string): boolean {
    // Remove any spaces or dashes
    const cleaned = phone.replace(/[\s\-]/g, '');
    // Check if it's exactly 8 digits
    const phoneRegex = /^\d{8}$/;
    return phoneRegex.test(cleaned);
  }

  // Detect if input is email or phone
  detectInputType(input: string): string {
    if (input.includes('@') && this.isValidEmail(input)) {
      return 'email';
    } else if (this.isValidPhone(input)) {
      return 'phone';
    }
    return 'unknown';
  }

  // Check if current input is valid (either email or 8-digit phone)
  isValidContact(): boolean {
    return this.isValidEmail(this.contactInput) || this.isValidPhone(this.contactInput);
  }

  // Button enabled only when privacy accepted AND valid contact
  isButtonEnabled(): boolean {
    return this.privacyAccepted && this.isValidContact();
  }

  // Get placeholder text
  getPlaceholder(): string {
    return 'Enter email or 8-digit phone number';
  }

  // FIXED: Get validation message based on input
  getValidationMessage(): string {
    if (this.contactInput.length === 0 || this.isValidContact()) {
      return '';
    }

    if (this.contactInput.includes('@')) {
      return 'Please enter a valid email address (e.g., name@example.com)';
    }

    if (/^\d+$/.test(this.contactInput)) {
      if (this.contactInput.length < 8) {
        return `Phone number must be 8 digits (${this.contactInput.length}/8)`;
      }
      if (this.contactInput.length > 8) {
        return `Phone number must be exactly 8 digits (${this.contactInput.length}/8)`;
      }
    }

    return 'Please enter a valid email or 8-digit phone number';
  }

  // Get success message based on detected type
  getSuccessMessage(): string {
    if (this.inputType === 'email' && this.isValidEmail(this.contactInput)) {
      return '✓ Valid email address';
    }
    if (this.inputType === 'phone' && this.isValidPhone(this.contactInput)) {
      return '✓ Valid 8-digit phone number';
    }
    return '';
  }

  // Get message color
  getMessageColor(): Color {
    if (this.getSuccessMessage().length > 0) {
      return Color.Green;
    }
    return Color.Red;
  }

  build() {
    Column({ space: 0 }) {
      // Logo
      Image($r('app.media.carin_logo_2pt'))
        .width(64)
        .height('auto')
        .objectFit(ImageFit.Fill)
        .fillColor($r('app.color.lifesense_dark_purple'))
        .margin({ top: 24, left: 8, right: 8 })

      // Intro Slides (Swiper)
      Swiper() {
        // Slide 1
        Column() {
          Text('TRAIN YOUR BODY')
            .fontSize(24)
            .fontColor($r('app.color.lifesense_dark_purple'))
            .fontWeight(FontWeight.Bold)
            .margin({ bottom: 16 })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)

        // Slide 2
        Column() {
          Text('MEASURE YOUR PROGRESS')
            .fontSize(24)
            .fontColor($r('app.color.lifesense_dark_purple'))
            .fontWeight(FontWeight.Bold)
            .textAlign(TextAlign.Center)
            .margin({ bottom: 16 })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)

        // Slide 3
        Column() {
          Text('FEEL YOUR PELVIC FLOOR')
            .fontSize(24)
            .fontColor($r('app.color.lifesense_dark_purple'))
            .fontWeight(FontWeight.Bold)
            .textAlign(TextAlign.Center)
            .margin({ bottom: 16 })
        }
        .width('100%')
        .height('100%')
        .justifyContent(FlexAlign.Center)
      }
      .index(0)
      .autoPlay(true)
      .interval(3000)
      .indicator(true)
      .loop(true)
      .margin({ top: 22, bottom: 22 })
      .layoutWeight(1)

      // Welcome Text
      Text($r('app.string.welcome_to_oopsie_heroes'))
        .fontSize(22)
        .fontColor($r('app.color.lifesense_dark_purple'))
        .fontWeight(FontWeight.Bold)
        .margin({ bottom: 32 })

      // Contact Input (Email or Phone)
      Column() {
        Row({ space: 0 }) {
          // Email icon
          Image($r('app.media.ic_email'))
            .width(50)
            .height('auto')
            .objectFit(ImageFit.Fill)
            .fillColor($r('app.color.lifesense_dark_purple'))
            .margin({ left: 24, right: 24 })
            .opacity(1.0)

          // Input field
          TextInput({
            placeholder: this.getPlaceholder(),
            text: this.contactInput
          })
            .layoutWeight(1)
            .type(InputType.Normal)
            .onChange((value: string) => {
              // Remove spaces automatically for cleaner validation
              const cleaned = value.replace(/\s/g, '');
              this.contactInput = cleaned;

              // Detect input type as user types
              if (cleaned.length > 0) {
                this.inputType = this.detectInputType(cleaned);
              } else {
                this.inputType = 'unknown';
              }
            })
            .margin({ right: 24 })
        }
        .width('100%')
        .alignItems(VerticalAlign.Center)

        // FIXED: Validation message - using helper functions instead of inline logic
        if (this.contactInput.length > 0 && !this.isValidContact()) {
          Text(this.getValidationMessage())
            .fontSize(12)
            .fontColor(Color.Red)
            .alignSelf(ItemAlign.Start)
            .margin({ left: 90, top: 4 })
        } else if (this.isValidContact()) {
          Text(this.getSuccessMessage())
            .fontSize(12)
            .fontColor(Color.Green)
            .alignSelf(ItemAlign.Start)
            .margin({ left: 90, top: 4 })
        }
      }

      // Privacy Policy Toggle Section
      Column({ space: 12 }) {
        Text($r('app.string.i_agree'))
          .fontWeight(FontWeight.Medium)
          .alignSelf(ItemAlign.Start)
          .margin({ left: 24 })

        // Privacy Policy row with toggle
        Row() {
          Text($r('app.string.privacy_policy'))
            .fontWeight(FontWeight.Bold)
            .fontColor(Color.Black)
            .padding(7)
            .onClick(() => {
              console.log('Privacy Policy clicked');
              router.pushUrl({ url: 'pages/activity_privacy_policy' })
                .catch((err: BusinessError) => {
                  console.error('Navigation failed: ' + JSON.stringify(err));
                });
            })

          Toggle({ type: ToggleType.Switch, isOn: this.privacyAccepted })
            .onChange((value: boolean) => {
              this.privacyAccepted = value;
            })
            .margin({ left: 24, right: 24 })
        }
        .width('100%')
        .justifyContent(FlexAlign.SpaceBetween)
        .alignItems(VerticalAlign.Center)
      }
      .margin({ bottom: 24 })

      // GET STARTED Button
      Button($r('app.string.get_started'), { type: ButtonType.Normal })
        .width('100%')
        .height(60)
        .backgroundColor(this.isButtonEnabled() ? $r('app.color.persianGreen') : Color.Gray)
        .fontColor(Color.White)
        .fontSize(16)
        .fontWeight(FontWeight.Bold)
        .enabled(this.isButtonEnabled())
        .onClick(() => {
          if (this.isButtonEnabled()) {
            console.log('Navigating to questions screen...');
            console.log('Contact type:', this.inputType);
            console.log('Contact value:', this.contactInput);

            router.pushUrl({ url: 'pages/activity_questions' })
              .then(() => {
                console.log('Navigation successful');
              })
              .catch((err: BusinessError) => {
                console.error('Navigation failed: ' + JSON.stringify(err));
              });
          }
        })
        .margin(24)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}
