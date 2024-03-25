import { Pressable, StyleSheet, FlatList, DevSettings } from "react-native";
import { Text, View } from "../../../../components/Themed";
import { deleteDB } from "../../../../db-utils";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "../../../../components/WorkoutCard";
import { useWorkoutsContext } from "../../../../context/workoutsContext";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const { workouts } = useWorkoutsContext();

  const readDb = () => {
    const results = db.getAllSync<any>(
      `
      SELECT title FROM workout WHERE app_user_id = 1
      UNION
      SELECT day FROM days_of_week;
      `,
      null
    );
    console.log(results);
  };

  return (
    <View
      className="flex-1 items-center justify-center" // NATIVEWIND WORKS BABY!!!!!
      //style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={styles.title}>Tab Two</Text>
      <Pressable
        className="m-10 border-2 border-solid border-slate-400 bg-slate-600 p-1"
        onPress={() => {
          deleteDB().then(() => {
            DevSettings.reload();
          });
        }}
      >
        <Text className="text-lg/10">Reinitialize Database</Text>
      </Pressable>
      <Pressable
        className="m-10 border-2 border-solid border-slate-400  bg-slate-600 p-1"
        onPress={() => readDb()}
      >
        <Text className="text-lg/10">Read From DB</Text>
      </Pressable>
      <Text className="-mb-6 text-2xl">Workouts</Text>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
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
