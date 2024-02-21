import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Text, SafeAreaView, View, SectionList, Pressable } from "react-native";
import { twColors } from "../../../constants/Colors";

// hard coded constants based on the sqlite db table "exercise_type"
export const exerciseEnums = {
  RESISTANCE_ENUM: 1,
  CARDIO_ENUM: 2,
} as const;

export type ExerciseEnums = typeof exerciseEnums;

type CardioExerciseParams = {
  exercise_id: number;
  exercise_type_id: ExerciseEnums["CARDIO_ENUM"];
  title: string;
};
type ResistanceExerciseParams = {
  exercise_id: number;
  exercise_type_id: ExerciseEnums["RESISTANCE_ENUM"];
  title: string;
};
type ExerciseParams = CardioExerciseParams | ResistanceExerciseParams;

export type ExerciseSetParams = {
  exercise_set_id: number;
  list_order: number;
  reps: number;
  rest_time: number;
  title: string | null;
};
export type ResistanceSetParams = {
  resistance_set_id: number;
  total_weight: number;
};
export type CardioSetParams = {
  cardio_set_id: number;
  target_distance: number | null;
  target_speed: number | null;
  target_time: number | null;
};
export type UnifiedResistanceSet = ExerciseSetParams & ResistanceSetParams;
export type UnifiedCardioSet = ExerciseSetParams & CardioSetParams;

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const db = useSQLiteContext();

  const exercises = db.getAllSync<ExerciseParams>(
    `SELECT ex.id AS exercise_id, ex.title, ex.exercise_type_id FROM exercise as ex
      WHERE ex.workout_id = ?`,
    workoutId
  );

  const sectionData = exercises.map((ex) => {
    if (ex.exercise_type_id === exerciseEnums.RESISTANCE_ENUM) {
      const sets = db.getAllSync<UnifiedResistanceSet>(
        `SELECT 
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          resistance_set.id AS resistance_set_id,
          resistance_set.total_weight
        FROM exercise_set 
        INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?`,
        ex.exercise_id
      );
      return {
        exercise: ex,
        data: sets,
        key: ex.exercise_id.toString(),
      };
    }
    const sets = db.getAllSync<UnifiedCardioSet>(
      `SELECT
        exercise_set.id AS exercise_set_id,
        exercise_set.list_order,
        exercise_set.reps,
        exercise_set.rest_time,
        exercise_set.title,
        cardio_set.id AS cardio_set_id,
        cardio_set.target_distance,
        cardio_set.target_speed,
        cardio_set.target_time
      FROM exercise_set 
      INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
      WHERE exercise_set.exercise_id = ?`,
      ex.exercise_id
    );
    return {
      exercise: ex,
      data: sets,
      key: ex.exercise_id.toString(),
    };
  });

  type AppeaseReactSectionType = (
    | {
        exercise: ResistanceExercise;
        data: (UnifiedResistanceSet | UnifiedCardioSet)[];
        key: string;
      }
    | {
        exercise: CardioExercise;
        data: (UnifiedResistanceSet | UnifiedCardioSet)[];
        key: string;
      }
  )[];
  return (
    <SafeAreaView className="flex-1 justify-center">
      <View className="items-center pb-8 pt-8">
        <Text className="text-3xl dark:text-white">
          Workout Id: {workoutId}
        </Text>
        <Text className="text-3xl dark:text-white">Exercise List</Text>
      </View>
      <SectionList
        sections={
          sectionData as AppeaseReactSectionType
          // Had to cast sectionData to appease the sections type requirements.
          // The "data" key has to be a unified array
          // i.e (UnfifiedResistanceSet | UnifiedCardioSet)[]
          // and not UnifiedResistanceSet[] | UnfifiedCardioSet[]
          // where the latter is the true type of sectionData's data property
        }
        keyExtractor={(item, _index) => {
          return item.exercise_set_id.toString();
        }}
        renderSectionHeader={({ section: { exercise } }) => (
          <View className="bg-black pl-4">
            <Text className="text-3xl font-bold dark:text-white">
              {exercise.title}
            </Text>
          </View>
        )}
        renderItem={({ item, index }) => {
          return (
            <Text className="pl-4 text-xl dark:text-white">
              {item.title}
              {"    "}
              Reps: {item.reps}
              {"    "}
              Rest: {item.rest_time}s{"    "}
              {"resistance_set_id" in item ?
                <Text>{item.total_weight}kg</Text>
              : <Text className="text-xl dark:text-white">
                  Target Distance:{" "}
                  {item.target_distance ? item.target_distance + "m" : "null"}
                  {"    "}
                  Target Speed:{" "}
                  {item.target_speed ? item.target_speed + "m/s" : "null"}
                  {"    "}
                  Target Time:{" "}
                  {item.target_time ? item.target_time + "s" : "null"}
                </Text>
              }
            </Text>
          );
        }}
      />
      <Pressable
        style={({ pressed }) => ({
          flexDirection: "row",
          marginLeft: 14,
          marginBottom: 17.5,
          borderWidth: 1,
          alignSelf: "baseline",
          opacity: pressed ? 0.7 : 1,
        })}
        onPress={() => {
          router.push({
            pathname: "/(app)/workout/add-exercise/[workoutId]",
            params: { workoutId: workoutId },
          });
        }}
      >
        <FontAwesome
          className="mr-1 self-center"
          name="plus"
          color={twColors.neutral500}
        />
        <Text className="text-2xl text-black dark:text-white">
          Add Exercise
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}
