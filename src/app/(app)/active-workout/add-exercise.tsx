/**
 * This page is the entry point for adding exercises to the active workout.
 */
import {
  LayoutAnimation,
  LayoutAnimationConfig,
  SafeAreaView,
} from "react-native";
import { Redirect, router } from "expo-router";
import { figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import { ExerciseClass } from "@/utils/exercise-types";
import AddExerciseList from "@/components/AddExerciseList";

const listAddExerciseAnim: LayoutAnimationConfig = {
  duration: 400, // default fallback duration. shouldn't be used
  create: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.7,
    property: LayoutAnimation.Properties.scaleX,
    duration: 600,
  },
};

export default function AddExerciseIndex() {
  const workoutInProgress = useActiveWorkoutStatus();

  if (!workoutInProgress) {
    console.log("No workout in progress. Redirecting to /workouts");
    return <Redirect href="/workouts" />;
  }

  // TODO: handle when query errors out
  const { addExercise: addActiveExercise } = useActiveWorkoutActions();

  // onPress handler when user navigates to this page from the active workout screen
  const onPressAddActiveExercise = (exerciseClass: ExerciseClass) => {
    router.back();
    LayoutAnimation.configureNext(listAddExerciseAnim);
    addActiveExercise({ id: exerciseClass.id, title: exerciseClass.title });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: figmaColors.primaryBlack }}
    >
      <AddExerciseList onPress={onPressAddActiveExercise} />
    </SafeAreaView>
  );
}
