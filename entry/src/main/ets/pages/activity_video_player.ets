import router from '@ohos.router';
import window from '@ohos.window';
import promptAction from '@ohos.promptAction';
import { DBManager } from '../manager/DBManager';
import { SettingsManager, SettingString } from '../manager/SettingsManager';

@Entry
@Component
struct ActivityVideoPlayer {
  // Params passed from router
  @State videoUrl: string = "";
  @State videoTitle: string = "";
  @State videoCode: string = ""; // ID for tracking
  @State isExercise: boolean = false;

  // Player Controller
  controller: VideoController = new VideoController();

  // Tracking Logic
  private startTime: number = 0;
  private totalWatchedSeconds: number = 0;
  private readonly MINIMUM_SECS_FOR_DBENTRY = 1;

  aboutToAppear() {
    // Get params
    const params = router.getParams() as Record<string, Object>;
    if (params) {
      this.videoUrl = params['uri'] as string || "";
      this.videoTitle = params['title'] as string || "Video";
      this.videoCode = params['code'] as string || "0";
      this.isExercise = params['exercise'] as boolean || false;
    }

    // Keep Screen On
    let context = getContext(this);
    window.getLastWindow(context).then((win) => {
      win.setWindowKeepScreenOn(true);
    });

    this.startTime = Date.now();
  }

  aboutToDisappear() {
    // 1. Calculate Time
    const endTime = Date.now();
    const sessionSeconds = (endTime - this.startTime) / 1000;
    this.totalWatchedSeconds += sessionSeconds;

    // 2. Allow Screen to Sleep
    let context = getContext(this);
    window.getLastWindow(context).then((win) => {
      win.setWindowKeepScreenOn(false);
    });

    // 3. Save to DB (Ported logic from VideoPlayer.kt)
    if (this.isExercise && this.totalWatchedSeconds >= this.MINIMUM_SECS_FOR_DBENTRY) {
      this.saveProgress();
    }
  }

  async saveProgress() {
    const db = DBManager.getInstance();
    const settings = SettingsManager.getInstance();

    // A. Create DB Entry
    // Note: You need to ensure createDBEntry accepts these types in DBManager
    // In Android: DBEntryType.Video, totalTime, Date, "Code - Title"
    db.createDBEntry(
      'Video', // Type
      Math.floor(this.totalWatchedSeconds),
      new Date(),
      `${this.videoCode} - ${this.videoTitle}`
    );

    // B. Update Settings (VideosWatched string)
    let watched = await settings.getString(SettingString.VideosWatched);
    if (!watched) watched = "";

    // Add comma if needed
    watched += `,${this.videoCode}`;

    await settings.setString(SettingString.VideosWatched, watched);
    console.info(`VideoPlayer: Saved progress for ${this.videoCode}`);
  }

  build() {
    Stack() {
      // --- VIDEO PLAYER ---
      Video({
        src: this.videoUrl,
        controller: this.controller
      })
        .width('100%')
        .height('100%')
        .autoPlay(true)
        .controls(true) // Show native play/pause/seek controls
        .objectFit(ImageFit.Contain)
        .backgroundColor(Color.Black)
        .onStart(() => {
          // Optional: refine timing logic here if needed
        })

      // --- CLOSE BUTTON ---
      // Overlay a close button like the Android "exo_close"
      Row() {
        Button({ type: ButtonType.Circle }) {
          Image($r('app.media.ic_close_black_24dp'))
            .width(24).height(24)
            .fillColor(Color.White)
        }
        .width(40).height(40)
        .backgroundColor('#88000000') // Semi-transparent black
        .onClick(() => {
          router.back();
        })
      }
      .width('100%')
      .justifyContent(FlexAlign.Start)
      .padding({ left: 16, top: 16 })
      .position({ x: 0, y: 0 })
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.Black)
  }
}