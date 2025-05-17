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
  SectionList,
} from "react-native";
import { figmaColors, twColors } from "@/constants/Colors";
import { ExerciseCard } from "@/components/ExerciseCard";
import { ThemedText, ThemedView } from "@/components/Themed";
import WorkoutHeader from "@/components/WorkoutHeader";
import FloatingAddButton, {
  floatingAddButtonStyles,
} from "@/components/FloatingAddButton";
import { useEffect } from "react";
import { ResistanceSection } from "@/utils/exercise-types";
import {
  IndividualWorkout,
  individualWorkoutKey,
  useExerciseSectionsDrizzle,
} from "@/hooks/workouts/individual-workout";
import {
  useActiveWorkoutActions,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import {
  TemplateExerciseHeader,
  TemplateExerciseSet,
} from "@/components/workout/TemplateExercise";
import { useQueryClient } from "@tanstack/react-query";

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

  const { data: sections, isLoading } =
    useExerciseSectionsDrizzle(workoutIdNumber);

  const onPressFloatingAddBtn = () => {
    router.push({
      pathname: "/workouts/[workoutId]/add-exercise",
      params: { workoutId: workoutId, workoutTitle: workoutTitle },
    });
  };

  if (isLoading || !sections) {
    return (
      <SafeAreaView style={styles.safeAreaView}>
        <ActivityIndicator color={twColors.neutral500} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <WorkoutHeader title={workoutTitle} />
      <SectionList
        sections={sections}
        renderItem={({ item, section }) => (
          <TemplateExerciseSet
            workoutId={workoutIdNumber}
            exerciseId={section.exerciseId}
            setId={item}
          />
        )}
        initialNumToRender={16} // This vastly improves loading performance when there are many exercises
        renderSectionHeader={({ section: { exerciseId } }) => (
          <TemplateExerciseHeader exerciseId={exerciseId} />
        )}
        ListFooterComponent={
          <ThemedView style={floatingAddButtonStyles.blankSpaceMargin}>
            <StartWorkoutButton
              workoutTitle={workoutTitle}
              workoutId={workoutIdNumber}
            />
          </ThemedView>
        }
        stickySectionHeadersEnabled={false}
      />
      {/* // <ExerciseList
          //   workoutId={workoutIdNumber}
          //   workoutTitle={workoutTitle}
          //   exercises={sections}
          // /> */}
      <FloatingAddButton onPress={onPressFloatingAddBtn} />
    </SafeAreaView>
  );
}

// will phase out soon
const ExerciseList = ({
  workoutId,
  workoutTitle,
  exercises,
}: {
  exercises: ResistanceSection[];
  workoutId: number;
  workoutTitle: string;
}) => {
  // Trigger layout animation when list items are added or removed
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [exercises.length]);

  if (exercises.length === 0) {
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
          <StartWorkoutButton
            workoutTitle={workoutTitle}
            workoutId={workoutId}
            exercises={exercises}
          />
        </ThemedView>
      }
      data={exercises}
      keyExtractor={(item) => item.exercise_id.toString()}
      renderItem={({ item }) => (
        <ExerciseCard workoutId={workoutId} exercise={item} />
      )}
    />
  );
};

const StartWorkoutButton = ({
  workoutTitle,
  workoutId,
  // exercises,
}: {
  workoutTitle: string;
  workoutId: number;
  // exercises: ResistanceSection[];
}) => {
  const isActive = useActiveWorkoutStatus();
  const { startWorkout, newStart } = useActiveWorkoutActions();
  const queryClient = useQueryClient();

  return (
    <TouchableOpacity
      style={styles.startWorkoutButton}
      activeOpacity={0.6}
      onPress={() => {
        if (isActive) {
          return;
        }
        const myWorkout = queryClient.getQueryData<IndividualWorkout>(
          individualWorkoutKey(workoutId)
        );
        if (!myWorkout) {
          console.error(
            "We don't have the workout data in the query cache to start the workout!"
          );
          return;
        }
        // otherwise start the workout
        newStart({ workout: myWorkout, title: workoutTitle });
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
