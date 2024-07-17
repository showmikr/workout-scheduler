import { StyleSheet, FlatList, Text, SafeAreaView } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "@/components/WorkoutCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllTagsAsync,
  getWorkoutCount,
  getWorkoutsAsync,
  getWorkoutTagsAsync,
} from "@/utils/query-workouts";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  const { data: workouts } = useQuery({
    queryKey: ["workouts"],
    queryFn: () => getWorkoutsAsync(db),
  });
  const { data: tagMap } = useQuery({
    queryKey: ["all_tags"],
    queryFn: () => getAllTagsAsync(db),
    structuralSharing: false, // Returns a hashmap and structural sharing only works on JSON compatible data
  });
  const { data: workoutTagMap } = useQuery({
    queryKey: ["workout_tag_mappings"],
    queryFn: () => getWorkoutTagsAsync(db),
    structuralSharing: false, // Returns a hashmap and structural sharing only works on JSON compatible data
  });
  queryClient.prefetchQuery({
    queryKey: ["workout_count"],
    queryFn: () => getWorkoutCount(db),
  });

  if (!(workouts && tagMap && workoutTagMap)) {
    return (
      <SafeAreaView style={styles.safeAreaContainer}>
        <Text style={{ color: "#BDBDBD", fontWeight: "bold", fontSize: 22 }}>
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <FlatList
        style={styles.listView}
        data={workouts}
        renderItem={({ item }) => (
          <WorkoutCard
            workout={item}
            tags={
              tagMap && workoutTagMap ?
                [...(workoutTagMap.get(item.id) ?? [])].map(
                  (tagId) => tagMap.get(tagId)!
                )
              : []
            }
          />
        )}
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
  safeAreaContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listView: {
    flex: 1,
    width: "100%",
  },
});
