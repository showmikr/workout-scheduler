import { SQLiteDatabase } from "expo-sqlite";
import {
  ExerciseSetParams,
  ResistanceSetParams,
  UnifiedCardioSet,
  UnifiedResistanceSet,
} from "./exercise-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorkoutSection } from "./query-workouts";

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

type setRepArgs = {
  db: SQLiteDatabase;
  exerciseSetId: number;
  reps: number;
};

async function updateResistanceSetReps({
  db,
  exerciseSetId,
  reps,
}: setRepArgs) {
  const updatedReps = await db.getFirstAsync<{ reps: number }>(
    `
    UPDATE exercise_set
    SET reps = ?
    WHERE id = ?
    RETURNING exercise_set.reps;
    `,
    [reps, exerciseSetId]
  );
  //  Non-null assert is okay here b/c we can handle the error
  //  in the onError() handler for the weightMutation
  return updatedReps;
}

type SetWeightArgs = {
  db: SQLiteDatabase;
  exerciseSetId: number;
  weight: number;
};

async function updateExerciseSetReps({
  db,
  exerciseSetId,
  weight,
}: SetWeightArgs) {
  const updatedWeight = await db.getFirstAsync<{ total_weight: number }>(
    `
    UPDATE resistance_set
    SET total_weight = ?
    WHERE exercise_set_id = ?
    RETURNING resistance_set.total_weight;
    `,
    [weight, exerciseSetId]
  );
  return updatedWeight;
}

type SetRestTimeArgs = {
  db: SQLiteDatabase;
  exerciseSetId: number;
  restTime: number;
};

/**
 * Updates the rest time for an exercise set in the database.
 *
 * @param db - The SQLite database instance.
 * @param exerciseSetId - The ID of the exercise set to update.
 * @param restTime - The new rest time value to set for the exercise set (in seconds).
 * @returns The updated rest time value for the exercise set.
 */
const updateExerciseSetRestTime = async ({
  db,
  exerciseSetId,
  restTime,
}: SetRestTimeArgs) => {
  return db.getFirstAsync<{ rest_time: number }>(
    `
    UPDATE exercise_set
    SET rest_time = ?
    WHERE id = ?
    RETURNING exercise_set.rest_time;
    `,
    [restTime, exerciseSetId]
  );
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
      RETURNING id AS resistance_set_id, total_weight;;
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

const useAddSetMutation = (workoutId: number, exerciseId: number) => {
  const queryClient = useQueryClient();
  const resistanceSection = queryClient
    .getQueryData<WorkoutSection>(["workout-section", workoutId])
    ?.exercises.find((exercise) => exercise.exercise_id === exerciseId);
  if (!resistanceSection) {
    throw new Error("Could not find resistance section");
  }
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

const useDeleteSetMutation = (workoutId: number, exerciseId: number) => {
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

// Will remain unused until we have cardio exercises
const getCardioSets = async (
  db: SQLiteDatabase,
  exerciseId: string
): Promise<UnifiedCardioSet[]> => {
  return db.getAllAsync<UnifiedCardioSet>(
    `
    SELECT
      exercise_set.id AS exercise_set_id,
      exercise_set.list_order,
      exercise_set.reps,
      exercise_set.rest_time,
      exercise_set.title,
      cardio_set.id AS cardio_set_id,
      cardio_set.target_distance,
      cardio_set.target_time
    FROM exercise_set 
    INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
    WHERE exercise_set.exercise_id = ?
    `,
    exerciseId
  );
};

export {
  getResistanceSets,
  updateResistanceSetReps,
  updateExerciseSetReps,
  updateExerciseSetRestTime,
  addResistanceSet,
  deleteSet,
  useAddSetMutation,
  useDeleteSetMutation,
};
