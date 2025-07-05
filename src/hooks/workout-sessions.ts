import { exerciseClass, exerciseSession, workoutSession } from "@/db/schema";
import { getTableColumns, desc, eq, and, isNotNull } from "drizzle-orm";
import { DrizzleDatabase, useDrizzle } from "@/db/drizzle-context";
import { useAppUserId } from "@/context/app-user-id-provider";
import { useQuery } from "@tanstack/react-query";
import { bisectRight } from "@/utils/bisect";

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
async function getOneYearWorkoutSessions(
  db: DrizzleDatabase,
  appUserId: number
) {
  const { id, title, calories, startedOn, duration } =
    getTableColumns(workoutSession);
  const workoutSessions = await db
    .select({
      id,
      title,
      calories,
      startDate: startedOn,
      elapsedTime: duration,
    })
    .from(workoutSession)
    .where(and(eq(workoutSession.appUserId, appUserId), isNotNull(calories)))
    .orderBy(desc(startedOn)) // Sort by most recent workout session first
    .limit(512); // Limit to 512 sessions for performance reasons

  return workoutSessions.map((res) => ({
    ...res,
    calories: res.calories ?? 0,
  })); // WIP: gaurantee calories aren't null for graph
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

type WorkoutSession = Awaited<
  ReturnType<typeof getOneYearWorkoutSessions>
>[number];

const useOneYearWorkoutSessions = () => {
  const db = useDrizzle();
  const appUserId = useAppUserId();
  return useQuery({
    queryKey: workoutSessionKey({ appUserId, type: "full" }),
    queryFn: () => getOneYearWorkoutSessions(db, appUserId),
  });
};

type WorkoutSessionsTimeSpan =
  | "W" // week
  | "M" // month
  | "6M" // six months
  | "Y"; // year

const timeSpanLabels: WorkoutSessionsTimeSpan[] = ["W", "M", "6M", "Y"];

const calculateCutoffDate = (
  timeSpan: WorkoutSessionsTimeSpan,
  now: number
) => {
  const cutoff = new Date(now - timeSpanMilliseconds[timeSpan]);
  cutoff.setUTCHours(0, 0, 0, 0); // Set to start of the day
  return cutoff.toISOString();
};

const findCutoffIndices = (sessions: WorkoutSession[]) => {
  const valueExtractor = (session: WorkoutSession) => session.startDate;
  const now = Date.now();
  const yearUpperBound = bisectRight({
    array: sessions,
    value: calculateCutoffDate("Y", now),
    valueExtractor,
    ascending: false,
  });
  const sixMonthUpperBound = bisectRight({
    array: sessions,
    value: calculateCutoffDate("6M", now),
    valueExtractor,
    ascending: false,
    searchWindow: [0, yearUpperBound],
  });
  const oneMonthUpperBound = bisectRight({
    array: sessions,
    value: calculateCutoffDate("M", now),
    valueExtractor,
    ascending: false,
    searchWindow: [0, sixMonthUpperBound],
  });
  const oneWeekUpperBound = bisectRight({
    array: sessions,
    value: calculateCutoffDate("W", now),
    valueExtractor,
    ascending: false,
    searchWindow: [0, oneMonthUpperBound],
  });
  return {
    W: oneWeekUpperBound,
    M: oneMonthUpperBound,
    "6M": sixMonthUpperBound,
    Y: yearUpperBound,
  };
};

/**
 *
 * This hook uses a "base" query to get all workout sessions in the last year and then
 * uses a derived query to get the workout sessions that are within the given time span.
 *
 * @param timeSpan refers to the last x workout sessions you want to consider by time span (i.e week, month, year, etc)
 * @description This hook will return a list of workout sessions that are within the given time span
 * (i.e last week, month, year, etc). It will also return the cutoff
 * @returns a list of workout sessions that are within the given time span
 */
const useWorkoutSessionsByTimeSpan = (timeSpan: WorkoutSessionsTimeSpan) => {
  const appUserId = useAppUserId();
  const { data: workoutSessions } = useOneYearWorkoutSessions();

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

  return useQuery({
    queryKey: workoutSessionKey({ type: "partial", appUserId, timeSpan }),
    queryFn: () => workoutSessions!.slice(0, cutoffIndices![timeSpan]),
    enabled: !!cutoffIndices,
  });
};

const dayMilliseconds = 24 * 60 * 60 * 1000;
const timeSpanMilliseconds = {
  Y: 365 * dayMilliseconds,
  "6M": 6 * (365 / 12) * dayMilliseconds,
  M: (365 / 12) * dayMilliseconds,
  W: 7 * dayMilliseconds, // 1 week case
} as const;
/**
 * Keep in mind this function assumes
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
  const cutoff = new Date(now - timeSpanMilliseconds[timeSpan]);
  cutoff.setUTCHours(0, 0, 0, 0); // Set to start of the day

  return bisectRight({
    array: workoutSessions,
    value: cutoff.toISOString(),
    valueExtractor: (session) => session.startDate,
    ascending: false,
    searchWindow: [0, windowLength],
  });
};

/**
 * @returns a list of lists of all Workout Sessions grouped by month
 * (i.e `Array<Array<WorkoutSession>>` fake types for illustration).
 * Used for creating section-list of the `SectionList` React Native component
 * which requires a list of sections as data.
 */
export async function useMonthlyWorkoutSessions() {
  const { id, title, startedOn, duration, appUserId } =
    getTableColumns(workoutSession);
  const db = useDrizzle();
  const workoutSessions = await db
    .select({
      id,
      title,
      startedOn: startedOn
        .getSQL()
        .mapWith((timestamp: string) => new Date(timestamp)),
      elapsedTime: duration,
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

export {
  useOneYearWorkoutSessions,
  findCutoffIndices,
  timeSpanLabels,
  useWorkoutSessionsByTimeSpan,
};

export type { WorkoutSessionsTimeSpan };
