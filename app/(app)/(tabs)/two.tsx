import { Pressable, Button, StyleSheet } from "react-native";
import EditScreenInfo from "../../../components/EditScreenInfo";
import { Text, View } from "../../../components/Themed";
import { deleteDB } from "../../../db-utils";
import { useSQLiteContext } from "expo-sqlite/next";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const getWorkouts = () => {
    const workout_tags = db.getAllSync<any>(
      `
      SELECT wk.id, wk.title as wk_title, wkt.title FROM workout AS wk
      LEFT JOIN link_tag_workout AS ltw ON ltw.workout_id = wk.id
      LEFT JOIN workout_tag AS wkt ON ltw.workout_tag_id = wkt.id
      WHERE wk.app_user_id = 1
      ORDER BY wk.id;
      `,
      null
    );
    type TaggedWorkout = { id: number; title: string; tags: string[] };
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
    taggedWorkouts.forEach((tw) => console.log(tw));
  };

  return (
    <View
      className="flex-1 items-center justify-center" // NATIVEWIND WORKS BABY!!!!!
      //style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={styles.title}>Tab Two</Text>
      <Pressable
        className="m-10 p-1 bg-slate-600 border-solid border-2 border-slate-400 active:opacity-50"
        onPress={() => deleteDB()}
      >
        <Text className="text-lg/10">Delete Database</Text>
      </Pressable>
      <Pressable
        className="p-1 bg-slate-600 border-solid border-2 border-slate-400 active:opacity-50"
        onPress={() => getWorkouts()}
      >
        <Text className="text-lg/10">Read From Database</Text>
      </Pressable>
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/two.tsx" />
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
