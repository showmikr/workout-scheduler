import { SafeAreaView, StyleSheet } from "react-native";
import {
  useActiveWorkout,
  useActiveWorkoutActions,
} from "@/context/active-workout-provider";
import { ThemedText } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";
import ActiveExerciseCard from "./_components/ActiveExerciseCard";

const AddExerciseButton = () => {
  return (
    <TouchableOpacity
      onPress={() => {
        router.push("/add-exercise");
      }}
    >
      <ThemedText>Add Exercise</ThemedText>
    </TouchableOpacity>
  );
};

export default function ActiveWorkout() {
  const activeWorkout = useActiveWorkout();
  const { cancelWorkout } = useActiveWorkoutActions();

  if (!activeWorkout) {
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
      {activeWorkout.exercises.map((exercise) => {
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
