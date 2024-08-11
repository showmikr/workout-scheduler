import { router, useLocalSearchParams } from "expo-router";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  View,
  LayoutAnimation,
} from "react-native";
import { twColors } from "@/constants/Colors";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemedText, ThemedView } from "@/components/Themed";
import WorkoutHeader from "@/components/WorkoutHeader";
import FloatingAddButton, {
  floatingAddButtonStyles,
} from "@/components/FloatingAddButton";
import { useCallback, useEffect } from "react";
import { ResistanceSection } from "@/utils/exercise-types";
import { useExerciseSections } from "@/hooks/exercises/exercises";

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
      pathname: "/workouts/add-exercise",
      params: { workoutId: workoutId, workoutTitle: workoutTitle },
    });
  }, [workoutId, workoutTitle]);

  return (
    <ThemedView style={styles.rootView}>
      <WorkoutHeader title={workoutTitle} />
      <SafeAreaView style={styles.safeAreaView}>
        {exercises ?
          <ExerciseList workoutId={workoutIdNumber} data={exercises} />
        : <ActivityIndicator
            style={{ alignSelf: "center" }}
            color={twColors.neutral500}
          />
        }
        <FloatingAddButton onPress={onPressFloatingAddBtn} />
      </SafeAreaView>
    </ThemedView>
  );
}

const ExerciseList = ({
  data,
  workoutId,
}: {
  data: ResistanceSection[];
  workoutId: number;
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
        <ThemedView
          style={floatingAddButtonStyles.blankSpaceMargin}
        ></ThemedView>
      }
      data={data}
      keyExtractor={(item) => item.exercise_id.toString()}
      renderItem={({ item }) => (
        <ExerciseCard workoutId={workoutId} exercise={item} />
      )}
    />
  );
};

const styles = StyleSheet.create({
  rootView: {
    flex: 1,
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
    backgroundColor: twColors.neutral950,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 24,
  },
});
