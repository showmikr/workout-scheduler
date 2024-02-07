import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Text, SafeAreaView, View, ScrollView } from "react-native";
import type {
  CardioSet,
  Exercise,
  ExerciseSet,
  ResistanceSet,
} from "../../../sqlite-types";

// hard coded constants based on the sqlite db table "exercise_type"
const RESISTANCE_TYPE = 1;
const CARDIO_TYPE = 2;

function ExerciseSetsList({ exerciseSets }: { exerciseSets: ExerciseSet[] }) {
  return (
    <View className="pb-2">
      {exerciseSets.map((set) => (
        <Text key={set.id} className="text-xl dark:text-white">
          {set.title}
          {"    "}
          Reps: {set.reps}
          {"    "}
          Rest: {set.rest_time}s
        </Text>
      ))}
    </View>
  );
}

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const db = useSQLiteContext();

  const exercises = db.getAllSync<Exercise>(
    `SELECT ex.id, ex.title, ex.exercise_type_id FROM exercise as ex
    WHERE ex.workout_id = ?`,
    workoutId
  );

  const getExerciseSets = (exerciseId: number, exerciseType: number) => {
    if (exerciseType === CARDIO_TYPE) {
      return db.getAllSync<ExerciseSet & CardioSet>(
        `SELECT
          exercise_set.id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          cardio_set.id as cardio_set_id,
          cardio_set.target_distance,
          cardio_set.target_speed,
          cardio_set.target_time
        FROM exercise_set 
          INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
          WHERE exercise_set.exercise_id = ?`,
        exerciseId
      );
    }
    // Otherwise, assume it's a resistance set
    return db.getAllSync<ExerciseSet & ResistanceSet>(
      `SELECT 
          exercise_set.id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          resistance_set.id as resistance_set_id,
          resistance_set.total_weight
        FROM exercise_set 
        INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?`,
      exerciseId
    );
  };

  return (
    <SafeAreaView className="flex-1 justify-center">
      <ScrollView>
        <View className="items-center pb-8 pt-8">
          <Text className="text-3xl dark:text-white">
            Workout Id: {workoutId}
          </Text>
          <Text className="text-3xl dark:text-white">Exercise List</Text>
        </View>
        <View className="flex-1 pl-4">
          {exercises.map((ex) => {
            return (
              <View key={ex.id} className="pb-4">
                <Text className="text-2xl dark:text-white">{ex.title}</Text>
                <ExerciseSetsList
                  exerciseSets={getExerciseSets(ex.id!, ex.exercise_type_id)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
