import { StyleSheet, TextStyle, View } from "react-native";
import { twColors } from "@/constants/Colors";
import { ResistanceSection } from "@/utils/exercise-types";
import { ThemedText } from "@/components/Themed";
import { TableRow } from "@/components/Table";
import {
  Gesture,
  GestureDetector,
  Swipeable,
} from "react-native-gesture-handler";
import { router } from "expo-router";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { CardOptionsUnderlay } from "./CardUnderlay";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import { deleteExercise } from "@/utils/query-exercises";

type ExerciseCardProps = {
  workoutId: string;
  exercise: ResistanceSection;
};

const ExerciseContentContainer = ({ exercise }: ExerciseCardProps) => {
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
  workoutId: string;
  children: React.ReactElement;
}) {
  const animatedOpacity = useSharedValue(1);
  const colorTransitionProgress = useSharedValue(0);
  const animStyles = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
      backgroundColor: interpolateColor(
        colorTransitionProgress.value,
        [0, 1],
        // initial backgroundColor = twColors.neutral950
        ["rgb(10, 10, 10)", "rgb(32, 32, 32)"]
      ),
    };
  });
  const onPressHandler = () => {
    router.push({
      pathname: "workouts/[workoutId]/[exerciseId]",
      params: {
        workoutId: workoutId,
        exerciseId: exercise.exercise_id,
        title: exercise.title,
      },
    });
  };
  const gesture = Gesture.Tap()
    .maxDeltaX(10)
    .onStart(() => {
      animatedOpacity.value = withSequence(
        withTiming(0.7, { duration: 75 }),
        withTiming(1, { duration: 125 })
      );
      colorTransitionProgress.value = withSequence(
        withTiming(1, { duration: 75 }),
        withTiming(0, { duration: 125 })
      );
    })
    .onEnd(() => {
      runOnJS(onPressHandler)();
    });
  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[animStyles]}>{children}</Animated.View>
    </GestureDetector>
  );
}

const ExerciseCard = ({ workoutId, exercise }: ExerciseCardProps) => {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: ({
      db,
      exerciseId,
    }: {
      db: SQLiteDatabase;
      exerciseId: number;
    }) => deleteExercise(db, exerciseId),
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-stats", workoutId],
      });
    },
  });
  return (
    <Swipeable
      renderRightActions={(_progress, dragX) => (
        <CardOptionsUnderlay
          dragX={dragX}
          onPress={() =>
            deleteMutation.mutate({ db, exerciseId: exercise.exercise_id })
          }
        />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
    >
      <ExercisePressableContainer workoutId={workoutId} exercise={exercise}>
        <ExerciseContentContainer workoutId={workoutId} exercise={exercise} />
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
