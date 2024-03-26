import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { ExerciseEnums } from "..";
import { useState } from "react";
import { SafeAreaView, Text } from "react-native";
import { Link, useLocalSearchParams } from "expo-router";

type ExerciseClassParams = {
  id: number;
  exercise_type_id: ExerciseEnums[keyof ExerciseEnums];
  title: string;
};

// custom hook to asynchronously load in exercise class list from db
function useExerciseClasses(db: SQLiteDatabase) {
  const [exerciseClasses, setExerciseClasses] = useState<ExerciseClassParams[]>(
    []
  );
  if (exerciseClasses.length > 0) {
    return exerciseClasses;
  }
  // Otherwise...
  db.getAllAsync<ExerciseClassParams>(
    `SELECT id, exercise_type_id, title FROM exercise_class WHERE app_user_id = 1 AND is_archived = ?`,
    false
  ).then((availableExercises) => {
    setExerciseClasses(availableExercises);
  });
  return exerciseClasses;
}

export default function AddExerciseIndex() {
  const localSearchParams = useLocalSearchParams<{ workoutId: string }>();
  const workoutId = parseInt(localSearchParams.workoutId);

  const db = useSQLiteContext();
  const availableExercises = useExerciseClasses(db);

  const handleAddExercise = (exClass: ExerciseClassParams) => {
    const { exercise_count } = db.getFirstSync<{ exercise_count: number }>(
      `
      SELECT COUNT(id) as exercise_count 
      FROM exercise 
      WHERE workout_id = ?;
      `,
      workoutId
    ) ?? { exercise_count: 0 };
    db.runSync(
      `
      INSERT INTO exercise (exercise_class_id, workout_id, list_order)
      VALUES (?, ?, ?);
      `,
      [exClass.id, workoutId, exercise_count + 1]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {availableExercises.length > 0 ?
        availableExercises.map((exerciseClass) => (
          <Link
            href={`/workouts/${workoutId}`}
            key={exerciseClass.id}
            className="pb-2 pl-4 pt-2 text-3xl text-black dark:text-white"
            onPress={() => {
              handleAddExercise(exerciseClass);
            }}
          >
            {exerciseClass.title}
          </Link>
        ))
      : <Text className="text-3xl text-black dark:text-white">Loading...</Text>}
    </SafeAreaView>
  );
}
