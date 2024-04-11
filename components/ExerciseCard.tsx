import {
  Pressable,
  PressableProps,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { twColors } from "../constants/Colors";
import {
  ExerciseEnums,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../utils/exercise-types";
import { Ref, forwardRef } from "react";

const CardioSetList = ({ sets }: { sets: UnifiedCardioSet[] }) => {
  return (
    <>
      {sets.map((set) => (
        <Text className="text-xl dark:text-white">
          Reps: {set.reps}
          {"    "}
          Rest: {set.rest_time}s{"    "}
          Target Distance:{" "}
          {set.target_distance ? set.target_distance + "m" : "null"}
          {"    "}
          Target Time: {set.target_time ? set.target_time + "s" : "null"}
        </Text>
      ))}
    </>
  );
};

const ResistanceSetList = ({ sets }: { sets: UnifiedResistanceSet[] }) => {
  return (
    <>
      {sets.map((set) => (
        <Text key={set.exercise_set_id} className="text-xl dark:text-white">
          Reps: {set.reps}
          {"    "}
          Rest: {set.rest_time}s{"    "}
          {set.total_weight}kg
        </Text>
      ))}
    </>
  );
};

type ExerciseCardProps = {
  workoutId: number;
  exercise: {
    exerciseType: ExerciseEnums[keyof ExerciseEnums];
    exerciseId: number;
    sets: UnifiedResistanceSet[] | UnifiedCardioSet[];
    title: string;
  };
} & PressableProps;

const ExerciseCard = forwardRef(
  (
    { workoutId, exercise, ...pressableProps }: ExerciseCardProps,
    ref: Ref<View>
  ) => {
    return (
      <Pressable ref={ref} {...pressableProps}>
        <Text className="text-3xl font-bold text-black dark:text-white">
          {exercise.title}
        </Text>
        {exercise.exerciseType === exerciseEnums.RESISTANCE_ENUM ?
          <ResistanceSetList sets={exercise.sets as UnifiedResistanceSet[]} />
        : <CardioSetList sets={exercise.sets as UnifiedCardioSet[]} />}
      </Pressable>
    );
  }
);

const exerciseStyles = StyleSheet.create({
  exerciseCard: {
    borderBottomWidth: 1,
    borderBottomColor: twColors.neutral700,
    padding: 16,
  },
});

export { ExerciseCard, exerciseStyles };
