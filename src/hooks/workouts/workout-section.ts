import {
  exerciseEnums,
  ResistanceSection,
  UnifiedResistanceSet,
  WorkoutStats,
} from "@/utils/exercise-types";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

const getResistanceSets = async (
  db: SQLiteDatabase,
  exerciseId: number
): Promise<UnifiedResistanceSet[]> => {
  return db.getAllAsync<UnifiedResistanceSet>(
    `
        SELECT 
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          resistance_set.id AS resistance_set_id,
          resistance_set.total_weight
        FROM exercise_set 
        INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?
        `,
    exerciseId
  );
};

export type WorkoutSection = {
  exercises: ResistanceSection[];
  totalExercises: number;
  totalSets: number;
};
/**
 * Retrieves the details of a specific workout section, including the exercises and associated sets.
 *
 * @param db - The SQLite database connection.
 * @param workoutId - The ID of the workout to retrieve.
 * @param title - The title of the workout.
 * @returns A `WorkoutSection` object containing the workout details.
 */
const getWorkoutSection = async (
  db: SQLiteDatabase,
  workoutId: number
): Promise<WorkoutSection> => {
  const exerciseRows = await db.getAllAsync<Omit<ResistanceSection, "sets">>(
    `
    SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id, ex_class.id AS exercise_class_id
    FROM exercise AS ex
    INNER JOIN
      exercise_class AS ex_class ON ex.exercise_class_id = ex_class.id
    WHERE ex.workout_id = ? AND ex_class.exercise_type_id = ?;
    `,
    workoutId,
    exerciseEnums.RESISTANCE_ENUM
  );

  const exercises = await Promise.all(
    exerciseRows.map(async (exercise) => {
      return {
        ...exercise,
        sets: await getResistanceSets(db, exercise.exercise_id),
      };
    })
  );

  return {
    exercises,
    totalExercises: exerciseRows.length,
    totalSets: exercises.reduce((acc, curr) => acc + curr.sets.length, 0),
  };
};

const useWorkoutSection = <T = WorkoutSection>(
  workoutId: number,
  select?: (section: WorkoutSection) => T
) => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["workout-section", workoutId],
    queryFn: () => getWorkoutSection(db, workoutId),
    select,
  });
};

const useWorkoutStats = (workoutId: number) => {
  const selectStats = useCallback(
    (data: WorkoutStats) => ({
      totalExercises: data.totalExercises,
      totalSets: data.totalSets,
    }),
    [workoutId]
  );
  return useWorkoutSection(workoutId, selectStats);
};

export { useWorkoutSection, useWorkoutStats, getResistanceSets };
