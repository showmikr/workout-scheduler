import { exerciseSet, resistanceSet } from "@/db/schema";
import { DrizzleDatabase } from "@/db/drizzle-context";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import {
  IndividualWorkout,
  individualWorkoutKey,
  useWorkoutDrizzle,
} from "../workouts/individual-workout";
import { useCallback } from "react";

const useIndividualSet = (workoutId: number, setId: number) => {
  const selectSet = useCallback(
    (workout: IndividualWorkout) => workout.exerciseSets.entities[setId],
    [setId]
  );
  return useWorkoutDrizzle(workoutId, selectSet);
};

type setRepArgs = {
  db: DrizzleDatabase;
  exerciseSetId: number;
  newReps: number;
};
async function updateExerciseSetReps({
  db,
  exerciseSetId,
  newReps,
}: setRepArgs) {
  const updatedReps = await db
    .update(exerciseSet)
    .set({ reps: newReps })
    .where(eq(exerciseSet.id, exerciseSetId))
    .returning({ reps: exerciseSet.reps });
  return updatedReps.at(0);
}

const useRepsMutation = (workoutId: number, setId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExerciseSetReps,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      if (!data) {
        console.error("No data returned from updateExerciseSetReps");
        return;
      }
      console.log(`setId ${setId}: changed to ${data.reps} reps`);
      queryClient.setQueryData(
        individualWorkoutKey(workoutId),
        (old: IndividualWorkout): IndividualWorkout => ({
          ...old,
          exerciseSets: {
            ...old.exerciseSets,
            entities: {
              ...old.exerciseSets.entities,
              [setId]: {
                ...old.exerciseSets.entities[setId],
                reps: data.reps,
              },
            },
          },
        })
      );
    },
  });
};

type SetWeightArgs = {
  db: DrizzleDatabase;
  setId: number;
  newWeight: number;
};

async function updateSetWeight({ db, setId, newWeight }: SetWeightArgs) {
  const result = await db
    .update(resistanceSet)
    .set({ totalWeight: newWeight })
    .where(eq(resistanceSet.exerciseSetId, setId))
    .returning({ totalWeight: resistanceSet.totalWeight });
  return result.at(0);
}

const useWeightMutation = (workoutId: number, setId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSetWeight,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      if (!data) {
        console.error("updateSetWeight failed to return any data on mutation!");
        return;
      }
      console.log(
        `setId: ${setId} updated to ${data.totalWeight} units of weight`
      );
      queryClient.setQueryData(
        individualWorkoutKey(workoutId),
        (old: IndividualWorkout): IndividualWorkout => ({
          ...old,
          exerciseSets: {
            ...old.exerciseSets,
            entities: {
              ...old.exerciseSets.entities,
              [setId]: {
                ...old.exerciseSets.entities[setId],
                totalWeight: data.totalWeight,
              },
            },
          },
        })
      );
    },
  });
};

const updateSetRest = async ({
  db,
  setId,
  newRest,
}: {
  db: DrizzleDatabase;
  setId: number;
  newRest: number;
}) => {
  const result = await db
    .update(exerciseSet)
    .set({ restTime: newRest })
    .where(eq(exerciseSet.id, setId))
    .returning({ restTime: exerciseSet.restTime });
  return result.at(0);
};

const useRestMutation = (workoutId: number, setId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSetRest,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      if (!data) {
        console.error("Couldn't update rest properly");
        return;
      }
      queryClient.setQueryData(
        individualWorkoutKey(workoutId),
        (old: IndividualWorkout): IndividualWorkout => ({
          ...old,
          exerciseSets: {
            ...old.exerciseSets,
            entities: {
              ...old.exerciseSets.entities,
              [setId]: {
                ...old.exerciseSets.entities[setId],
                restTime: data.restTime,
              },
            },
          },
        })
      );
      console.log(
        data ?
          `updatedRestTime for setId: ${setId} to ${data.restTime}`
        : "No data returned from updateResistanceSetRestTime"
      );
    },
  });
};

export {
  useRepsMutation,
  useWeightMutation,
  useRestMutation,
  useIndividualSet,
};
