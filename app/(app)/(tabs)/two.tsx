import { Pressable, Button, StyleSheet } from "react-native";
import EditScreenInfo from "../../../components/EditScreenInfo";
import { Text, View } from "../../../components/Themed";
import { deleteDB } from "../../../db-utils";
import { DaysOfWeek } from "../../../sqlite-types";
import { useSQLiteContext } from "expo-sqlite/next";

export default function TabTwoScreen() {
  const db = useSQLiteContext();
  const readDB = () => {
    console.log("Reading from DB");
    db.getAllAsync<DaysOfWeek>("select day from days_of_week", null)
      .then((daysOfWeeksArray) => {
        daysOfWeeksArray.forEach((dayObj) => {
          console.log(dayObj.day);
        });
      })
      .catch((err) => {
        console.log(err);
      });
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
        onPress={() => readDB()}
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
