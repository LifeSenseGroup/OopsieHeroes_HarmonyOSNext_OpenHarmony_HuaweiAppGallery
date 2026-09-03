// entry/src/main/ets/manager/VideoManager.ets
import resourceManager from '@ohos.resourceManager';

export interface VideoExercise {
  id: string;
  title: string;
  description: string;
  week: number;
  thumbnailUrl: string;
  videoPath: string;
  isLocal: boolean;
}

export class VideoManager {
  private static instance: VideoManager;

  private constructor() {}

  public static getInstance(): VideoManager {
    if (!VideoManager.instance) {
      VideoManager.instance = new VideoManager();
    }
    return VideoManager.instance;
  }

  // Get video resource URI for rawfile
  private getRawFileUri(fileName: string): string {
    return `resource://RAWFILE/${fileName}`;
  }

  public getExercisesForWeek(week: number): VideoExercise[] {
    return [
      {
        id: "ex1",
        title: "Pelvic Tilt",
        description: "Basic warm-up for pelvic floor exercises. This exercise helps strengthen your lower back and abdominal muscles.",
        week: week,
        thumbnailUrl: "app.media.thumb_ex1",
        videoPath: this.getRawFileUri("videos/pelvic_tilt.mp4"),
        isLocal: true
      },
      {
        id: "ex2",
        title: "Kegel Hold/////////////////////////////",
        description: "Learn how to properly perform Kegel exercises to strengthen your pelvic floor muscles.",
        week: week,
        thumbnailUrl: "app.media.thumb_ex2",
        videoPath: this.getRawFileUri("videos/kegel_hold.mp4"),
        isLocal: true
      },
      {
        id: "ex3",
        title: "Deep Breathing",
        description: "Relaxation technique combined with pelvic floor awareness.",
        week: week,
        thumbnailUrl: "app.media.thumb_ex3",
        videoPath: this.getRawFileUri("videos/deep_breathing.mp4"),
        isLocal: true
      }
    ];
  }

  // For online videos (future use)
  public getOnlineExercisesForWeek(week: number): VideoExercise[] {
    return [
      {
        id: "ex1_online",
        title: "Advanced Pelvic Floor",
        description: "Online video from cloud service",
        week: week,
        thumbnailUrl: "app.media.thumb_ex1",
        videoPath: "https://your-cloud-storage.com/videos/advanced_pelvic.mp4",
        isLocal: false
      }
    ];
  }

  public getCurrentWeek(): number {
    // Logic to calculate week based on start date
    // For now, return 1
    return 1;
  }
}