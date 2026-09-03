// entry/src/main/ets/model/VideoExercise.ets
export interface VideoExercise {
  id: string;
  title: string;
  description: string;
  week: number;
  thumbnailUrl: string; // Or Resource
  videoPath: string; // Path to local video or URL
  isLocal: boolean; // Flag to indicate if video is local
}