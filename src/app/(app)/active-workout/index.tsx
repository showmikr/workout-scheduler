import { SafeAreaView, StyleSheet } from "react-native";

import {
  useActiveWorkoutActions,
  useActiveWorkoutExercises,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import { ThemedText } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";
import ActiveExerciseCard from "./_components/ActiveExerciseCard";

const AddExerciseButton = () => {
  return (
    <TouchableOpacity
      style={{ marginVertical: 20 }}
      onPress={() => {
        router.push("/add-exercise");
      }}
    >
      <ThemedText style={{ fontSize: 28 }}>Add Exercise</ThemedText>
    </TouchableOpacity>
  );
};

export default function ActiveWorkout() {
  const isActive = useActiveWorkoutStatus();
  const exercises = useActiveWorkoutExercises();
  const { cancelWorkout } = useActiveWorkoutActions();

  if (!isActive) {
    throw new Error("No active workout. This should not happen");
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ThemedText>Active Workout</ThemedText>
      <TouchableOpacity
        onPress={() => {
          router.back();
          cancelWorkout();
        }}
      >
        <ThemedText style={{ fontSize: 24 }}>Cancel Workout</ThemedText>
      </TouchableOpacity>
      <AddExerciseButton />
      {exercises.map((exercise) => {
        return <ActiveExerciseCard key={exercise.id} exercise={exercise} />;
      })}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
