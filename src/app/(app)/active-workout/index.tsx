import { FlatList, SafeAreaView, StyleSheet, View } from "react-native";
import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutStatus,
} from "@/context/active-workout-provider";
import { ThemedText } from "@/components/Themed";
import { TouchableOpacity } from "react-native-gesture-handler";
import { Redirect, router } from "expo-router";
import ActiveExerciseCard from "./_components/ActiveExerciseCard";

const AddExerciseButton = () => {
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

export default function ActiveWorkoutPage() {
  const isActive = useActiveWorkoutStatus();
  const exerciseIds = useActiveWorkoutExerciseIds();

  if (!isActive) {
    // Return to previous page
    return <Redirect href=".." />;
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <ActiveWorkoutList exerciseIds={exerciseIds} />
    </SafeAreaView>
  );
}

const ActiveWorkoutList = ({ exerciseIds }: { exerciseIds: Array<number> }) => {
  const { cancelWorkout } = useActiveWorkoutActions();
  return (
    <FlatList
      ListHeaderComponent={() => (
        <View>
          <ThemedText>Active Workout</ThemedText>
          <TouchableOpacity
            onPress={() => {
              router.back();
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
      renderItem={(data) => <ActiveExerciseCard exerciseId={data.item} />}
    />
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
});
