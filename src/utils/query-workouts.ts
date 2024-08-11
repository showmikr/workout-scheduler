import { SQLiteDatabase } from "expo-sqlite";
import { WorkoutStats } from "./exercise-types";

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

async function getWorkoutStats(db: SQLiteDatabase, workoutId: number) {
  return db.getFirstAsync<WorkoutStats>(
    `
    SELECT 
      (SELECT COUNT(*) FROM exercise WHERE workout_id = w.id) AS totalExercises,
      (SELECT COUNT(*) 
        FROM exercise e 
        JOIN exercise_set es ON e.id = es.exercise_id 
        WHERE e.workout_id = w.id
      ) AS totalSets
    FROM 
        workout w
    WHERE 
        w.id = ?;
    `,
    workoutId
  );
}

async function getWorkoutCount(db: SQLiteDatabase) {
  return db
    .getFirstAsync<{ workout_count: number }>(
      `
      SELECT count(id) AS workout_count
      FROM workout
      WHERE app_user_id = 1;
      `
    )
    .then((tableRow) => tableRow?.workout_count ?? 0);
}

export {
  getAllTagsAsync,
  getWorkoutTagsAsync,
  getWorkoutCount,
  getWorkoutStats,
};
