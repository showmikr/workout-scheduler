import { StyleSheet, View, FlatList } from "react-native";
import WorkoutCard from "@/components/WorkoutCard";
import { useWorkouts } from "@/hooks/workouts/workout-ids";
import { ThemedView, ThemedText } from "@/components/Themed";
import { useWorkoutStats } from "@/hooks/workouts/workout-section";
import { Workout } from "@/utils/exercise-types";

/**
 * Reason this exists is to prevent a React rendering warning for react native reanimated.
 * Turns out using any `useQuery` hook (even indirectly) to acess data asynchronously
 * in a Swipeable is not strictly legal (and causes a warning) in react-native-reanimated
 * saying, 'trying to access reanimated value while rendering' which is a load of bs.
 * I introduced this wrapper to do the data fetching of the workout stats and pass that to
 * the real WorkoutCard as props. It works and gets rid of the warning, don't ask me why
 * @param props Workout: {id: number, title: string}
 * @returns Wrapper Component for a workout card
 */
const WorkoutCardWrapper = (props: { workout: Workout }) => {
  const { data: workoutStats } = useWorkoutStats(props.workout.id);
  if (!workoutStats) {
    return null;
  }
  return <WorkoutCard workout={props.workout} workoutStats={workoutStats} />;
};

const LineSeparator = () => <View style={styles.lineSeparator} />;

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
      renderItem={({ item }) => <WorkoutCardWrapper workout={item} />}
      keyExtractor={(item) => item.id.toString()}
      ItemSeparatorComponent={LineSeparator}
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
  },
  lineSeparator: {
    marginHorizontal: 16,
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#3D3D3D",
  },
});
