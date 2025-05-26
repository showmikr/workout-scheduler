import React from "react";
import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutExerciseEntities,
  useActiveWorkoutTitle,
  getLatestActiveWorkoutSnapshot,
  ActiveExercise,
  ActiveSet,
} from "@/context/active-workout-provider";
import {
  StyleSheet,
  Pressable,
  SectionList,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Button,
  LayoutAnimation,
} from "react-native";
import { ThemedText } from "../Themed";
import { router } from "expo-router";
import {
  ActiveSetItem,
  ActiveSetHeader,
  AddSetButton,
} from "../workout/ActiveExerciseCard";
import { LIST_CONTAINER_HORIZONTAL_MARGIN } from "../workout/SharedUI";
import { colorBox, figmaColors } from "@/constants/Colors";
import { useSaveWorkoutSession } from "@/hooks/active-workout";
import { useSQLiteContext } from "expo-sqlite";
import { useAppUserId } from "@/context/app-user-id-provider";
import { useCallback, useEffect, useMemo, useState } from "react";
import CustomAnimatedButton from "@/components/CustomAnimatedButton";
import { calculatePlates } from "../CardUnderlay";

const AddExerciseButton = () => {
  const onPress = () => {
    router.push("/active-workout/add-exercise");
  };

  return (
    <CustomAnimatedButton onPress={onPress} style={styles.addExerciseButton}>
      <ThemedText style={styles.addExerciseText}>Add Exercise</ThemedText>
    </CustomAnimatedButton>
  );
};

const ActiveWorkoutHeader = () => {
  const workoutTitle = useActiveWorkoutTitle();
  const restingSetId = useActiveWorkoutRestingSetId();
  return (
    <View
      style={{
        marginTop: LIST_CONTAINER_HORIZONTAL_MARGIN,
        marginBottom: LIST_CONTAINER_HORIZONTAL_MARGIN * 3,
        marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
      }}
    >
      <ThemedText style={{ flex: 1, fontSize: 32, marginBottom: 16 }}>
        {workoutTitle}
      </ThemedText>
      {restingSetId !== undefined && <RestTimer />}
    </View>
  );
};

const ActiveWorkoutSectionList = () => {
  const inventory = [45, 35, 25, 10, 5, 2.5];
  const plates = calculatePlates(350, inventory);
  const exerciseIds = useActiveWorkoutExerciseIds();
  const exerciseEntities = useActiveWorkoutExerciseEntities();
  const sections = exerciseIds.map((id) => ({
    exerciseId: id,
    exerciseClass: exerciseEntities[id].exerciseClass,
    data: exerciseEntities[id].setIds,
  }));

  console.log("SectionList re-rendered");

  return (
    <SectionList
      ListHeaderComponent={<ActiveWorkoutHeader />}
      ListFooterComponent={<ActiveWorkoutFooter />}
      initialNumToRender={16} // This vastly improves loading performance when there are many exercises
      stickySectionHeadersEnabled={false}
      sections={sections}
      keyExtractor={(setId) => setId.toString()}
      renderItem={({ item: setId, section: { exerciseId } }) => (
        <ActiveSetItem exerciseId={exerciseId} setId={setId} />
      )}
      renderSectionHeader={({ section }) => (
        <ActiveSetHeader exerciseId={section.exerciseId} />
      )}
      renderSectionFooter={({ section }) => (
        <AddSetButton exerciseId={section.exerciseId} />
      )}
    />
  );
};

