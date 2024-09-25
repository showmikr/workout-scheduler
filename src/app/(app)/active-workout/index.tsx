import { StyleSheet } from "react-native";
import { useActiveWorkoutStatus } from "@/context/active-workout-provider";
import { router } from "expo-router";
import ActiveWorkoutScreen from "@/components/active-workout/ActiveWorkoutScreen";

export default function ActiveWorkoutPage() {
  const isActive = useActiveWorkoutStatus();

  if (!isActive) {
    // Return to previous page
    router.dismiss();
  }

  return <ActiveWorkoutScreen />;
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
