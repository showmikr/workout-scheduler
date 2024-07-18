import { Link, Stack } from "expo-router";

type RouteParams = {
  title: string;
};
export default function TabTwoLayout() {
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
                href="/workouts/new-workout-modal"
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