const ActiveWorkoutFooter = () => {
  const { endAndResetWorkout } = useActiveWorkoutActions();
  const [isModalVisible, setModalVisibility] = useState(false);
  const appUserId = useAppUserId();
  const db = useSQLiteContext();
  const saveWorkoutMutation = useSaveWorkoutSession();
  const saveWorkout = useCallback(() => {
    console.log("Class Dismissed");
    const { exercises, sets, title, workoutStartTime } =
      getLatestActiveWorkoutSnapshot();
    const exerciseEntries: Array<
      [number, { activeExercise: ActiveExercise; activeSets: ActiveSet[] }]
    > = exercises.ids.map((exerciseId) => [
      exerciseId,
      {
        activeExercise: exercises.entities[exerciseId],
        activeSets: exercises.entities[exerciseId].setIds.map(
          (setId) => sets.entities[setId]
        ),
      },
    ]);
    const exerciseMap = new Map(exerciseEntries);
    console.log("workoutStartTime", workoutStartTime);
    const startTimeISO = new Date(workoutStartTime).toISOString();
    const endTimeISO = new Date().toISOString();
    console.log("start", startTimeISO);
    console.log("end", endTimeISO);
    saveWorkoutMutation.mutate({
      db,
      appUserId,
      workoutDetails: {
        title,
        exercises: exerciseMap,
        startTime: startTimeISO,
        endTime: endTimeISO,
      },
    });
  }, [saveWorkoutMutation, db, appUserId]);
  return (
    <>
      <View style={styles.footerView}>
        <Button
          title="Log State"
          onPress={() => {
            console.log(getLatestActiveWorkoutSnapshot());
          }}
        />
        <AddExerciseButton />
        <View style={styles.cancelFinishButtonContainer}>
          <CustomAnimatedButton
            contentContainerStyle={{ flex: 1 }}
            style={styles.cancelWorkoutButton}
            onPress={() => {
              router.back();
              endAndResetWorkout();
            }}
          >
            <ThemedText style={styles.cancelWorkoutText}>Cancel</ThemedText>
          </CustomAnimatedButton>
          <CustomAnimatedButton
            contentContainerStyle={{ flex: 1 }}
            style={styles.finishWorkoutButton}
            onPress={() => {
              setModalVisibility(true);
            }}
          >
            <ThemedText style={styles.finishWorkoutText}>Finish</ThemedText>
          </CustomAnimatedButton>
        </View>
      </View>
      <Modal transparent={true} animationType="slide" visible={isModalVisible}>
        <Pressable
          style={{
            flex: 1,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
          }}
          onPress={() => {
            console.log("Pressed outside modal");
            setModalVisibility(false);
          }}
        >
          <TouchableWithoutFeedback
            onPress={(e) => {
              e.preventDefault();
            }}
            style={{
              flex: 1,
            }}
          >
            <View
              style={{
                flex: 1,
                paddingTop: 36,
                alignItems: "center",
                maxHeight: 360,
                maxWidth: 360,
                marginHorizontal: 16,
                borderRadius: 12,
                backgroundColor: colorBox.stoneGrey800,
                borderTopWidth: 1,
                borderTopColor: colorBox.stoneGrey700,
                paddingHorizontal: 16,
              }}
            >
              <ThemedText
                style={{ fontSize: 32, color: figmaColors.primaryWhite }}
              >
                👍
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 24,
                  color: figmaColors.primaryWhite,
                  fontWeight: 500,
                }}
              >
                Nice Work!
              </ThemedText>
              <TouchableOpacity
                onPress={() => {
                  router.back();
                  saveWorkout();
                  endAndResetWorkout();
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 28,
                  backgroundColor: "#4db8ff",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  Save Workout
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisibility(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 28,
                  backgroundColor: "red",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: 500,
                    color: "white",
                  }}
                >
                  Back
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Pressable>
      </Modal>
    </>
  );
};

const RestTimer = () => {
  const setId = useActiveWorkoutRestingSetId();
  const elapsedRest = useActiveWorkoutRestingTime() ?? 0;
  const targetRest = useActiveWorkoutSetTargetRest(setId ?? 0);
  const remainingRest = targetRest - elapsedRest;
  const minutes = Math.trunc(remainingRest / 60);
  const seconds = remainingRest % 60;
  const minutesText = minutes.toString().padStart(2, "0");
  const secondsText = seconds.toString().padStart(2, "0");
  const output = minutesText + ":" + secondsText;

  if (setId === undefined || elapsedRest === undefined) {
    return null;
  }

  return (
    <View>
      <ThemedText style={{ fontSize: 24 }}>{output}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  addExerciseButton: {
    flex: 1,
    backgroundColor: colorBox.orangeAccent400,
    borderRadius: 20,
    paddingVertical: 6,
  },
  addExerciseText: {
    fontSize: 20,
    fontWeight: 600,
    color: colorBox.orangeAccent1000,
    textAlign: "center",
  },
  footerView: {
    marginTop: 80,
    gap: 32,
    paddingHorizontal: 16,
    marginBottom: 112,
  },
  cancelWorkoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorBox.red400,
    paddingVertical: 6,
    borderRadius: 20,
  },
  cancelWorkoutText: {
    fontSize: 20,
    fontWeight: 600,
    textAlign: "center",
    color: colorBox.red1000,
  },
  finishWorkoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorBox.blue400,
    paddingVertical: 6,
    borderRadius: 20,
  },
  finishWorkoutText: {
    fontSize: 22,
    textAlign: "center",
    fontWeight: 500,
    color: colorBox.blue1000,
  },
  cancelFinishButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
});

export default ActiveWorkoutSectionList;
