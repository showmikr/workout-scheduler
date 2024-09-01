import { SafeAreaView } from "react-native";
import { Redirect, router } from "expo-router";
import { figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import { ExerciseClass } from "@/utils/exercise-types";
import AddExerciseList from "@/components/AddExerciseList";

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
    router.navigate("/active-workout");
    addActiveExercise({ exerciseClassId: exerciseClass.id });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: figmaColors.primaryBlack }}
    >
      <AddExerciseList onPress={onPressAddActiveExercise} />
    </SafeAreaView>
  );
}
