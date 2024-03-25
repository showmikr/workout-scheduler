import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { ExerciseEnums } from "../[workoutId]";
import { useState } from "react";
import { SafeAreaView, Text } from "react-native";

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
  const db = useSQLiteContext();
  const availableExercises = useExerciseClasses(db);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      {availableExercises.length > 0 ?
        availableExercises.map((exerciseClass) => (
          <Text
            key={exerciseClass.id}
            className="text-3xl text-black dark:text-white"
          >
            {exerciseClass.title}
          </Text>
        ))
      : <Text className="text-3xl text-black dark:text-white">Loading...</Text>}
    </SafeAreaView>
  );
}
