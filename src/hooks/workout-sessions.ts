import { exerciseEnums } from "@/utils/exercise-types";
import { SQLiteDatabase } from "expo-sqlite";

interface WorkoutSession {
  id: number;
  title: string;
  calories: number;
  startDate: string; // represents ISO 8601 date YYYY-MM-DDTHH:MM:SS.SSSZ
  elapsedTime: number; // in seconds
}

type ExerciseSession = {
  id: number;
  exerciseClassId: number;
};

type SetSession = {
  id: number;
  reps: number;
  totalWeight: number;
  rest: number;
  completed: boolean;
};

// TODO: do something about app_user_id being set to 1. We really shouldn't be arbitrarily setting these
async function getWorkoutSessions(db: SQLiteDatabase) {
  return db.getAllAsync<WorkoutSession>(
    `SELECT
      id,
      title,
      calories,
      started_on AS startDate,
      unixepoch(ended_on) - unixepoch(started_on) AS elapsedTime
    FROM workout_session 
    WHERE app_user_id = 1
    ORDER BY started_on DESC
    `
  );
}

async function getExerciseSessions({
  db,
  workoutSessionId,
}: {
  db: SQLiteDatabase;
  workoutSessionId: number;
}) {
  return db.getAllAsync<ExerciseSession>(
    `SELECT
      id,
      exercise_class_id as exerciseClassId
    FROM exercise_session
    WHERE workout_session_id = ?`,
    [workoutSessionId]
  );
}

async function getResistanceSetSession({
  db,
  exerciseSessionId,
}: {
  db: SQLiteDatabase;
  exerciseSessionId: number;
}) {
  const exerciseSessions = await db.getAllAsync<SetSession>(
    `SELECT
      id,
      reps,
      total_weight,
      rest_time,
      completed
    FROM set_session
    WHERE exercise_session_id = ? AND set_type = ?`,
    [exerciseSessionId, exerciseEnums.RESISTANCE_ENUM]
  );
  // Cast the completed property to boolean
  for (let i = 0; i < exerciseSessions.length; i++) {
    exerciseSessions[i].completed =
      exerciseSessions[i].completed ? true : false;
  }
  return exerciseSessions;
}
