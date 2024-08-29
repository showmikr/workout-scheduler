import { SafeAreaView, StyleSheet } from "react-native";
import {
  useActiveWorkout,
  useActiveWorkoutActions,
} from "@/context/active-workout-provider";
import { ThemedText } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";

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
        <ThemedText style={{ fontSize: 36 }}>Cancel Workout</ThemedText>
      </TouchableOpacity>
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
