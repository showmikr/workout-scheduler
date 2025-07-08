import { workoutSession } from "@/db/schema";
import { getTableColumns, asc, desc, eq, and, isNotNull } from "drizzle-orm";
import { DrizzleDatabase, useDrizzle } from "@/db/drizzle-context";
import { useAppUserId } from "@/context/app-user-id-provider";
import { useQuery } from "@tanstack/react-query";
import { bisectLeft } from "@/utils/bisect";

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
    .orderBy(asc(startedOn)) // Sort by oldest to newest workout session
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

const useOneYearWorkoutSessions = ({
  db,
  appUserId,
}: {
  db: DrizzleDatabase;
  appUserId: number;
}) => {
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

const timeSpanLabels: WorkoutSessionsTimeSpan[] = ["Y", "6M", "M", "W"];

const findCutoffIndices = (sessions: WorkoutSession[]) => {
  const valueExtractor = (session: WorkoutSession) => session.startDate; // remember `startDate` is in ISO string format
  const timeSpanLowerBounds = {} as Record<WorkoutSessionsTimeSpan, number>;
  const now = new Date();
  let searchWindowLowerBound = 0;
  for (let i = 0; i < timeSpanLabels.length; i++) {
    const timeSpan = timeSpanLabels[i];
    const cutoffIndex = bisectLeft({
      array: sessions,
      value: reduceByTimeSpan(now, timeSpan).toISOString(),
      valueExtractor,
      ascending: true,
      searchWindow: [searchWindowLowerBound, sessions.length],
    });
    timeSpanLowerBounds[timeSpan] = cutoffIndex;
    searchWindowLowerBound = cutoffIndex;
  }
  return timeSpanLowerBounds;
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
  const db = useDrizzle();
  const { data: workoutSessions } = useOneYearWorkoutSessions({
    db,
    appUserId,
  });

  const { data: cutoffIndices } = useQuery({
    queryKey: workoutSessionKey({ type: "cutoffIndex", appUserId, timeSpan }),
    queryFn: () => {
      const weekCutoffIndex = timeSpanCutoffIndex(workoutSessions!, "W");
      const monthCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "M",
        weekCutoffIndex
      );
      const sixMonthCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "6M",
        monthCutoffIndex
      );
      const yearCutoffIndex = timeSpanCutoffIndex(
        workoutSessions!,
        "Y",
        sixMonthCutoffIndex
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
    queryFn: async () => {
      return workoutSessions!.slice(cutoffIndices![timeSpan]).toReversed();
    },
    enabled: !!cutoffIndices,
  });
};

const reduceByTimeSpan = (date: Date, timeSpan: WorkoutSessionsTimeSpan) => {
  const newDate = new Date(date);
  switch (timeSpan) {
    case "Y":
      newDate.setFullYear(date.getFullYear() - 1);
      break;
    case "6M":
      newDate.setMonth(date.getMonth() - 6);
      break;
    case "M":
      newDate.setMonth(date.getMonth() - 1);
      break;
    case "W":
      newDate.setDate(date.getDate() - 6); // 7 days back inclusive of current date
      break;
  }
  newDate.setHours(0, 0, 0, 0); // Set to start of the day
  return newDate;
};

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
  const now = new Date();
  const cutoffDate = reduceByTimeSpan(now, timeSpan);

  return bisectLeft({
    array: workoutSessions,
    value: cutoffDate.toISOString(),
    valueExtractor: (session) => session.startDate,
    ascending: true,
    searchWindow: [0, windowLength],
  });
};

/**
 * @returns a list of lists of all Workout Sessions grouped by month
 * (i.e `Array<Array<WorkoutSession>>` fake types for illustration).
 * Used for creating section-list of the `SectionList` React Native component
 * which requires a list of sections as data.
 */
async function useMonthlyWorkoutSessions() {
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
  useWorkoutSessionsByTimeSpan,
};

export type { WorkoutSessionsTimeSpan };
