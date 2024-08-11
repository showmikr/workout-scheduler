import { exerciseEnums, ResistanceSection } from "@/utils/exercise-types";
import { useQuery } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { getResistanceSets } from "../workouts/workout-section";

type ResistanceExercise = Omit<ResistanceSection, "sets">;
/**
 * Retrieves the details of a resistance exercise, including its associated sets.
 *
 * @param db - The SQLite database instance.
 * @param exerciseId - The ID of the resistance exercise to retrieve.
 * @returns A Promise that resolves to a `ResistanceSection` object containing the exercise details and its sets.
 * @throws Error if the exercise is not found.
 */
const getResistanceSection = async (
  db: SQLiteDatabase,
  exerciseId: number
): Promise<ResistanceSection> => {
  const [exercise, sets] = await Promise.all([
    db.getFirstAsync<ResistanceExercise>(
      `
    SELECT 
      ex.id AS exercise_id, 
      ex_class.title, 
      ex_class.exercise_type_id
    FROM exercise AS ex
    INNER JOIN
      exercise_class AS ex_class 
      ON ex.exercise_class_id = ex_class.id
    WHERE ex.id = ? AND ex_class.exercise_type_id = ?
    `,
      [exerciseId, exerciseEnums.RESISTANCE_ENUM]
    ),
    getResistanceSets(db, exerciseId),
  ]);
  if (!exercise) {
    throw new Error("Exercise not found");
  }
  return {
    ...exercise,
    sets,
  };
};

const useResistanceSection = <TSelected = ResistanceSection>(
  exerciseId: number,
  select?: (data: ResistanceSection) => TSelected
) => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["resistance-section", exerciseId],
    queryFn: () => getResistanceSection(db, exerciseId),
    select,
  });
};
