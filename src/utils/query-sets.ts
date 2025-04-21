import { SQLiteDatabase } from "expo-sqlite";
import { UnifiedCardioSet } from "./exercise-types";

// Will remain unused until we have cardio exercises
const getCardioSets = async (
  db: SQLiteDatabase,
  exerciseId: string
): Promise<UnifiedCardioSet[]> => {
  return db.getAllAsync<UnifiedCardioSet>(
    `
    SELECT
      exercise_set.id AS exercise_set_id,
      exercise_set.list_order,
      exercise_set.reps,
      exercise_set.rest_time,
      exercise_set.title,
      cardio_set.exercise_set_id AS cardio_set_id,
      cardio_set.target_distance,
      cardio_set.target_time
    FROM exercise_set 
    INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
    WHERE exercise_set.exercise_id = ?
    `,
    exerciseId
  );
};
