import AddExerciseList from "@/components/AddExerciseList";
import { useAddExercise } from "@/hooks/exercises/exercises";
import { ExerciseClass } from "@/utils/exercise-types";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native";

export default function AddExerciseFromWorkoutTemplate() {
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutTitle = searchParams.workoutTitle;
  const workoutIdNumber = parseInt(searchParams.workoutId);
  if (isNaN(workoutIdNumber)) {
    throw new Error(`workoutId is not a number. This should never happen. \
      workoutId: ${searchParams.workoutId}`);
  }
  if (!workoutTitle) {
    throw new Error(`workoutTitle is undefined. This should never happen. \
      workoutId: ${searchParams.workoutId}`);
  }
  const addExerciseMutation = useAddExercise(workoutIdNumber);

  // onPress handler when user navigates to this page from a workout template screen
  const onPressAddTemplateExercise = (exerciseClass: ExerciseClass) => {
    router.navigate({
      pathname: "/workouts/[workoutId]",
      params: {
        workoutId: workoutIdNumber,
        workoutTitle: workoutTitle,
      },
    });
    addExerciseMutation.mutate({ exerciseClass });
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center" }}>
      <AddExerciseList onPress={onPressAddTemplateExercise} />
    </SafeAreaView>
  );
}
