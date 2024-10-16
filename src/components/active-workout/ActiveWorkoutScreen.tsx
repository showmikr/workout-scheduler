import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutExerciseEntities,
} from "@/context/active-workout-provider";
import { SectionList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../Themed";
import { router } from "expo-router";
import {
  ActiveSetItem,
  ActiveSetHeader,
  AddSetButton,
  LIST_CONTAINER_HORIZONTAL_MARGIN,
} from "./ActiveExerciseCard";

const AddExerciseButton = () => {
  return (
    <TouchableOpacity
      style={{ marginVertical: 20 }}
      onPress={() => {
        router.push("/active-workout/add-exercise");
      }}
    >
      <ThemedText style={{ fontSize: 28 }}>Add Exercise</ThemedText>
    </TouchableOpacity>
  );
};

const ActiveWorkoutHeader = () => {
  const { cancelWorkout } = useActiveWorkoutActions();
  const restingSetId = useActiveWorkoutRestingSetId();
  return (
    <View style={{ marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN }}>
      <ThemedText style={{ fontSize: 24 }}>Active Workout</ThemedText>
      <TouchableOpacity
        onPress={() => {
          router.dismiss();
          cancelWorkout();
        }}
      >
        <ThemedText style={{ fontSize: 24 }}>Cancel Workout</ThemedText>
      </TouchableOpacity>
      <AddExerciseButton />
      {restingSetId !== undefined && <RestTimer />}
    </View>
  );
};

const ActiveWorkoutSectionList = () => {
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
      contentContainerStyle={{
        paddingBottom: 200,
      }}
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

export default ActiveWorkoutSectionList;
