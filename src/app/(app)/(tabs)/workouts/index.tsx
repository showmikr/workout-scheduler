import { StyleSheet, FlatList } from "react-native";
import WorkoutCard from "@/components/WorkoutCard";
import { useWorkouts } from "@/hooks/workout-ids";
import { ThemedView, ThemedText } from "@/components/Themed";
import { twColors } from "@/constants/Colors";

export default function TabTwoScreen() {
  const { data: workouts } = useWorkouts();

  if (!workouts) {
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
      renderItem={({ item }) => <WorkoutCard workout={item} />}
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
