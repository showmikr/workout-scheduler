import { router, useLocalSearchParams } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  View,
} from "react-native";
import { twColors } from "@/constants/Colors";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemedText, ThemedView } from "@/components/Themed";
import SwipeableItem, { useOverlayParams } from "react-native-swipeable-item";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteExercise, getResistanceSections } from "@/utils/query-exercises";
import WorkoutHeader from "@/components/WorkoutHeader";
import FloatingAddButton from "@/components/FloatingAddButton";
import { ResistanceSection } from "@/utils/exercise-types";
import ExerciseSwipeable from "@/components/ExerciseSwipeable";

function UnderlayLeft({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        backgroundColor: "red",
      }}
    >
      <ThemedText style={{ color: "white", paddingRight: 20 }}>
        Delete
      </ThemedText>
    </TouchableOpacity>
  );
}

function OverlaySeparator() {
  return <ThemedView style={styles.overlaySeparator} />;
}

function OverlayItem({
  exercise,
  workoutId,
}: {
  exercise: ResistanceSection;
  workoutId: string;
}) {
  // const { openDirection, close } = useOverlayParams<ResistanceSection>();
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
      <Animated.View style={[animStyles]}>
        <ExerciseCard workoutId={parseInt(workoutId)} exercise={exercise} />
      </Animated.View>
    </GestureDetector>
  );
}

export default function WorkoutDetails() {
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

  const db = useSQLiteContext();
  const queryClient = useQueryClient();

  const { data: sectionData } = useQuery({
    queryKey: ["exercise-sections", workoutId],
    queryFn: () => getResistanceSections(db, workoutId),
    refetchInterval: 3000,
  });

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
    },
  });

  const onPresFloatingAddBtn = () => {
    router.push({
      pathname: "/workouts/add-exercise",
      params: { workoutId: workoutId, workoutTitle: workoutTitle },
    });
  };

  if (!sectionData) {
    return (
      <ThemedView style={styles.rootView}>
        <SafeAreaView style={[styles.safeAreaView, { alignItems: "center" }]}>
          <ActivityIndicator color={twColors.neutral500} />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (sectionData.length === 0) {
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
          <FloatingAddButton onPress={onPresFloatingAddBtn} />
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
            <ThemedView style={{ marginTop: 8 * 14 }}></ThemedView>
          }
          data={sectionData}
          keyExtractor={(item) => item.exercise_id.toString()}
          renderItem={({ item }) => (
            <ExerciseSwipeable
              onDelete={() =>
                deleteMutation.mutate({ db, exerciseId: item.exercise_id })
              }
            >
              <OverlayItem exercise={item} workoutId={workoutId} />
            </ExerciseSwipeable>
          )}
        />
        <FloatingAddButton onPress={onPresFloatingAddBtn} />
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
