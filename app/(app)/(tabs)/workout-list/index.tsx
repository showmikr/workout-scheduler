import { StyleSheet, FlatList, SafeAreaView } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "../../../../components/WorkoutCard";
import { Link, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getWorkoutsAsync } from "../../../../context/query-workouts";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { data: workouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => getWorkoutsAsync(db),
  });

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
