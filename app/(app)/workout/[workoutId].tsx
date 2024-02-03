import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { Text, SafeAreaView, View } from "react-native";
import type { Exercise } from "../../../sqlite-types";

export default function WorkoutDetails() {
  const { workoutId } = useLocalSearchParams<{ workoutId: string }>();
  const db = useSQLiteContext();
  const exercises = db.getAllSync<Exercise>(
    "SELECT * FROM exercise WHERE workout_id = ?",
    workoutId
  );
  return (
    <SafeAreaView className="flex-1 justify-center">
      <View className="items-center pb-8 pt-4">
        <Text className="dark:text-white text-3xl">
          Workout Id: {workoutId}
        </Text>
        <Text className="dark:text-white text-3xl">Exercise List</Text>
      </View>
      <View className="flex-1 pl-4">
        {exercises.map((ex) => {
          return (
            <Text key={ex.id} className="dark:text-white text-2xl">
              {ex.title}
            </Text>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
