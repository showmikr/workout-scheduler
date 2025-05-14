import { useActiveWorkoutStatus } from "@/context/active-workout-provider";
import { Redirect } from "expo-router";
import ActiveWorkoutScreen from "@/components/active-workout/ActiveWorkoutScreen";

export default function ActiveWorkoutPage() {
  const isActive = useActiveWorkoutStatus();

  if (!isActive) {
    return <Redirect href=".." />; // same as router.back() but declarative
  }

  return <ActiveWorkoutScreen />;
}
