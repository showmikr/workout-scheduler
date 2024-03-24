import {
  Pressable,
  Button,
  StyleSheet,
  FlatList,
  DevSettings,
} from "react-native";
import { Text, View } from "../../../../components/Themed";
import { deleteDB } from "../../../../db-utils";
import { useSQLiteContext } from "expo-sqlite/next";
import WorkoutCard from "../../../../components/WorkoutCard";
import { Link, Tabs } from "expo-router";

export type TaggedWorkout = { id: number; title: string; tags: string[] };

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const getWorkouts = () => {
    const workout_tags = db.getAllSync<any>(
      `
      SELECT wk.id, wk.title as wk_title, wkt.title FROM workout AS wk
      LEFT JOIN link_tag_workout AS ltw ON ltw.workout_id = wk.id
      LEFT JOIN workout_tag AS wkt ON ltw.workout_tag_id = wkt.id
      WHERE wk.app_user_id = 1 AND wk.training_day_id IS NULL
      ORDER BY wk.id;
      `,
      null
    );
    const taggedWorkouts: TaggedWorkout[] = workout_tags
      .reduce((prev: any[], curr) => {
        const p = prev;
        if (p.length < 1 || p.at(-1).at(-1).id !== curr.id) {
          p.push([curr]);
        } else {
          p.at(-1).push(curr);
        }
        return p;
      }, [])
      .map((group: any[]) => ({
        id: group.at(0).id,
        title: group.at(0).wk_title,
        tags: group.reduce((tagList, wo) => {
          if (wo.title) {
            tagList.push(wo.title);
          }
          return tagList;
        }, []),
      }));
    return taggedWorkouts;
  };

  const workouts = getWorkouts();

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
      <Tabs.Screen
        options={{
          headerRight: () => {
            return (
              <Link
                style={{ color: "rgb(10, 132, 255)", fontSize: 18, padding: 8 }}
                href="/new-workout-modal"
              >
                New Workout
              </Link>
            );
          },
        }}
      />
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
