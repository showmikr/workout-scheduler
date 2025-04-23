import { exerciseEnums } from "@/utils/exercise-types";
import { SQLiteDatabase } from "expo-sqlite";
import { DrizzleDatabase } from "@/utils/db-utils";
import { workoutSession } from "@/db/schema";
import { getTableColumns, sql, desc, eq } from "drizzle-orm";
import { useDrizzle } from "@/db/drizzle-context";

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
export async function getWorkoutSessions(db: DrizzleDatabase) {
  const { id, title, calories, startedOn, endedOn } =
    getTableColumns(workoutSession);
  const results = await db
    .select({
      id,
      title,
      calories,
      startDate: startedOn
        .getSQL()
        .mapWith((timestamp: string) => new Date(timestamp)),
      elapsedTime: sql<number>`unixepoch(${endedOn}) - unixepoch(${startedOn})`,
    })
    .from(workoutSession)
    .where(eq(workoutSession.appUserId, 1))
    .orderBy(desc(startedOn));
  return results;
}

/**
 * @returns a list of lists of all Workout Sessions grouped by month
 * (i.e `Array<Array<WorkoutSession>>` fake types for illustration).
 * Used for creating section-list of the `SectionList` React Native component
 * which requires a list of sections as data.
 */
export async function useMonthlyWorkoutSessions() {
  const { id, title, startedOn, endedOn, appUserId } =
    getTableColumns(workoutSession);
  const db = useDrizzle();
  const workoutSessions = await db
    .select({
      id,
      title,
      startedOn: startedOn
        .getSQL()
        .mapWith((timestamp: string) => new Date(timestamp)),
      elapsedTime: sql<number>`unixepoch(${endedOn}) - unixepoch(${startedOn})`,
      // year: sql<number>`strftime(%Y, ${startedOn})`,
      // month: sql<number>`strftime(%m, ${startedOn})`,
    })
    .from(workoutSession)
    .where(eq(appUserId, 1))
    .orderBy(desc(startedOn));

  const workoutSections: Array<typeof workoutSessions> = [];

  if (workoutSessions.length === 0) return workoutSections;

  // Group workout sessions by month
  {
    workoutSections.push([]); // initialize first-month section
    let currYear = workoutSessions[0].startedOn.getFullYear();
    let currMonth = workoutSessions[0].startedOn.getMonth();
    for (const ws of workoutSessions) {
      const wsYear = ws.startedOn.getFullYear();
      const wsMonth = ws.startedOn.getMonth();
      if (!(wsYear === currYear && wsMonth === currMonth)) {
        currYear = wsYear;
        currMonth = wsMonth;
        workoutSections.push([]);
      }
      workoutSections[workoutSections.length - 1].push(ws);
    }
  }

  return workoutSections;
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
