import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const deleteExercise = async (db: SQLiteDatabase, exerciseId: number) => {
  const result = await db.getFirstAsync<{ exercise_id: number }>(
    `
    DELETE FROM exercise WHERE id = ?
    RETURNING id AS exercise_id
    `,
    exerciseId
  );
  console.log("triggered delete exerciseId: " + result?.exercise_id);
  return result;
};

/**
 * A custom React hook that provides a mutation function to delete an exercise from a workout.
 *
 * @param workoutId - The ID of the workout that the exercise belongs to.
 * @returns A mutation function that can be used to delete an exercise, and objects containing the mutation state and callbacks.
 */
const useDeleteExercise = (workoutId: number, exerciseId: number) => {
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
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

export { useDeleteExercise };
