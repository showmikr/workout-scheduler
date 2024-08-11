import { ExerciseClass } from "@/utils/exercise-types";
import { useQuery } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";

const getExerciseClasses = async (db: SQLiteDatabase) => {
  return await db.getAllAsync<ExerciseClass>(
    `
    SELECT id, exercise_type_id, title 
    FROM exercise_class 
    WHERE app_user_id = 1 AND is_archived = ?
    `,
    false
  );
};

const useExerciseClasses = () => {
  const db = useSQLiteContext();
  return useQuery({
    queryKey: ["exercise-classes"],
    queryFn: () => getExerciseClasses(db),
  });
};

export { useExerciseClasses };
