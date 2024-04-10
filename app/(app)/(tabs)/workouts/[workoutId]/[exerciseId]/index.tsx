import { SafeAreaView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  ExerciseParams,
  ExerciseSection,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../../../../../../utils/exercise-types";

function useExerciseData() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const db = useSQLiteContext();
  const [exerciseSection, setExerciseSection] = useState<ExerciseSection>();

  if (exerciseSection) {
    return exerciseSection;
  }

  const getExerciseSection = (exercise: ExerciseParams) =>
    db
      .getAllAsync<UnifiedResistanceSet | UnifiedCardioSet>(
        exercise.exercise_type_id === exerciseEnums.RESISTANCE_ENUM ?
          `
        SELECT 
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          resistance_set.id AS resistance_set_id,
          resistance_set.total_weight
        FROM exercise_set 
        INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?
          `
        : `
        SELECT
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          cardio_set.id AS cardio_set_id,
          cardio_set.target_distance,
          cardio_set.target_time
        FROM exercise_set 
        INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?
          `,
        exerciseId
      )
      .then((rows) => ({
        exercise,
        data: rows,
      }))
      .catch((err) => {
        console.log(err);
      });

  db.getFirstAsync<ExerciseParams>(
    `
      SELECT ex.id as exercise_id, ex_class.exercise_type_id, ex_class.title
      FROM exercise AS ex
      INNER JOIN exercise_class as ex_class ON ex.exercise_class_id = ex_class.id
      WHERE ex.id = ?
      `,
    exerciseId
  )
    .then((exercise) => {
      if (!exercise) {
        throw new Error(
          `SQL Query Error: couldn't find exercise table row associated with id: ${exerciseId}`
        );
      }
      return {
        exercise_id: exercise.exercise_id,
        exercise_type_id: exercise.exercise_type_id,
        title: exercise.title,
      };
    })
    .then(
      (exercise) => getExerciseSection(exercise) as unknown as ExerciseSection
    )
    .then((section) => setExerciseSection(section));

  return exerciseSection;
}

export default function () {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  const exerciseSection = useExerciseData();

  // If all the exercise set data isn't fully loaded, display a loading screen
  if (!exerciseSection) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text className="text-center text-3xl text-black dark:text-white">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView>
      <Text className="text-3xl text-black dark:text-white">
        Hello, I'm an exercise page placeholder
      </Text>
      <Text className="text-3xl text-black dark:text-white">
        Exercise ID: {exerciseId}
      </Text>
      {exerciseSection.data.map((item) => {
        return (
          <Text
            key={item.exercise_set_id}
            className="text-xl text-black dark:text-white"
          >
            {item.title}
            {"    "}
            Reps: {item.reps}
            {"    "}
            Rest:{item.rest_time}s
          </Text>
        );
      })}
    </SafeAreaView>
  );
}
