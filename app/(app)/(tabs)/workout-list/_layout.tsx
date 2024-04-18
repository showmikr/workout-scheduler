import { Link, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import {
  WorkoutsContext,
  workoutsReducer,
} from "../../../../context/workouts-context";
import { useReducer } from "react";
import { getWorkouts } from "../../../../context/query-workouts";

export default function TabTwoLayout() {
  const db = useSQLiteContext();
  const [workouts, workoutsDispatch] = useReducer(
    workoutsReducer,
    getWorkouts(db)
  );
  return (
    <WorkoutsContext.Provider value={{ workouts, workoutsDispatch }}>
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
          name="[workoutId]/add-exercise/index"
          options={{ presentation: "modal", headerTitle: "Choose an exercise" }}
        />
      </Stack>
    </WorkoutsContext.Provider>
  );
}
