import { exerciseEnums } from "@/utils/exercise-types";
import { useQuery } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";

/**
 * Retrieves the IDs of resistance exercises associated with the specified workout.
 *
 * @param db - The SQLite database instance.
 * @param workoutId - The ID of the workout to retrieve resistance exercise IDs for.
 * @returns A Promise that resolves to an array of objects, each containing the `exercise_id` of a resistance exercise.
 */
const getResistanceExerciseIds = async (
  db: SQLiteDatabase,
  workoutId: number
) => {
  return await db.getAllAsync<{ exercise_id: number }>(
    `
    SELECT exercise.id AS exercise_id
    FROM exercise
    INNER JOIN exercise_class ON exercise.exercise_class_id = exercise_class.id
    WHERE workout_id = ? AND exercise_class.exercise_type_id = ?
    `,
    [workoutId, exerciseEnums.RESISTANCE_ENUM]
  );
};

const useResistanceExerciseIds = (db: SQLiteDatabase, workoutId: number) => {
  return useQuery({
    queryKey: ["exercise-ids", workoutId],
    queryFn: () => getResistanceExerciseIds(db, workoutId),
  });
};

// Planning to deprecate this hook in favor of doing batch queries by workout
