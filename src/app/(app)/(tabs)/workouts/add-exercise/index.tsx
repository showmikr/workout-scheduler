import {
  ActivityIndicator,
  Button,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ThemedView, ThemedText } from "@/components/Themed";
import { useExerciseClasses } from "@/hooks/exercises/exercise-classes";
import { useAddExercise } from "@/hooks/exercises/exercises";
import ExerciseClassCard from "@/components/ExerciseClassCard";
import { useState } from "react";
import CustomExerciseClassCard from "@/components/AddExerciseClass";

export default function AddExerciseIndex() {
  const colorScheme = useColorScheme();
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId;
  const workoutTitle = searchParams.workoutTitle;
  if (!workoutId) {
    throw new Error(
      `workoutId or workoutTitle is undefined. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`
    );
  }

  const workoutIdNumber = parseInt(workoutId);
  if (isNaN(workoutIdNumber)) {
    throw new Error(`workoutId is not a number. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`);
  }

  // TODO: handle when query errors out
  const { data: exerciseClasses, isLoading } = useExerciseClasses();
  const addExerciseMutation = useAddExercise(workoutIdNumber);

  const [isModalVisible, setIsModalVisible] = useState(false);

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
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={exerciseClasses}
          contentContainerStyle={{ gap: 1 * 14 }}
          renderItem={({ item }) => (
            <ExerciseClassCard
              title={item.title}
              equipmentId={item.exercise_equipment_id}
              onPress={() => {
                router.navigate({
                  pathname: "/workouts/[workoutId]",
                  params: {
                    workoutId: workoutId,
                    workoutTitle: workoutTitle,
                  },
                });
                addExerciseMutation.mutate({ exerciseClass: item });
              }}
            />
          )}
        />
        <Button
          title="Custom Exercise"
          onPress={() => setIsModalVisible(true)}
        />
      </SafeAreaView>
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
          <TouchableOpacity
            activeOpacity={1}
            style={{
              flexDirection: "row",
            }}
            onPress={(e) => {
              e.preventDefault();
            }}
          >
            <CustomExerciseClassCard
              onCreateExercise={() => {
                setIsModalVisible(false);
              }}
            />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  exerciseLink: {
    paddingBottom: 0.5 * 14,
    paddingTop: 0.5 * 14,
    paddingLeft: 14,
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
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
});
