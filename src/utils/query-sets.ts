import { SQLiteDatabase } from "expo-sqlite";
import { UnifiedCardioSet, UnifiedResistanceSet } from "./exercise-types";

const getResistanceSets = async (
  db: SQLiteDatabase,
  exerciseId: string
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

export { getResistanceSets, updateResistanceSetReps, updateExerciseSetReps };
