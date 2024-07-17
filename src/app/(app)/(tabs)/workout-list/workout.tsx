import { router, useLocalSearchParams } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite";
import {
  SafeAreaView,
  View,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { twColors } from "@/constants/Colors";
import { ExerciseCard, exerciseStyles } from "@/components/ExerciseCard";
import { ExerciseSection } from "@/utils/exercise-types";
import { Text } from "@/components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
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
import { deleteExercise, getExerciseSections } from "@/utils/query-exercises";
import WorkoutHeader from "@/components/WorkoutHeader";

type WorkoutItem = ExerciseSection & { key: string };

const AddExerciseBtn = ({
  workoutId,
  workoutTitle,
}: {
  workoutId: string;
  workoutTitle: string;
}) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        position: "absolute",
        right: 3 * 14,
        bottom: 2 * 14,
        alignItems: "center",
        justifyContent: "center",
        height: 4 * 14,
        width: 4 * 14,
        borderRadius: 3 * 14 * 0.8,
        borderWidth: 1,
        borderColor: twColors.neutral800,
        opacity: pressed ? 0.7 : 1,
        backgroundColor: twColors.neutral400,
      })}
      onPress={() => {
        router.push({
          pathname: "/(app)/(tabs)/workout-list/add-exercise/",
          params: { workoutId: workoutId, workoutTitle: workoutTitle },
        });
      }}
    >
      <MaterialIcons
        style={{ fontSize: 3 * 14 }}
        color={twColors.neutral700}
        name="add"
      />
    </Pressable>
  );
};

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
      <Text style={{ color: "white", paddingRight: 20 }}>Delete</Text>
    </TouchableOpacity>
  );
}

function OverlayItem({ workoutId }: { workoutId: string }) {
  const { item, openDirection, close } = useOverlayParams<WorkoutItem>();
  const animatedOpacity = useSharedValue(1);
  const colorTransitionProgress = useSharedValue(0);
  const animStyles = useAnimatedStyle(() => {
    return {
      opacity: animatedOpacity.value,
      backgroundColor: interpolateColor(
        colorTransitionProgress.value,
        [0, 1],
        ["black", "rgb(32, 32, 32)"]
      ),
    };
  });
  const onPressHandler = () => {
    if (openDirection !== "none") {
      close();
      return;
    } else {
      router.push({
        pathname: "/(app)/(tabs)/workout-list/[exerciseId]",
        params: {
          exerciseId: item.exercise.exercise_id,
          workoutId: workoutId,
        },
      });
    }
  };
  const gesture = Gesture.Tap()
    .maxDeltaX(10)
    .onStart(() => {
      if (openDirection !== "none") {
        return;
      }
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
      <Animated.View style={[animStyles, exerciseStyles.exerciseCard]}>
        <ExerciseCard
          workoutId={parseInt(workoutId)}
          exercise={{
            exerciseType: item.exerciseType,
            exerciseId: item.exercise.exercise_id,
            title: item.exercise.title,
            sets: item.data,
          }}
        />
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
    queryFn: () => getExerciseSections(db, workoutId),
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

  if (!sectionData) {
    return (
      <SafeAreaView style={[styles.safeAreaView, { alignItems: "center" }]}>
        <ActivityIndicator color={twColors.neutral500} />
      </SafeAreaView>
    );
  }

  if (sectionData.length === 0) {
    return (
      <SafeAreaView style={styles.emptyView}>
        <Text
          style={{
            fontSize: 1.875 * 14,
            lineHeight: 2.25 * 14,
            color: twColors.neutral500,
          }}
        >
          Wow, much empty...
        </Text>
        <AddExerciseBtn workoutId={workoutId} workoutTitle={workoutTitle} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderTopColor: twColors.neutral700,
              borderTopWidth: StyleSheet.hairlineWidth,
              width: "90%",
              alignSelf: "center",
              backgroundColor: twColors.neutral700,
            }}
          />
        )}
        ListFooterComponent={
          <View style={{ marginTop: 4 * 14, marginBottom: 4 * 14 }}></View>
        }
        ListHeaderComponent={<WorkoutHeader title={workoutTitle} />}
        data={sectionData}
        keyExtractor={(item) => item.exercise.exercise_id.toString()}
        renderItem={({ item }) => (
          <SwipeableItem
            key={item.key}
            item={item}
            renderUnderlayLeft={() => (
              <UnderlayLeft
                onPress={() => {
                  deleteMutation.mutate({
                    db,
                    exerciseId: item.exercise.exercise_id,
                  });
                }}
              />
            )}
            renderOverlay={() => <OverlayItem workoutId={workoutId} />}
            snapPointsLeft={[80]}
            overSwipe={300}
          />
        )}
      />
      <AddExerciseBtn workoutId={workoutId} workoutTitle={workoutTitle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
  },
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 24,
  },
});
