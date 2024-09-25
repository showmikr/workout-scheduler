import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
} from "@/context/active-workout-provider";
import { FlatList, TouchableOpacity, View } from "react-native";
import { ThemedText } from "../Themed";
import { router, useRouter } from "expo-router";
import ActiveExerciseCard from "./ActiveExerciseCard";

const AddExerciseButton = () => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={{ marginVertical: 20 }}
      onPress={() => {
        router.push("/add-exercise");
      }}
    >
      <ThemedText style={{ fontSize: 28 }}>Add Exercise</ThemedText>
    </TouchableOpacity>
  );
};

const ActiveWorkoutList = () => {
  const { cancelWorkout } = useActiveWorkoutActions();
  const exerciseIds = useActiveWorkoutExerciseIds();
  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          <ThemedText>Active Workout</ThemedText>
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
      )}
      contentContainerStyle={{
        gap: 24,
        paddingHorizontal: 24,
        paddingBottom: 200,
      }}
      data={exerciseIds}
      keyExtractor={(a) => a.toString()}
      renderItem={({ item }) => <ActiveExerciseCard exerciseId={item} />}
    />
  );
};

export default ActiveWorkoutList;
