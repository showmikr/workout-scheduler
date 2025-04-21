import {
  ExerciseSetParams,
  ResistanceSetParams,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";
import { useWorkoutSection, WorkoutSection } from "../workouts/workout-section";
import { useCallback } from "react";

const useSets = (workoutId: number, exerciseId: number) => {
  const selectSets = useCallback(
    (data: WorkoutSection) =>
      data.exercises.find((exercise) => exercise.exercise_id === exerciseId)
        ?.sets,
    [exerciseId]
  );
  return useWorkoutSection(workoutId, selectSets);
};

/**
 * Adds a new resistance set to the database for the specified exercise.
 *
 * @param db - The SQLite database instance.
 * @param exerciseId - The ID of the exercise to add the resistance set to.
 * @returns The inserted exercise set and resistance set IDs.
 */
const addResistanceSet = async ({
  db,
  exerciseId,
}: {
  db: SQLiteDatabase;
  exerciseId: number;
}) => {
  let output: UnifiedResistanceSet | null = null;
  await db.withTransactionAsync(async () => {
    const setInsert = await db.getFirstAsync<ExerciseSetParams>(
      `
      INSERT INTO exercise_set (exercise_id, list_order)
      VALUES (?, (SELECT COUNT(*) FROM exercise_set WHERE exercise_id = ?) + 1)
      RETURNING id AS exercise_set_id, list_order, reps, rest_time, title;
      `,
      [exerciseId, exerciseId]
    );
    const exerciseSetId = setInsert?.exercise_set_id;
    if (!exerciseSetId) {
      throw new Error("Could not insert row into exercise_set table");
    }
    const restistanceSetInsert = await db.getFirstAsync<ResistanceSetParams>(
      `
      INSERT INTO resistance_set (exercise_set_id, total_weight)
      VALUES (?, 0)
      RETURNING exercise_set_id AS resistance_set_id, total_weight;
      `,
      [exerciseSetId]
    );
    if (!restistanceSetInsert) {
      throw new Error("Could not insert row into exercise_set table");
    }
    output = {
      ...setInsert,
      ...restistanceSetInsert,
    };
  });
  return output as UnifiedResistanceSet | null;
};

const useAddSet = (workoutId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addResistanceSet,
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

type DeleteSetResult = {
  exerciseSetId: number;
  positionsModified: number;
};
const deleteSet = async ({
  db,
  exerciseSetId,
}: {
  db: SQLiteDatabase;
  exerciseSetId: number;
}) => {
  let result: DeleteSetResult | null = null;
  await db.withTransactionAsync(async () => {
    const removedSet = await db.getFirstAsync<{
      exercise_id: number;
      deleted_pos: number;
    }>(
      `
      DELETE FROM exercise_set 
      WHERE id = ?
      RETURNING exercise_id, list_order AS deleted_pos; 
      `,
      [exerciseSetId]
    );
    if (!removedSet) {
      throw new Error("Could not delete row from exercise_set table");
    }
    const updateResult = await db.runAsync(
      `
      UPDATE exercise_set
      SET list_order = list_order - 1
      WHERE exercise_id = ? 
        AND list_order > ?;
      `,
      [removedSet.exercise_id, removedSet.deleted_pos]
    );
    result = { exerciseSetId, positionsModified: updateResult.changes };
  });
  return result as DeleteSetResult | null;
};

const useDeleteSet = (workoutId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSet,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (result) => {
      console.log(
        "Deleted exercise set: %s, positions modified: %s",
        result?.exerciseSetId,
        result?.positionsModified
      );
      queryClient.invalidateQueries({
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

export { useAddSet, useDeleteSet, useSets };
