import { SafeAreaView, StyleSheet } from "react-native";
import { useActiveWorkout } from "@/context/active-workout-provider";
import { ThemedText } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { router } from "expo-router";

export default function ActiveWorkout() {
  const { inProgress, setActiveWorkout } = useActiveWorkout();

  if (!inProgress) {
    throw new Error("No active workout. This should not happen");
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ThemedText>Active Workout</ThemedText>
      <TouchableOpacity
        onPress={() => {
          router.back();
          setActiveWorkout(null);
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
