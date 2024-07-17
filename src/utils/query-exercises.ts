import { SQLiteDatabase } from "expo-sqlite";
import {
  exerciseEnums,
  ExerciseParams,
  UnifiedCardioSet,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { ExerciseClass } from "../../sqlite-types";
import { Mandatory } from "@/utils/utility-types";

export type AddExerciseCardParams = Pick<
  Mandatory<ExerciseClass>,
  "id" | "exercise_type_id" | "title"
>;

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

const getExerciseSections = async (db: SQLiteDatabase, workoutId: string) => {
  const fetchedExercises = await db.getAllAsync<ExerciseParams>(
    `
    SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id
    FROM exercise AS ex
      INNER JOIN
      exercise_class AS ex_class ON ex.exercise_class_id = ex_class.id
    WHERE ex.workout_id = ?;
    `,
    workoutId
  );

  if (fetchedExercises.length > 0) {
    const newSectionData = fetchedExercises.map((ex) => {
      if (ex.exercise_type_id === exerciseEnums.RESISTANCE_ENUM) {
        return {
          exerciseType: ex.exercise_type_id,
          exercise: ex,
          data: db.getAllSync<UnifiedResistanceSet>(
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
            ex.exercise_id
          ),
          key: ex.exercise_id.toString(),
        };
      } else {
        return {
          exerciseType: ex.exercise_type_id,
          exercise: ex,
          data: db.getAllSync<UnifiedCardioSet>(
            `SELECT
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
                WHERE exercise_set.exercise_id = ?`,
            ex.exercise_id
          ),
          key: ex.exercise_id.toString(),
        };
      }
    });
    return newSectionData;
  }
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

export { getExerciseSections, getExerciseClasses, addExercise, deleteExercise };
