import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView, ThemedText } from "@/components/Themed";
import {
  useAddExerciseClass,
  useExerciseClasses,
} from "@/hooks/exercises/exercise-classes";
import { useAddExercise } from "@/hooks/exercises/exercises";
import ExerciseClassCard from "@/components/ExerciseClassCard";
import { useState } from "react";
import AddCustomExerciseCard from "@/components/AddCustomExerciseCard";
import { figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useIsWorkoutInProgress,
} from "@/context/active-workout-provider";
import { ExerciseClass } from "@/utils/exercise-types";

export default function AddExerciseIndex() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();

  const workoutId = searchParams.workoutId;
  const workoutTitle = searchParams.workoutTitle;
  const workoutIdNumber = parseInt(workoutId);
  const isWorkoutInProgress = useIsWorkoutInProgress();
  if (!isWorkoutInProgress) {
    if (!workoutId) {
      throw new Error(
        `workoutId or workoutTitle is undefined. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`
      );
    }

    if (isNaN(workoutIdNumber)) {
      throw new Error(`workoutId is not a number. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`);
    }
  }

  // TODO: handle when query errors out
  const { data: exerciseClasses, isLoading } = useExerciseClasses();
  const addExerciseMutation = useAddExercise(workoutIdNumber);
  const { mutate: addExerciseClass } = useAddExerciseClass();
  const { addExercise: addActiveExercise } = useActiveWorkoutActions();
  const [isModalVisible, setIsModalVisible] = useState(false);

  // onPress handler when user navigates to this page from the active workout screen
  const onPressAddActiveExercise = (exerciseClass: ExerciseClass) => {
    router.navigate("/active-workout");
    addActiveExercise({ exerciseClass });
  };

  // onPress handler when user navigates to this page from a workout template screen
  const onPressAddTemplateExercise = (exerciseClass: ExerciseClass) => {
    router.navigate({
      pathname: "/workouts/[workoutId]",
      params: {
        workoutId: workoutId,
        workoutTitle: workoutTitle,
      },
    });
    addExerciseMutation.mutate({ exerciseClass });
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingView}>
        <ThemedView style={[styles.loadingView, { flexDirection: "row" }]}>
          <ActivityIndicator style={styles.loadingSpinner} />
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: figmaColors.primaryBlack }}
      >
        <FlatList
          data={exerciseClasses}
          contentContainerStyle={{ gap: 1 * 14 }}
          renderItem={({ item }) => (
            <ExerciseClassCard
              title={item.title}
              equipmentId={item.exercise_equipment_id}
              onPress={() => {
                if (isWorkoutInProgress) {
                  onPressAddActiveExercise(item);
                } else {
                  onPressAddTemplateExercise(item);
                }
              }}
            />
          )}
          ListFooterComponent={
            <View style={styles.footerSection}>
              <ThemedText style={styles.footerHeader}>
                Not finding what you're looking for?
              </ThemedText>
              <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                <ThemedText style={styles.customExerciseBtn}>
                  Add Custom Exercise
                </ThemedText>
              </TouchableOpacity>
            </View>
          }
        />
        <Modal
          animationType="fade"
          visible={isModalVisible}
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 0, 0.8)",
            }}
            onPress={() => {
              setIsModalVisible(false);
              console.log("Pressed outside modal");
            }}
          >
            <AddCustomExerciseCard
              dismissModal={() => setIsModalVisible(false)}
              addExerciseClass={addExerciseClass}
            />
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingText: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: { paddingRight: 14, height: 2.25 * 14 },
  footerSection: {
    marginTop: 16,
    marginBottom: 128,
    alignItems: "center",
    gap: 16,
  },
  footerHeader: { color: figmaColors.greyLighter, fontSize: 16 },
  customExerciseBtn: { color: figmaColors.addGreen, fontSize: 24 },
});
