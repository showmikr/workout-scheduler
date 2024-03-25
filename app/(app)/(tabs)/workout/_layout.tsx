import { Link, Stack } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import {
  WorkoutsContext,
  workoutsReducer,
} from "../../../../context/workoutsContext";
import { useReducer } from "react";
import { getWorkouts } from "../../../../context/queryWorkouts";

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
    </WorkoutsContext.Provider>
  );
}
