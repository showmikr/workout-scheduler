import { Link, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { getWorkouts } from "../../../../context/query-workouts";
import { useWorkoutStore } from "../../../../external-store";

export default function TabTwoLayout() {
  const db = useSQLiteContext();
  const [workouts, setWorkouts] = useWorkoutStore((state) => [
    state.workouts,
    state.setWorkouts,
  ]);
  if (!workouts) {
    setWorkouts(getWorkouts(db));
  }
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Workouts",
          headerRight: () => {
            return (
              <Link
                style={{
                  color: "rgb(10, 132, 255)",
                  fontSize: 18,
                  padding: 8,
                }}
                href="/workout-list/new-workout-modal"
              >
                New Workout
              </Link>
            );
          },
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="new-workout-modal"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="add-exercise/index"
        options={{ presentation: "modal", headerTitle: "Choose an exercise" }}
      />
    </Stack>
  );
}
