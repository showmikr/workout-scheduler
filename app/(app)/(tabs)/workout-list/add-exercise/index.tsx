import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { ExerciseEnums } from "../../../../../utils/exercise-types";
import { useState } from "react";
import { SafeAreaView, StyleSheet, Text, useColorScheme } from "react-native";
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
  const colorScheme = useColorScheme();
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId!;
  const workoutTitle = searchParams.workoutTitle!;

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
            href={{
              pathname: "/workout-list/workout",
              params: { workoutId: workoutId, workoutTitle: workoutTitle },
            }}
            key={exerciseClass.id}
            style={[
              styles.exerciseLink,
              { color: colorScheme === "dark" ? "white" : "black" },
            ]}
            onPress={() => {
              handleAddExercise(exerciseClass);
            }}
          >
            {exerciseClass.title}
          </Link>
        ))
      : <Text
          style={[
            styles.loadingText,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          Loading...
        </Text>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  exerciseLink: {
    paddingBottom: 0.5 * 14,
    paddingTop: 0.5 * 14,
    paddingLeft: 14,
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingText: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
});
