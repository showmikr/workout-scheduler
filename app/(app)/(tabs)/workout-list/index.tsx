import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "../../../../components/WorkoutCard";
import { useWorkoutsContext } from "../../../../context/workouts-context";
import { Link, Stack } from "expo-router";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { workouts } = useWorkoutsContext();

  return (
    <SafeAreaView className="flex-1 items-center justify-center">
      <FlatList
        className="w-full flex-1"
        data={workouts}
        renderItem={({ item }) => <WorkoutCard workout={item} />}
        keyExtractor={(item) => item.id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
