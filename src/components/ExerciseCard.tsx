import { Pressable, StyleSheet, TextStyle, View } from "react-native";
import { twColors } from "@/constants/Colors";
import { ResistanceSection } from "@/utils/exercise-types";
import { ThemedText } from "@/components/Themed";
import { TableRow } from "@/components/Table";
import { router } from "expo-router";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { DeleteUnderlay } from "./CardUnderlay";
import { useCallback } from "react";
import { immediateDebounce } from "@/utils/debounce-utils";
import { useDeleteExercise } from "@/hooks/exercises/exercises";

const ExerciseContentContainer = ({
  exercise,
}: {
  exercise: ResistanceSection;
}) => {
  return (
    <View
      style={{
        maxWidth: 360,
        paddingHorizontal: 1.25 * 14,
        marginVertical: 1.25 * 14,
      }}
    >
      <ThemedText style={styles.exerciseTitle}>{exercise.title}</ThemedText>
      <TableRow style={{ marginBottom: 0.5 * 14 }}>
        {[
          { header: "Reps", style: styles.repsText },
          { header: "Weight", style: styles.weightText },
          { header: "Rest", style: styles.restText },
        ].map((column) => (
          <View key={column.header} style={styles.tableCell}>
            <ThemedText style={[styles.columnHeader, column.style]}>
              {column.header}
            </ThemedText>
          </View>
        ))}
      </TableRow>
      {exercise.sets.map(
        ({ reps, total_weight, rest_time, exercise_set_id }) => (
          <TableRow key={exercise_set_id} style={{ marginBottom: 0.5 * 14 }}>
            <View style={styles.tableCell}>
              <ThemedText style={[styles.dataText, styles.repsText]}>
                {reps}
              </ThemedText>
            </View>
            <View style={styles.tableCell}>
              <ThemedText style={[styles.dataText, styles.weightText]}>
                {total_weight.toFixed(1)}
                <ThemedText style={styles.unitLabel}>kg</ThemedText>
              </ThemedText>
            </View>
            <View style={styles.tableCell}>
              <ThemedText style={[styles.dataText, styles.restText]}>
                {rest_time ?
                  Math.floor(rest_time / 60)
                    .toString()
                    .padStart(2, "\u2002")
                : "--"}
                <ThemedText style={styles.unitLabel}>m </ThemedText>
                {rest_time ?
                  (rest_time % 60).toString().padStart(2, "\u2002")
                : "--"}
                <ThemedText style={styles.unitLabel}>s</ThemedText>
              </ThemedText>
            </View>
          </TableRow>
        )
      )}
    </View>
  );
};

function ExercisePressableContainer({
  exercise,
  workoutId,
  children,
}: {
  exercise: ResistanceSection;
  workoutId: number;
  children: React.ReactElement;
}) {
  const onPressHandler = () => {
    router.push({
      pathname: "/workouts/[workoutId]/[exerciseId]",
      params: {
        workoutId: workoutId,
        exerciseId: exercise.exercise_id,
        title: exercise.title,
      },
    });
  };
  return <Pressable onPress={onPressHandler}>{children}</Pressable>;
}

const ExerciseCard = ({
  exercise,
  workoutId,
}: {
  exercise: ResistanceSection;
  workoutId: number;
}) => {
  const exerciseId = exercise.exercise_id;
  const { mutate: deleteExercise } = useDeleteExercise(workoutId);
  // Don't let user spam the delete button to trigger multiple deletes
  const debouncedDelete = useCallback(
    immediateDebounce(() => deleteExercise({ exerciseId }), 1000),
    [exerciseId]
  );

  return (
    <Swipeable
      renderRightActions={(_progress, drag) => (
        <DeleteUnderlay drag={drag} onPress={debouncedDelete} />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
    >
      <ExercisePressableContainer workoutId={workoutId} exercise={exercise}>
        <ExerciseContentContainer exercise={exercise} />
      </ExercisePressableContainer>
    </Swipeable>
  );
};

const columnConfig = {
  reps: {
    textStyle: {
      minWidth: 32,
      textAlign: "right",
    } as TextStyle,
  },
  weight: {
    textStyle: {
      width: 64,
    } as TextStyle,
  },
  rest: {
    textStyle: {
      width: 68,
    } as TextStyle,
  },
};

const styles = StyleSheet.create({
  columnHeader: {
    fontSize: 14,
    textAlign: "right",
    color: twColors.neutral400,
    fontWeight: "light",
  },
  repsText: columnConfig.reps.textStyle,
  weightText: columnConfig.weight.textStyle,
  restText: columnConfig.rest.textStyle,
  tableCell: {
    flex: 1,
    flexDirection: "row",
  },
  dataText: {
    textAlign: "right",
    fontSize: 1.25 * 14,
  },
  unitLabel: {
    fontSize: 1.25 * 14,
    fontWeight: "300",
    color: twColors.neutral400,
  },
  exerciseTitle: {
    fontSize: 1.5 * 14,
    fontWeight: "bold",
    marginBottom: 0.75 * 14,
  },
});

export { ExerciseCard };
