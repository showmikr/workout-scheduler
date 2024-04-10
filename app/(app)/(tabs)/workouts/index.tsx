import { Pressable, StyleSheet, FlatList, DevSettings } from "react-native";
import { Text, View } from "../../../../components/Themed";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "../../../../components/WorkoutCard";
import { useWorkoutsContext } from "../../../../context/workouts-context";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { workouts } = useWorkoutsContext();

  return (
    <View
      className="flex-1 items-center justify-center" // NATIVEWIND WORKS BABY!!!!!
      //style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <View lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <FlatList
        className="w-full flex-1"
        data={workouts}
        renderItem={({ item }: { item: TaggedWorkout }) => (
          <WorkoutCard workout={item} />
        )}
        keyExtractor={(item: TaggedWorkout) => item.id.toString()}
      />
    </View>
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
