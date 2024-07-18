import { PressableProps, StyleSheet } from "react-native";
import { twColors } from "@/constants/Colors";
import {
  ResistanceSection,
  UnifiedCardioSet,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { Text } from "@/components/Themed";

const CardioSetList = ({ sets }: { sets: UnifiedCardioSet[] }) => {
  return (
    <>
      {sets.map((set) => (
        <Text style={styles.textxl}>
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
        <Text key={set.exercise_set_id} style={styles.textxl}>
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
  exercise: ResistanceSection;
} & PressableProps;

const ExerciseCard = ({
  workoutId,
  exercise,
}: Omit<ExerciseCardProps, "PressableProps">) => {
  return (
    <>
      <Text style={styles.exerciseTitle}>{exercise.title}</Text>
      <ResistanceSetList sets={exercise.sets} />
    </>
  );
};

const styles = StyleSheet.create({
  textxl: {
    fontSize: 1.25 * 14,
    lineHeight: 1.75 * 14,
  },
  exerciseTitle: {
    fontSize: 1.5 * 14,
    lineHeight: 2 * 14,
    fontWeight: "bold",
  },
  exerciseCard: {
    // borderBottomWidth: 1,
    borderBottomColor: twColors.neutral700,
    padding: 16,
  },
});

export { ExerciseCard, styles as exerciseStyles };
