import { Workout } from "@/utils/exercise-types";
import { useQuery } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

/**
 * This function requires that we pass a database connection handle.
 * In general this means we will need to pass it via a db context (i.e useSQLiteContext())
 */
async function getWorkouts(db: SQLiteDatabase) {
  return db.getAllAsync<Workout>(
    `
    SELECT wk.id, wk.title FROM workout AS wk
    WHERE wk.app_user_id = 1
    ORDER BY wk.id;
    `
  );
}

const useWorkouts = <T = Workout[]>(select?: (data: Workout[]) => T) => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["workouts"],
    queryFn: () => getWorkouts(db),
    select,
  });
};

export { useWorkouts };
