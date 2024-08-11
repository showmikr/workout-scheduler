import { useCallback } from "react";
import { useWorkoutSection, WorkoutSection } from "../workouts/workout-section";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { ExerciseClass } from "@/utils/exercise-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const useExerciseSections = (workoutId: number) => {
  const selectExercises = useCallback(
    (data: WorkoutSection) => data.exercises,
    []
  );
  return useWorkoutSection(workoutId, selectExercises);
};

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
const useDeleteExercise = (workoutId: number) => {
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

export { useExerciseSections, useAddExercise, useDeleteExercise };
