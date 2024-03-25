import { FontAwesome } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import {
  Text,
  SafeAreaView,
  View,
  SectionList,
  Pressable,
  SectionListData,
} from "react-native";
import { twColors } from "../../../../constants/Colors";

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
  target_time: number | null;
};
export type UnifiedResistanceSet = ExerciseSetParams & ResistanceSetParams;
export type UnifiedCardioSet = ExerciseSetParams & CardioSetParams;

type ResistanceSection = {
  exercise: ResistanceExerciseParams;
  data: UnifiedResistanceSet[];
};
type CardioSection = {
  exercise: CardioExerciseParams;
  data: UnifiedCardioSet[];
};
type ExerciseSectionMap = {
  RESISTANCE_ENUM: ResistanceSection;
  CARDIO_ENUM: CardioSection;
};
type ExerciseEnumsMap = {
  [K in keyof ExerciseSectionMap as ExerciseEnums[K]]: ExerciseSectionMap[K];
};

type ExerciseSection<
  T extends keyof ExerciseEnumsMap = keyof ExerciseEnumsMap,
> = {
  [K in keyof ExerciseEnumsMap]: ExerciseEnumsMap[K];
}[T];

const AddExerciseBtn = ({ workoutId }: { workoutId: string }) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        marginLeft: 14,
        marginBottom: 17.5,
        borderWidth: 1,
        opacity: pressed ? 0.7 : 1,
      })}
      onPress={() => {
        router.push({
          pathname: "/(app)/(tabs)/workout/add-exercise/",
          params: { workoutId: workoutId },
        });
      }}
    >
      <FontAwesome
        className="mr-1 self-center"
        name="plus"
        color={twColors.neutral500}
      />
      <Text className="text-2xl text-black dark:text-white">Add Exercise</Text>
    </Pressable>
  );
};

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const db = useSQLiteContext();

  const exercises = db.getAllSync<ExerciseParams>(
    `
    SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id
    FROM exercise AS ex
      INNER JOIN
      exercise_class AS ex_class ON ex.exercise_class_id = ex_class.id
    WHERE ex.workout_id = ?;
    `,
    workoutId
  );

  if (exercises.length === 0) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          rowGap: 24,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text className="text-3xl text-neutral-500 dark:text-neutral-500">
          Wow, much empty...
        </Text>
        <AddExerciseBtn workoutId={workoutId} />
      </SafeAreaView>
    );
  }

  const sectionData = exercises.map((ex) => {
    if (ex.exercise_type_id === exerciseEnums.RESISTANCE_ENUM) {
      return {
        exercise: ex as ResistanceExerciseParams,
        data: db.getAllSync<UnifiedResistanceSet>(
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
        ),
        key: ex.exercise_id.toString(),
      };
    } else {
      return {
        exercise: ex as CardioExerciseParams,
        data: db.getAllSync<UnifiedCardioSet>(
          `SELECT
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
            WHERE exercise_set.exercise_id = ?`,
          ex.exercise_id
        ),
        key: ex.exercise_id.toString(),
      };
    }
  });

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
          sectionData as SectionListData<
            UnifiedResistanceSet | UnifiedCardioSet, // Union item type here, but each section has a distinct array type
            ExerciseSection // This is the true type of each section
          >[]
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
        renderItem={({ item, index, section }) => {
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
                  Target Time:{" "}
                  {item.target_time ? item.target_time + "s" : "null"}
                </Text>
              }
            </Text>
          );
        }}
      />
      <AddExerciseBtn workoutId={workoutId} />
    </SafeAreaView>
  );
}
