import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import { ThemedView, ThemedText } from "@/components/Themed";
import { useExerciseClasses } from "@/hooks/exercises/exercise-classes";
import { useAddExercise } from "@/hooks/exercises/exercises";

export default function AddExerciseIndex() {
  const colorScheme = useColorScheme();
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId;
  const workoutTitle = searchParams.workoutTitle;
  if (!workoutId) {
    throw new Error(
      `workoutId or workoutTitle is undefined. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`
    );
  }

  const workoutIdNumber = parseInt(workoutId);
  if (isNaN(workoutIdNumber)) {
    throw new Error(`workoutId is not a number. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`);
  }

  // TODO: handle when query errors out
  const { data: exerciseClasses, isLoading } = useExerciseClasses();
  const addExerciseMutation = useAddExercise(workoutIdNumber);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingView}>
        <ThemedView style={[styles.loadingView, { flexDirection: "row" }]}>
          <ActivityIndicator style={styles.loadingSpinner} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {exerciseClasses && exerciseClasses.length > 0 ?
        exerciseClasses.map((exerciseClass) => (
          <Link
            href={{
              pathname: "/workouts/[workoutId]",
              params: { workoutId: workoutId, workoutTitle: workoutTitle },
            }}
            key={exerciseClass.id}
            style={[
              styles.exerciseLink,
              { color: colorScheme === "dark" ? "white" : "black" },
            ]}
            onPress={() => {
              addExerciseMutation.mutate({ exerciseClass });
            }}
          >
            {exerciseClass.title}
          </Link>
        ))
      : <ThemedText
          style={[
            styles.loadingText,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          Loading...
        </ThemedText>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  exerciseLink: {
    paddingBottom: 0.5 * 14,
    paddingTop: 0.5 * 14,
    paddingLeft: 14,
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingText: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: { paddingRight: 14, height: 2.25 * 14 },
});
