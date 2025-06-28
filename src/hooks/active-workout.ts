import { ActiveExercise, ActiveSet } from "@/context/active-workout-provider";
import { useMutation } from "@tanstack/react-query";
import { SQLiteDatabase } from "expo-sqlite";

type WorkoutDetails = {
  title: string;
  startTime: string; // expecting ISO 8601 date time format: YYYY-MM-DDTHH:mm:ss.sssZ
  duration: number; // in seconds
  exercises: Map<
    number,
    { activeExercise: ActiveExercise; activeSets: ActiveSet[] }
  >;
};

const saveWorkoutSession = async ({
  db,
  appUserId,
  workoutDetails,
}: {
  db: SQLiteDatabase;
  appUserId: number;
  workoutDetails: WorkoutDetails;
}) => {
  const { title, startTime, duration, exercises } = workoutDetails;
  // Write single entry to workout_session table
  db.withTransactionAsync(async () => {
    const workoutSessionInsert = await db.runAsync(
      `
    INSERT INTO workout_session (app_user_id, title, started_on, duration) 
    VALUES (?, ?, ?, ?)
    `,
      [appUserId, title, startTime, duration]
    );
    const workoutSessionId = workoutSessionInsert.lastInsertRowId;
    console.log("workout_session_id:", workoutSessionId);

    const dbExerciseIds: Map<number, number> = new Map(); // maps active exercise ids to exercise_session table ids
    for (const [activeExerciseId, { activeExercise }] of exercises) {
      const exerciseInsert = await db.runAsync(
        `
        INSERT INTO exercise_session (workout_session_id, exercise_class_id)
        VALUES (?, ?)
        `,
        [workoutSessionId, activeExercise.exerciseClass.id]
      );
      dbExerciseIds.set(activeExerciseId, exerciseInsert.lastInsertRowId);
    }

    for (const [key, value] of dbExerciseIds) {
      console.log("ActiveExerciseId: " + key + ", " + "dbExerciseId: " + value);
    }

    // insert sets per exercise
    for (const [activeExerciseId, dbExerciseId] of dbExerciseIds) {
      const sets = exercises.get(activeExerciseId)?.activeSets;
      if (!sets) {
        throw new Error(
          "couldn't make batched sets for saving workout session sets b/c exercise hashmap has undefined values"
        );
      }
      for (const set of sets) {
        const setInsert = await db.runAsync(
          `
          INSERT INTO set_session (exercise_session_id, reps, rest_time, completed, set_type, total_weight)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            dbExerciseId,
            set.reps,
            set.targetRest,
            set.isCompleted,
            1, // always use resistance for now. set-type: 1 = resistance, 2 = cardio
            set.weight,
          ]
        );
        console.log("set_session_id:", setInsert.lastInsertRowId);
      }
    }
  });
};

const useSaveWorkoutSession = () =>
  useMutation({
    mutationFn: saveWorkoutSession,
    onSuccess: () => {
      console.log("Saved workout sesssion to database");
    },
  });

export type { WorkoutDetails };

export { useSaveWorkoutSession };
