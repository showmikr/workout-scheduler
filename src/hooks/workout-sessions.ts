import { exerciseEnums } from "@/utils/exercise-types";
import { SQLiteDatabase } from "expo-sqlite";
import { workoutSession } from "@/db/schema";
import { getTableColumns, sql, desc, eq, and, isNotNull } from "drizzle-orm";
import { DrizzleDatabase, useDrizzle } from "@/db/drizzle-context";
import { useAppUserId } from "@/context/app-user-id-provider";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { year } from "drizzle-orm/mysql-core";

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

/**
 * Gets all workout sessions in sorted order from most recent to least recent
 * (i.e greater startDate timestamp to lower startDate timestamp).
 * Keep in mind, this function won't scale well when the workout session
 * count starts to creep into the thousands as a user records more sessions
 * over the years.
 * @param db
 * @param appUserId
 * @returns top level workout sessions (as in, no joins at the db level)
 */
async function getWorkoutSessions(db: DrizzleDatabase, appUserId: number) {
  const { id, title, calories, startedOn, endedOn } =
    getTableColumns(workoutSession);
  const results = await db
    .select({
      id,
      title,
      calories,
      startDate: startedOn
        .getSQL()
        .mapWith((isoTimestamp: string) => new Date(isoTimestamp)),
      elapsedTime: sql<number>`unixepoch(${endedOn}) - unixepoch(${startedOn})`,
    })
    .from(workoutSession)
    .where(and(eq(workoutSession.appUserId, appUserId), isNotNull(calories)))
    .orderBy(desc(startedOn));
  return results.map((res) => ({ ...res, calories: res.calories ?? 0 })); // WIP: gaurantee calories aren't null for graph
}

type WorkoutSessionKeyArgs =
  | { type: "full"; appUserId: number }
  | {
      type: "cutoffIndex";
      appUserId: number;
      timeSpan: WorkoutSessionsTimeSpan;
    }
  | { type: "partial"; appUserId: number; timeSpan: WorkoutSessionsTimeSpan };
const workoutSessionKey = (args: WorkoutSessionKeyArgs) => {
  const { appUserId, type: argType } = args;
  const base = ["workout-sessions", appUserId];
  switch (argType) {
    case "full":
      return base;
    case "cutoffIndex":
      return [...base, argType, args.timeSpan];
    case "partial":
      return [...base, args.timeSpan];
    default:
      throw new Error("Invalid workout session key type");
  }
};

type WorkoutSession = Awaited<ReturnType<typeof getWorkoutSessions>>[number];

const useWorkoutSessions = <T = WorkoutSession[]>(
  select?: (workoutSessions: WorkoutSession[]) => T
) => {
  const db = useDrizzle();
  const appUserId = useAppUserId();
  return useQuery({
    queryKey: workoutSessionKey({ appUserId, type: "full" }),
    queryFn: () => getWorkoutSessions(db, appUserId),
    select,
  });
};

type WorkoutSessionsTimeSpan =
  | "W" // week
  | "M" // month
  | "6M" // six months
  | "Y"; // year

const timeSpanLabels: WorkoutSessionsTimeSpan[] = ["W", "M", "6M", "Y"];

const useWorkoutSessionsByTimeSpan = (timeSpan: WorkoutSessionsTimeSpan) => {
  const queryClient = useQueryClient();
  const appUserId = useAppUserId();
  const { data: workoutSessions } = useWorkoutSessions();

  const { data: cutoffIndices } = useQuery({
    queryKey: workoutSessionKey({ type: "cutoffIndex", appUserId, timeSpan }),
    queryFn: () => {
      const yearCutoffIndex = timeSpanCutoffIndex(workoutSessions!, "Y");
      const sixMonthCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "6M",
        yearCutoffIndex
      );
      const monthCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "M",
        sixMonthCutoffIndex
      );
      const weekCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "W",
        monthCutoffIndex
      );
      return {
        W: weekCutoffIndex,
        M: monthCutoffIndex,
        "6M": sixMonthCutoffIndex,
        Y: yearCutoffIndex,
      } satisfies Record<WorkoutSessionsTimeSpan, number>;
    },
    enabled: !!workoutSessions,
  });

  // const { data: cutoffIndex } = useQuery({
  //   queryKey: workoutSessionKey({ type: "cutoffIndex", appUserId, timeSpan }),
  //   queryFn: () => timeSpanCutoffIndex(workoutSessions!, timeSpan),
  //   enabled: !!workoutSessions,
  // });

  return useQuery({
    queryKey: workoutSessionKey({ type: "partial", appUserId, timeSpan }),
    queryFn: async () => {
      const allWorkoutSessions =
        queryClient.getQueryData<WorkoutSession[]>(
          workoutSessionKey({ type: "full", appUserId })
        ) ?? [];
      return allWorkoutSessions.slice(0, cutoffIndices![timeSpan]);
    },
    enabled: !!cutoffIndices,
  });
};

/**
 * Keep in mind this useQuery selection function assumes
 * that the workoutSessions list is sorted in descending order
 * (most recent workout to least recent or biggest timestamp
 * to smallest timestamp). This function assumes the list is
 * sorted to run a binary search for the correct date to cutoff
 * from for any given time span of workout sessions.
 * @param workoutSessions refers to the list of workout sessions
 * @param timeSpan refers to the last x workout sessions you want to consider by time span (i.e week, month, year, etc)
 * @param windowLength refers to the length of the window of latest workout sessions you want to consider for the cutoff
 * @returns workout sessions from the last given time span (i.e last week, month, year, etc)
 */
const timeSpanCutoffIndex = (
  workoutSessions: WorkoutSession[],
  timeSpan: WorkoutSessionsTimeSpan,
  windowLength: number = workoutSessions.length
) => {
  const now = Date.now();
  const dayMilliseconds = 24 * 60 * 60 * 1000;
  const timeSpanMilliseconds =
    timeSpan === "Y" ? 365 * dayMilliseconds
    : timeSpan === "6M" ? 6 * (365 / 12) * dayMilliseconds
    : timeSpan === "M" ? (365 / 12) * dayMilliseconds
    : 7 * dayMilliseconds; // "W" (1 week) case

  const cutoff = new Date(now - timeSpanMilliseconds);
  cutoff.setUTCHours(0, 0, 0, 0); // Set to start of the day

  // Perform binary search to find the index of the first workout session
  // that is older than the cutoff date
  let left = 0;
  let right = windowLength;
  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (workoutSessions[mid].startDate >= cutoff) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }
  return left;
};

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

export { useWorkoutSessions, useWorkoutSessionsByTimeSpan, timeSpanLabels };

export type { WorkoutSessionsTimeSpan };
