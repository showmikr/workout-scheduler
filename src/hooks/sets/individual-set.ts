import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";

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

const useRepsMutation = (workoutId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateResistanceSetReps,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.reps ?
          "updatedReps: " + data.reps
        : "No data returned from updateResistanceSetReps"
      );
      queryClient.invalidateQueries({
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

type SetWeightArgs = {
  db: SQLiteDatabase;
  exerciseSetId: number;
  weight: number;
};

async function updateSetWeight({ db, exerciseSetId, weight }: SetWeightArgs) {
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

const useWeightMutation = (workoutId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSetWeight,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.total_weight ?
          "updatedWeight " + data.total_weight
        : "No data returned from updateResistanceSetWeight"
      );
      queryClient.invalidateQueries({
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

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

const useRestMutation = (workoutId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExerciseSetRestTime,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.rest_time ?
          "updatedRestTime " + data.rest_time
        : "No data returned from updateResistanceSetRestTime"
      );
      queryClient.invalidateQueries({
        queryKey: ["workout-section", workoutId],
      });
    },
  });
};

export { useRepsMutation, useWeightMutation, useRestMutation };
