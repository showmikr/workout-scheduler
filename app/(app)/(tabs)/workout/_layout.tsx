import { Link, Stack } from "expo-router";

export default function TabTwoLayout() {
  return (
    <>
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            title: "Tab Two",
            headerRight: () => {
              return (
                <Link
                  style={{
                    color: "rgb(10, 132, 255)",
                    fontSize: 18,
                    padding: 8,
                  }}
                  href="/workout/new-workout-modal"
                >
                  New Workout
                </Link>
              );
            },
          }}
        />
        <Stack.Screen
          name="new-workout-modal"
          options={{
            headerShown: false,
            presentation: "modal",
          }}
        />
      </Stack>
    </>
  );
}
