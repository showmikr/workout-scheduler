import { ExerciseClass } from "@/utils/exercise-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const addExercise = async (
  db: SQLiteDatabase,
  workoutId: number,
  exerciseClass: ExerciseClass
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

  const result = await db.getFirstAsync<{ exercise_id: number }>(
    `
    INSERT INTO exercise (exercise_class_id, workout_id, list_order)
    VALUES (?, ?, ?)
    RETURNING exercise.id AS exercise_id;
    `,
    [exerciseClass.id, workoutId, exercise_count + 1]
  );
  return result;
};

const useAddExercise = (workoutId: number) => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ exerciseClass }: { exerciseClass: ExerciseClass }) => {
      return addExercise(db, workoutId, exerciseClass);
    },
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

export { useAddExercise };
