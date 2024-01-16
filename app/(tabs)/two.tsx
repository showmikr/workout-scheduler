import { Pressable, Button, StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import sqlite_ddl from "../../pgdb-ddl";
import { openDB, doesLocalDbExist } from "../../db-utils";

export default function TabTwoScreen() {
  const readDB = () => {
    openDB().then((db) => {
      console.log("Reading from DB");
      db.transaction(
        (transaction) => {
          transaction.executeSql(
            "select day from days_of_week",
            undefined,
            (_trx, rs) => {
              for (const row of rs.rows._array) {
                console.log(row.day);
              }
            }
          );
        },
        (err) => {
          console.log(err);
        }
      );
    });
  };

  const deleteDB = () => {
    doesLocalDbExist().then((dbExists) => {
      if (!dbExists) {
        console.log("db doesn't exist, quitting deletion");
        return;
      }
      openDB().then((db) => {
        db.closeAsync();
        db.deleteAsync();
        console.log("DB deleted successfully");
      });
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
