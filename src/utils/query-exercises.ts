import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { exerciseEnums, ResistanceSection } from "@/utils/exercise-types";
import { getResistanceSets } from "./query-sets";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type AddExerciseCardParams = {
  id: number;
  exercise_type_id: number;
  title: string;
};
const getExerciseClasses = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<AddExerciseCardParams>(
    `
    SELECT id, exercise_type_id, title 
    FROM exercise_class 
    WHERE app_user_id = 1 AND is_archived = ?
    `,
    false
  );
};

const addExercise = async (
  db: SQLiteDatabase,
  workoutId: string,
  exerciseClass: AddExerciseCardParams
) => {
  const { exercise_count } = (await db.getFirstAsync<{
    exercise_count: number;
  }>(
    `
    SELECT COUNT(id) as exercise_count 
    FROM exercise 
    WHERE workout_id = ?;
    `,
    workoutId
  )) ?? { exercise_count: 0 };

  const runResult = await db.runAsync(
    `
    INSERT INTO exercise (exercise_class_id, workout_id, list_order)
    VALUES (?, ?, ?);
    `,
    [exerciseClass.id, workoutId, exercise_count + 1]
  );
  return runResult;
};

/**
 * Retrieves the IDs of resistance exercises associated with the specified workout.
 *
 * @param db - The SQLite database instance.
 * @param workoutId - The ID of the workout to retrieve resistance exercise IDs for.
 * @returns A Promise that resolves to an array of objects, each containing the `exercise_id` of a resistance exercise.
 */
const getResistanceExerciseIds = async (
  db: SQLiteDatabase,
  workoutId: string
) => {
  const exerciseIds = await db.getAllAsync<{ exercise_id: number }>(
    `
    SELECT id AS exercise_id
    FROM exercise
    INNER JOIN exercise_class ON exercise.exercise_class_id = exercise_class.id
    WHERE workout_id = ? AND exercise_class.exercise_type_id = ?
    `,
    [workoutId, exerciseEnums.RESISTANCE_ENUM]
  );
};

type ResistanceExercise = Omit<ResistanceSection, "sets">;

/**
 * Retrieves the details of a resistance exercise, including its associated sets.
 *
 * @param db - The SQLite database instance.
 * @param exerciseId - The ID of the resistance exercise to retrieve.
 * @returns A Promise that resolves to a `ResistanceSection` object containing the exercise details and its sets.
 * @throws Error if the exercise is not found.
 */
const getResistanceSection = async (
  db: SQLiteDatabase,
  exerciseId: number
): Promise<ResistanceSection> => {
  const [exercise, sets] = await Promise.all([
    db.getFirstAsync<ResistanceExercise>(
      `
    SELECT 
      ex.id AS exercise_id, 
      ex_class.title, 
      ex_class.exercise_type_id
    FROM exercise AS ex
    INNER JOIN
      exercise_class AS ex_class 
      ON ex.exercise_class_id = ex_class.id
    WHERE ex.id = ? AND ex_class.exercise_type_id = ?
    `,
      [exerciseId, exerciseEnums.RESISTANCE_ENUM]
    ),
    getResistanceSets(db, exerciseId.toString()),
  ]);
  if (!exercise) {
    throw new Error("Exercise not found");
  }
  return {
    ...exercise,
    sets,
  };
};

const getResistanceSections = async (
  db: SQLiteDatabase,
  workoutId: string
): Promise<ResistanceSection[]> => {
  const exerciseRows = await db.getAllAsync<ResistanceExercise>(
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

  const exerciseSections = await Promise.all(
    exerciseRows.map(async (exercise) => {
      const sets = await getResistanceSets(db, exercise.exercise_id.toString());
      return {
        ...exercise,
        sets,
      };
    })
  );
  return exerciseSections;
};

const deleteExercise = async (db: SQLiteDatabase, exerciseId: number) => {
  const result = await db.runAsync(
    `DELETE FROM exercise WHERE id = ?`,
    exerciseId
  );
  console.log(
    "triggered delete exerciseId: " +
      exerciseId +
      ", rows deleted: " +
      result.changes
  );
};

/**
 * A custom React hook that provides a mutation function to delete an exercise from a workout.
 *
 * @param workoutId - The ID of the workout that the exercise belongs to.
 * @returns A mutation function that can be used to delete an exercise, and objects containing the mutation state and callbacks.
 */
const useDeleteExerciseMutation = (workoutId: string) => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseId }: { exerciseId: number }) =>
      deleteExercise(db, exerciseId),
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-stats", workoutId],
      });
    },
  });
};

export {
  getExerciseClasses,
  getResistanceSections,
  addExercise,
  deleteExercise,
  useDeleteExerciseMutation,
};
