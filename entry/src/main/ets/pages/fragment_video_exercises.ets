import { ExerciseVideoCell } from './cell_exercise_video';

@Component
export struct FragmentVideoExercises {
  // Placeholder data for the list
  @State exercises: string[] = [
    "Intro to Pelvic Floor",
    "Basic Contractions",
    "Endurance Training",
    "Quick Flicks"
  ];

  build() {
    Column() {
      List() {
        ForEach(this.exercises, (item: string) => {
          ListItem() {
            ExerciseVideoCell({
              title: item,
              showCompletedIcon: false,
              onPlayClicked: () => {
              }
            })
          }
        })
      }
      .width('100%')
      .height('100%')
      .scrollBar(BarState.Auto)
    }
    .width('100%')
    .height('100%')
    .backgroundColor(Color.White)
  }
}