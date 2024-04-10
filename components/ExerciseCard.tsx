import { Link } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { twColors } from "../constants/Colors";
import {
  ExerciseEnums,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../utils/exercise-types";

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

const ExerciseCard = ({
  workoutId,
  exercise,
}: {
  workoutId: number;
  exercise: {
    exerciseType: ExerciseEnums[keyof ExerciseEnums];
    exerciseId: number;
    sets: UnifiedResistanceSet[] | UnifiedCardioSet[];
    title: string;
  };
}) => {
  return (
    <Link
      asChild
      style={exerciseStyles.exerciseCard}
      href={`/(app)/(tabs)/workouts/${workoutId}/${exercise.exerciseId}`}
    >
      <Pressable>
        <Text className="text-3xl font-bold text-black dark:text-white">
          {exercise.title}
        </Text>
        {exercise.exerciseType === exerciseEnums.RESISTANCE_ENUM ?
          <ResistanceSetList sets={exercise.sets as UnifiedResistanceSet[]} />
        : <CardioSetList sets={exercise.sets as UnifiedCardioSet[]} />}
      </Pressable>
    </Link>
  );
};

const exerciseStyles = StyleSheet.create({
  exerciseCard: {
    borderBottomWidth: 1,
    borderBottomColor: twColors.neutral700,
    padding: 16,
  },
});

export { ExerciseCard };
