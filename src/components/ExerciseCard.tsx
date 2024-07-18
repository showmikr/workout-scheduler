import { PressableProps, StyleSheet, View } from "react-native";
import { twColors } from "@/constants/Colors";
import { ResistanceSection, UnifiedCardioSet } from "@/utils/exercise-types";
import { ThemedText } from "@/components/Themed";

const CardioSetList = ({ sets }: { sets: UnifiedCardioSet[] }) => {
  return (
    <>
      {sets.map((set) => (
        <ThemedText style={styles.textxl}>
          Reps: {set.reps}
          {"    "}
          Rest: {set.rest_time}s{"    "}
          Target Distance:{" "}
          {set.target_distance ? set.target_distance + "m" : "null"}
          {"    "}
          Target Time: {set.target_time ? set.target_time + "s" : "null"}
        </ThemedText>
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
    <View
      style={{
        flex: 1,
        paddingHorizontal: 1.25 * 14,
        marginVertical: 1.25 * 14,
      }}
    >
      <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
      <View
        style={{
          flex: 1,
          flexDirection: "row",
          marginBottom: 0.75 * 14,
        }}
      >
        <ThemedText style={styles.columnHeader}>Reps</ThemedText>
        <ThemedText style={styles.columnHeader}>Weight</ThemedText>
        <ThemedText style={styles.columnHeader}>Rest</ThemedText>
      </View>
      {exercise.sets.map((set) => (
        <View style={styles.tableRow} key={set.exercise_set_id}>
          <View style={styles.tableItemWrapper}>
            <ThemedText style={styles.tableReadOnlyItem}>{set.reps}</ThemedText>
          </View>
          <View style={styles.tableItemWrapper}>
            <ThemedText style={styles.tableReadOnlyItem}>
              {set.total_weight.toFixed(1)} kg
            </ThemedText>
          </View>
          <View style={styles.tableItemWrapper}>
            <ThemedText style={styles.tableReadOnlyItem}>
              {set.rest_time} s
            </ThemedText>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tableRow: {
    flex: 1,
    flexDirection: "row",
    marginBottom: 0.5 * 14,
  },
  columnHeader: {
    flex: 1,
    textAlign: "left",
    fontSize: 14,
    color: twColors.neutral400,
    fontWeight: "light",
  },
  tableInputItem: {
    fontWeight: "normal",
    flex: 1,
    alignSelf: "flex-start",
    minWidth: 3 * 14,
    backgroundColor: twColors.neutral600,
    borderRadius: 0.5 * 14,
    borderWidth: 0.2,
    borderColor: twColors.neutral600,
  },
  tableReadOnlyItem: {
    flex: 1,
    textAlign: "left",
    fontWeight: "normal",
    fontSize: 1.25 * 14,
  },
  tableItemWrapper: {
    flex: 1,
  },
  textxl: {
    fontSize: 1.25 * 14,
  },
  exerciseTitle: {
    fontSize: 1.5 * 14,
    fontWeight: "bold",
    marginBottom: 0.75 * 14,
  },
  exerciseCard: {
    paddingVertical: 16,
  },
});

export { ExerciseCard };
