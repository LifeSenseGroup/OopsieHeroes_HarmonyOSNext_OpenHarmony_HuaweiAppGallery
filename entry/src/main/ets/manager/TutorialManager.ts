export interface VideoTutorial {
  id: number;
  title: string;
  url: string;
}

export class TutorialManager {
  private static instance: TutorialManager;

  private constructor() {}

  public static getInstance(): TutorialManager {
    if (!TutorialManager.instance) {
      TutorialManager.instance = new TutorialManager();
    }
    return TutorialManager.instance;
  }

  // MOCK DATA: Replace these URLs with your actual Vimeo/Cloud links
  // This replaces the 'readVideoTutorialsJson' logic
  public getTutorials(): VideoTutorial[] {
    return [
      {
        id: 1,
        title: "How to wear Carin",
        url: "https://www.w3schools.com/html/mov_bbb.mp4" // Placeholder
      },
      {
        id: 2,
        title: "How to wash Carin",
        url: "https://www.w3schools.com/html/movie.mp4" // Placeholder
      },
      {
        id: 3,
        title: "Understanding the App",
        url: "https://www.w3schools.com/html/mov_bbb.mp4" // Placeholder
      }
    ];
  }
}