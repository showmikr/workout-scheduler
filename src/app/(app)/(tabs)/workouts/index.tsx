import { StyleSheet, FlatList } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "@/components/WorkoutCard";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllTagsAsync,
  getWorkoutCount,
  getWorkoutsAsync,
  getWorkoutTagsAsync,
} from "@/utils/query-workouts";
import { ThemedView, ThemedText } from "@/components/Themed";
import { twColors } from "@/constants/Colors";

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
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={{ fontWeight: "bold", fontSize: 22 }}>
          Loading...
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <FlatList
      style={styles.listView}
      contentContainerStyle={{ justifyContent: "center" }}
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
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  listView: {
    flex: 1,
    width: "100%",
    backgroundColor: twColors.neutral950,
  },
});
