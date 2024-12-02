import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  View,
  LayoutAnimation,
  Text,
  TouchableOpacity,
} from "react-native";
import { figmaColors, twColors } from "@/constants/Colors";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemedText, ThemedView } from "@/components/Themed";
import WorkoutHeader from "@/components/WorkoutHeader";
import FloatingAddButton, {
  floatingAddButtonStyles,
} from "@/components/FloatingAddButton";
import { useCallback, useEffect } from "react";
import { ResistanceSection } from "@/utils/exercise-types";
import { useExerciseSections } from "@/hooks/exercises/exercises";
import {
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";

function OverlaySeparator() {
  return <View style={styles.overlaySeparator} />;
}

export default function ExercisesPage() {
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId;
  const workoutTitle = searchParams.workoutTitle;
  if (!workoutId || !workoutTitle) {
    throw new Error("Workout ID or title not provided. This should not happen");
  }
  const workoutIdNumber = parseInt(workoutId);
  if (isNaN(workoutIdNumber)) {
    throw new Error("Workout ID is not a number. This should not happen");
  }

  const { data: exercises } = useExerciseSections(workoutIdNumber);

  const onPressFloatingAddBtn = useCallback(() => {
    router.push({
      pathname: "/workouts/[workoutId]/add-exercise",
      params: { workoutId: workoutId, workoutTitle: workoutTitle },
    });
  }, [workoutId, workoutTitle]);

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <WorkoutHeader title={workoutTitle} />
      {exercises ?
        <ExerciseList
          workoutId={workoutIdNumber}
          workoutTitle={workoutTitle}
          data={exercises}
        />
      : <ActivityIndicator
          style={{ alignSelf: "center" }}
          color={twColors.neutral500}
        />
      }
      <FloatingAddButton onPress={onPressFloatingAddBtn} />
    </SafeAreaView>
  );
}

const ExerciseList = ({
  data,
  workoutId,
  workoutTitle,
}: {
  data: ResistanceSection[];
  workoutId: number;
  workoutTitle: string;
}) => {
  // Trigger layout animation when list items are added or removed
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [data.length]);

  if (data.length === 0) {
    return (
      <ThemedText
        style={{
          alignSelf: "center",
          fontSize: 1.875 * 14,
          lineHeight: 2.25 * 14,
          color: twColors.neutral500,
        }}
      >
        Wow, much empty...
      </ThemedText>
    );
  }

  return (
    <FlatList
      ItemSeparatorComponent={OverlaySeparator}
      ListFooterComponent={
        <ThemedView style={floatingAddButtonStyles.blankSpaceMargin}>
          <StartWorkoutButton workoutTitle={workoutTitle} exercises={data} />
        </ThemedView>
      }
      data={data}
      keyExtractor={(item) => item.exercise_id.toString()}
      renderItem={({ item }) => (
        <ExerciseCard workoutId={workoutId} exercise={item} />
      )}
    />
  );
};

const StartWorkoutButton = ({
  workoutTitle,
  exercises,
}: {
  workoutTitle: string;
  exercises: ResistanceSection[];
}) => {
  const isActive = useActiveWorkoutStatus();
  const { startWorkout } = useActiveWorkoutActions();

  return (
    <TouchableOpacity
      style={styles.startWorkoutButton}
      activeOpacity={0.6}
      onPress={() => {
        // if there is already an active workout, do nothing
        if (isActive) {
          return;
        }
        // otherwise start the workout
        startWorkout({
          title: workoutTitle,
          exercises: exercises.map((exercise) => ({
            exerciseClass: {
              id: exercise.exercise_class_id,
              title: exercise.title,
            },
            sets: exercise.sets.map((set) => ({
              weight: set.total_weight,
              reps: set.reps,
              targetRest: set.rest_time,
            })),
          })),
        });
        router.push("/active-workout");
      }}
    >
      <Text style={styles.startWorkoutButtonText}>Start Workout</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "stretch",
  },
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
  },
  textxl: {
    fontSize: 1.25 * 14,
    lineHeight: 1.75 * 14,
  },
  overlaySeparator: {
    borderBottomColor: twColors.neutral600,
    borderBottomWidth: 1,
  },
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 24,
  },
  startWorkoutButton: {
    backgroundColor: figmaColors.redAccent,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 16,
  },
  startWorkoutButtonText: {
    color: figmaColors.primaryWhite,
    fontWeight: "bold",
  },
});
