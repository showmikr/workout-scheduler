import { SafeAreaView, StyleSheet } from "react-native";
import { useActiveWorkoutStatus } from "@/context/active-workout-provider";
import { Redirect } from "expo-router";
import ActiveWorkoutList from "@/components/active-workout/ActiveWorkoutList";

export default function ActiveWorkoutPage() {
  const isActive = useActiveWorkoutStatus();

  if (!isActive) {
    // Return to previous page
    return <Redirect href=".." />;
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ActiveWorkoutList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
