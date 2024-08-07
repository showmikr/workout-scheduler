import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";
import { twColors } from "@/constants/Colors";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useResistanceExerciseIds } from "@/utils/query-exercises";
import WorkoutHeader from "@/components/WorkoutHeader";
import FloatingAddButton, {
  floatingAddButtonStyles,
} from "@/components/FloatingAddButton";

function OverlaySeparator() {
  return <View style={styles.overlaySeparator} />;
}

export default function ExercisesPage() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
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

  const db = useSQLiteContext();
  const { data: exerciseIds } = useResistanceExerciseIds(db, workoutIdNumber);

  const onPressFloatingAddBtn = () => {
    router.push({
      pathname: "/workouts/add-exercise",
      params: { workoutId: workoutId, workoutTitle: workoutTitle },
    });
  };

  if (!exerciseIds) {
    return (
      <ThemedView style={styles.rootView}>
        <SafeAreaView style={[styles.safeAreaView, { alignItems: "center" }]}>
          <ActivityIndicator color={twColors.neutral500} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (exerciseIds.length === 0) {
    return (
      <ThemedView style={styles.rootView}>
        <SafeAreaView style={styles.emptyView}>
          <ThemedText
            style={{
              fontSize: 1.875 * 14,
              lineHeight: 2.25 * 14,
              color: twColors.neutral500,
            }}
          >
            Wow, much empty...
          </ThemedText>
          <FloatingAddButton onPress={onPressFloatingAddBtn} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.rootView}>
      <SafeAreaView style={styles.safeAreaView}>
        <FlatList
          ListHeaderComponent={() => <WorkoutHeader title={workoutTitle} />}
          ItemSeparatorComponent={OverlaySeparator}
          ListFooterComponent={
            <ThemedView
              style={floatingAddButtonStyles.blankSpaceMargin}
            ></ThemedView>
          }
          data={exerciseIds}
          keyExtractor={(item) => item.exercise_id.toString()}
          renderItem={({ item }) => (
            <ExerciseCard
              workoutId={workoutIdNumber}
              exerciseId={item.exercise_id}
            />
          )}
        />
        <FloatingAddButton onPress={onPressFloatingAddBtn} />
      </SafeAreaView>
    </ThemedView>
  );
}

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
