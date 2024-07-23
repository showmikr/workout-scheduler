import { PressableProps, StyleSheet, View } from "react-native";
import { twColors } from "@/constants/Colors";
import { ResistanceSection, UnifiedCardioSet } from "@/utils/exercise-types";
import { ThemedText } from "@/components/Themed";
import { TableRow } from "@/components/Table";

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
      <TableRow style={{ marginBottom: 0.5 * 14 }}>
        {["Reps", "Weight", "Rest"].map((column) => (
          <ThemedText key={column} style={styles.columnHeader}>
            {column}
          </ThemedText>
        ))}
      </TableRow>
      {exercise.sets.map(
        ({ reps, total_weight, rest_time, exercise_set_id }) => (
          <TableRow key={exercise_set_id} style={{ marginBottom: 0.5 * 14 }}>
            <ThemedText style={styles.dataText}>{reps}</ThemedText>
            <ThemedText style={styles.dataText}>
              {total_weight.toFixed(1)}
              <ThemedText style={styles.unitLabel}>kg</ThemedText>
            </ThemedText>
            <ThemedText style={styles.dataText}>
              {rest_time ? Math.floor(rest_time / 60) : "--"}
              <ThemedText style={styles.unitLabel}>m </ThemedText>
              {rest_time ? rest_time % 60 : "--"}
              <ThemedText style={styles.unitLabel}>s</ThemedText>
            </ThemedText>
          </TableRow>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  columnHeader: {
    flex: 1,
    fontSize: 14,
    color: twColors.neutral400,
    fontWeight: "light",
  },
  dataText: {
    flex: 1,
    fontSize: 1.25 * 14,
  },
  unitLabel: {
    fontSize: 1.125 * 14,
    fontWeight: "300",
    color: twColors.neutral400,
  },
  textxl: {
    fontSize: 1.25 * 14,
  },
  exerciseTitle: {
    fontSize: 1.5 * 14,
    fontWeight: "bold",
    marginBottom: 0.75 * 14,
  },
});

export { ExerciseCard };
