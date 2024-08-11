import { Workout } from "@/utils/exercise-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const QUERY_KEY = ["workouts"] as const;

/**
 * This function requires that we pass a database connection handle.
 * In general this means we will need to pass it via a db context (i.e useSQLiteContext())
 */
async function getWorkouts(db: SQLiteDatabase) {
  return db.getAllAsync<Workout>(
    `
    SELECT wk.id, wk.title FROM workout AS wk
    WHERE wk.app_user_id = 1
    ORDER BY wk.id;
    `
  );
}

const useWorkouts = <T = Workout[]>(select?: (data: Workout[]) => T) => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getWorkouts(db),
    select,
  });
};

export type AddNewWorkoutArgsObj = {
  db: SQLiteDatabase;
  title: string;
  workoutCount: number;
};
/**
 * Adds a new empty workout to the sqlite database.
 *
 * @param title represents the title for the workout
 *
 * @param workoutCount Used to tell how many workouts
 * the user already has so that when we can give the new
 * workout the correct list_order table number
 * (i.e, if we have 5 workouts we can say we are adding a workout
 * whose list_order in the sqlite workout table is 6)
 *
 * @returns The id of the new workout entry in the corresponding sqlite table
 *
 */
async function addNewWorkout({
  db,
  title,
  workoutCount,
}: AddNewWorkoutArgsObj): Promise<Workout> {
  const newWorkoutId = await db.getFirstAsync<Workout>(
    `
    INSERT INTO workout (app_user_id, title, list_order)
    VALUES (1, ?, ?) 
    RETURNING workout.id, workout.title;
    `,
    [title, workoutCount + 1]
  );
  return { id: newWorkoutId!.id, title };
}

const useAddWorkout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addNewWorkout,
    onSuccess: (newWorkout) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      console.log(
        "Added new workout, id:",
        newWorkout.id,
        ", title:",
        newWorkout.title
      );
    },
    onError: (err) => {
      console.error(err);
    },
  });
};

export { useWorkouts, useAddWorkout };
