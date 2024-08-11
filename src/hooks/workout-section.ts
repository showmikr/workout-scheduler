import { exerciseEnums, ResistanceSection } from "@/utils/exercise-types";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { getResistanceSets } from "./resistance-section";
import { useQuery } from "@tanstack/react-query";

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
    SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id
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

export { useWorkoutSection };
