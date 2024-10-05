import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
} from "@/context/active-workout-provider";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../Themed";
import { router } from "expo-router";
import ActiveExerciseCard from "./ActiveExerciseCard";

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
  return (
    <View>
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
    </View>
  );
};

const ActiveWorkoutList = () => {
  const exerciseIds = useActiveWorkoutExerciseIds();
  return (
    <FlatList
      ListHeaderComponent={<ActiveWorkoutHeader />}
      contentContainerStyle={{
        gap: 24,
        paddingHorizontal: 24,
        paddingBottom: 200,
      }}
      initialNumToRender={3} // This vastly improves loading performance when there are many exercises
      data={exerciseIds}
      keyExtractor={(a) => a.toString()}
      renderItem={({ item: id }) => <ActiveExerciseCard exerciseId={id} />}
    />
  );
};

export default ActiveWorkoutList;
