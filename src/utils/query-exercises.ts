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

const getResistanceSections = async (
  db: SQLiteDatabase,
  workoutId: string
): Promise<ResistanceSection[]> => {
  type ResistanceRow = Omit<ResistanceSection, "sets">;
  const exerciseRows = await db.getAllAsync<ResistanceRow>(
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
