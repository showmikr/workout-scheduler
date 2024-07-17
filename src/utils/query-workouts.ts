import { SQLiteDatabase } from "expo-sqlite/next";

export type Workout = { id: number; title: string };

/**
 * Gets a HashMap of all the workout tags for a given user.
 * @example key: 1 => value: "Upper Body"
 *               |            ^
 *               ^            tag title
 *               tag id
 */
async function getAllTagsAsync(db: SQLiteDatabase) {
  const tags = await db.getAllAsync<{ id: number; title: string }>(
    `
    SELECT id, title
    FROM workout_tag
    WHERE app_user_id = 1;
    `
  );
  // hashmap -> key: workout_tag_id, val: workout_tag_title
  const hashMap = new Map<number, string>();
  for (const { id, title } of tags) {
    hashMap.set(id, title);
  }
  return hashMap;
}

/**
 * Gets a hash map of workout IDs mapped to their associated tags.
 * It specifically maps workout IDs to a Set of workout tag IDs.
 */
async function getWorkoutTagsAsync(db: SQLiteDatabase) {
  const tableRows = db.getEachAsync<{
    workout_id: number;
    workout_tag_id: number;
  }>(
    `
    SELECT ltw.workout_id, ltw.workout_tag_id
    FROM link_tag_workout AS ltw
    JOIN workout_tag AS wt 
    ON ltw.workout_tag_id = wt.id
    WHERE wt.app_user_id = 1;
    `
  );

  const hashMap = new Map<number, Set<number>>();
  for await (const { workout_id, workout_tag_id } of tableRows) {
    if (!hashMap.has(workout_id)) {
      hashMap.set(workout_id, new Set());
    }
    hashMap.get(workout_id)?.add(workout_tag_id);
  }
  return hashMap;
}

/**
 * This function requires that we pass a database connection handle.
 * In general this means we will need to pass it via a db context (i.e useSQLiteContext())
 */
async function getWorkoutsAsync(db: SQLiteDatabase) {
  return db.getAllAsync<Workout>(
    `
    SELECT wk.id, wk.title FROM workout AS wk
    WHERE wk.app_user_id = 1 AND wk.training_day_id IS NULL
    ORDER BY wk.id;
    `
  );
}

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

async function getWorkoutCount(db: SQLiteDatabase) {
  return db
    .getFirstAsync<{ workout_count: number }>(
      `
      SELECT count(id) AS workout_count
      FROM workout
      WHERE app_user_id = 1 AND training_day_id IS NULL;
      `
    )
    .then((tableRow) => tableRow?.workout_count ?? 0);
}

export {
  getAllTagsAsync,
  getWorkoutTagsAsync,
  getWorkoutsAsync,
  getWorkoutCount,
  addNewWorkout,
};
