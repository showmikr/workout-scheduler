import {
  ExerciseSetParams,
  ResistanceSetParams,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";
import { useWorkoutSection, WorkoutSection } from "../workouts/workout-section";
import { useCallback } from "react";
import { DrizzleDatabase } from "@/db/drizzle-context";
import { exerciseSet, resistanceSet } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  IndividualWorkout,
  individualWorkoutKey,
} from "../workouts/individual-workout";

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

// type DeleteSetResult = {
//   exerciseSetId: number;
//   positionsModified: number;
// };
// const deleteSet = async ({
//   db,
//   exerciseSetId,
// }: {
//   db: SQLiteDatabase;
//   exerciseSetId: number;
// }) => {
//   let result: DeleteSetResult | null = null;
//   await db.withTransactionAsync(async () => {
//     const removedSet = await db.getFirstAsync<{
//       exercise_id: number;
//       deleted_pos: number;
//     }>(
//       `
//       DELETE FROM exercise_set
//       WHERE id = ?
//       RETURNING exercise_id, list_order AS deleted_pos;
//       `,
//       [exerciseSetId]
//     );
//     if (!removedSet) {
//       throw new Error("Could not delete row from exercise_set table");
//     }
//     const updateResult = await db.runAsync(
//       `
//       UPDATE exercise_set
//       SET list_order = list_order - 1
//       WHERE exercise_id = ?
//         AND list_order > ?;
//       `,
//       [removedSet.exercise_id, removedSet.deleted_pos]
//     );
//     result = { exerciseSetId, positionsModified: updateResult.changes };
//   });
//   return result as DeleteSetResult | null;
// };

const deleteSet = async ({
  db,
  setId,
}: {
  db: DrizzleDatabase;
  exerciseId: number;
  setId: number;
}) => {
  // Based on the db schema, deleting the exerciseSet row should trigger deleting the corresponding resistanceSet row
  const result = await db
    .delete(exerciseSet)
    .where(eq(exerciseSet.id, setId))
    .returning({ setId: exerciseSet.id });
  return result.at(0);
};

const useDeleteSet = (workoutId: number, exerciseId: number, setId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSet,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (result) => {
      if (!result) {
        console.error(
          "Failed to return deleted setId in deleteSet fn. Abandoning updating query cache"
        );
        return;
      }
      console.log(`removed setId: ${setId}`);
      queryClient.setQueryData(
        individualWorkoutKey(workoutId),
        (old: IndividualWorkout): IndividualWorkout => {
          const sets = old.exerciseSets;
          const updatedSetIds = sets.ids.filter((id) => id !== setId);
          delete sets.entities[setId];

          const exercise = old.exercises;
          const updatedExerciseEntities: IndividualWorkout["exercises"] = {
            ...exercise,
            entities: {
              ...exercise.entities,
              [exerciseId]: {
                ...exercise.entities[exerciseId],
                setIds: exercise.entities[exerciseId].setIds.filter(
                  (id) => id !== setId
                ),
              },
            },
          };
          return {
            exercises: updatedExerciseEntities,
            exerciseSets: {
              ids: updatedSetIds,
              entities: { ...sets.entities },
            },
          };
        }
      );
      // queryClient.invalidateQueries({
      //   queryKey: ["workout-section", workoutId],
      // });
    },
  });
};

export { useAddSet, useDeleteSet, useSets };
