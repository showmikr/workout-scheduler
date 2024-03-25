import { Link, Stack } from "expo-router";
import { createContext, useContext, useReducer } from "react";
import { TaggedWorkout } from "./index";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";

type WorkoutsAction = { type: "add_new_workout"; newWorkout: TaggedWorkout };

function workoutsReducer(state: TaggedWorkout[], action: WorkoutsAction) {
  switch (action.type) {
    case "add_new_workout":
      return [...state, action.newWorkout];
  }
}

type WorkoutsContextType = [
  workouts: TaggedWorkout[],
  workoutsDispatch: React.Dispatch<WorkoutsAction>,
];
const WorkoutsContext = createContext<WorkoutsContextType | undefined>(
  undefined
);

export function useWorkoutsContext() {
  const workoutsContext = useContext(WorkoutsContext);
  if (!workoutsContext) {
    throw new Error("useWorkoutsContext must be used within a ");
  }
  return workoutsContext;
}

const getWorkouts = (db: SQLiteDatabase) => {
  const workout_tags = db.getAllSync<any>(
    `
      SELECT wk.id, wk.title as wk_title, wkt.title FROM workout AS wk
      LEFT JOIN link_tag_workout AS ltw ON ltw.workout_id = wk.id
      LEFT JOIN workout_tag AS wkt ON ltw.workout_tag_id = wkt.id
      WHERE wk.app_user_id = 1 AND wk.training_day_id IS NULL
      ORDER BY wk.id;
      `,
    null
  );
  const taggedWorkouts: TaggedWorkout[] = workout_tags
    .reduce((prev: any[], curr) => {
      const p = prev;
      if (p.length < 1 || p.at(-1).at(-1).id !== curr.id) {
        p.push([curr]);
      } else {
        p.at(-1).push(curr);
      }
      return p;
    }, [])
    .map((group: any[]) => ({
      id: group.at(0).id,
      title: group.at(0).wk_title,
      tags: group.reduce((tagList, wo) => {
        if (wo.title) {
          tagList.push(wo.title);
        }
        return tagList;
      }, []),
    }));
  return taggedWorkouts;
};

export default function TabTwoLayout() {
  const db = useSQLiteContext();
  const workouts = getWorkouts(db);
  return (
    <WorkoutsContext.Provider value={useReducer(workoutsReducer, workouts)}>
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
