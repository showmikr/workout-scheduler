import { SafeAreaView, ScrollView, StyleSheet } from "react-native";

import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
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
  const exerciseIds = useActiveWorkoutExerciseIds();
  const { cancelWorkout } = useActiveWorkoutActions();

  if (!isActive) {
    throw new Error("No active workout. This should not happen");
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
        }}
      >
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
        {exerciseIds.map((id) => {
          return <ActiveExerciseCard key={id} exerciseId={id} />;
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
