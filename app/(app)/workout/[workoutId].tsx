import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Fragment, ReactElement } from "react";
import { Text, SafeAreaView, View, ScrollView } from "react-native";

// hard coded constants based on the sqlite db table "exercise_type"
const RESISTANCE_ENUM = 1;
const CARDIO_ENUM = 2;
type ExerciseType = typeof RESISTANCE_ENUM | typeof CARDIO_ENUM;

type ExerciseParams = {
  id: number;
  title: string;
  exercise_type_id: ExerciseType;
};
type ExerciseSetParams = {
  exercise_set_id: number;
  list_order: number;
  reps: number;
  rest_time: number;
  title: string | null;
};
type ResistanceSetParams = {
  resistance_set_id: number;
  total_weight: number | null;
};
type CardioSetParams = {
  cardio_set_id: number;
  target_distance: number | null;
  target_speed: number | null;
  target_time: number | null;
};
type UnifiedResistanceSet = ExerciseSetParams & ResistanceSetParams;
type UnifiedCardioSet = ExerciseSetParams & CardioSetParams;

type ExerciseSetsObject =
  | {
      exerciseType: typeof CARDIO_ENUM;
      exerciseSets: UnifiedCardioSet[];
    }
  | {
      exerciseType: typeof RESISTANCE_ENUM;
      exerciseSets: UnifiedResistanceSet[];
    };

// Currently not in use, just playing around w/ how to structure state
type ExerciseAggregate =
  | {
      exerciseType: typeof CARDIO_ENUM;
      exercise: ExerciseParams;
      exerciseSets: UnifiedCardioSet[];
    }
  | {
      exerciseType: typeof RESISTANCE_ENUM;
      exercise: ExerciseParams;
      exerciseSets: UnifiedResistanceSet[];
    };

const CommonInfo = ({
  exerciseSet,
  children,
}: {
  exerciseSet: ExerciseSetParams;
  children?: ReactElement<Text>; // Trying to make this text. Typescript doesn't seem to enforce text children.
}) => (
  <Text className="text-xl dark:text-white">
    {exerciseSet.title}
    {"    "}
    Reps: {exerciseSet.reps}
    {"    "}
    Rest: {exerciseSet.rest_time}s{"    "}
    {children}
  </Text>
);

function ExerciseSetsList({
  exerciseObject,
}: {
  exerciseObject: ExerciseSetsObject;
}) {
  const { exerciseType, exerciseSets } = exerciseObject;
  return (
    <View className="pb-2">
      {exerciseType === RESISTANCE_ENUM ?
        exerciseSets.map((set) => (
          <Fragment key={set.exercise_set_id}>
            <CommonInfo exerciseSet={set}>
              <Text className="text-xl dark:text-white">
                {set.total_weight}kg
              </Text>
            </CommonInfo>
          </Fragment>
        ))
      : exerciseSets.map((set) => (
          <Fragment key={set.exercise_set_id}>
            <CommonInfo exerciseSet={set}>
              <Text className="text-xl dark:text-white">
                Target Distance:{" "}
                {set.target_distance ? set.target_distance + "m" : "null"}
                {"    "}
                Target Speed:{" "}
                {set.target_speed ? set.target_speed + "m/s" : "null"}
                {"    "}
                Target Time: {set.target_time ? set.target_time + "s" : "null"}
              </Text>
            </CommonInfo>
          </Fragment>
        ))
      }
    </View>
  );
}

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const db = useSQLiteContext();

  const exercises = db.getAllSync<ExerciseParams>(
    `SELECT ex.id, ex.title, ex.exercise_type_id FROM exercise as ex
      WHERE ex.workout_id = ?`,
    workoutId
  );

  const getExerciseSets = (exerciseId: number, exerciseType: ExerciseType) => {
    if (exerciseType === CARDIO_ENUM) {
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
        exerciseId
      );
      return { exerciseType: CARDIO_ENUM, exerciseSets: sets } as const;
    } else {
      // Otherwise, assume it's a resistance set
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
        exerciseId
      );
      return { exerciseType: RESISTANCE_ENUM, exerciseSets: sets } as const;
    }
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
                  exerciseObject={getExerciseSets(ex.id, ex.exercise_type_id)}
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
