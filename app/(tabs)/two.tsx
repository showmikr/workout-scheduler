import { StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { Asset } from "expo-asset";

// function for opening sample database
// sqlite database on mobile disk is called sample.db while database in codebase is called test-db.db
async function openDatabase() {
  if (
    !(
      await FileSystem.getInfoAsync(
        FileSystem.documentDirectory + "SQLite/sample.db"
      )
    ).exists
  ) {
    await FileSystem.makeDirectoryAsync(
      FileSystem.documentDirectory + "SQLite"
    );
  } else {
    return SQLite.openDatabase("sample.db");
  }
  console.log(Asset.fromModule(require("../../assets/sqlite/test-db.db")).uri);
  await FileSystem.downloadAsync(
    Asset.fromModule(require("../../assets/sqlite/test-db.db")).uri,
    FileSystem.documentDirectory + "SQLite/sample.db"
  );
  return SQLite.openDatabase("sample.db");
}

export default function TabTwoScreen() {
  // Console log database contents on render of tab two
  openDatabase().then((db) => {
    db.transaction(
      (rtx) => {
        rtx.executeSql("SELECT * FROM exercise", undefined, (_, rs) => {
          console.log("Database Contents:");
          for (const { muscle_group, title } of rs.rows._array) {
            console.log(title + ", " + muscle_group);
          }
        }),
          null,
          () => {
            console.log("Hooray!");
          };
      },
      (err) => {
        console.log(err);
      },
      () => {
        console.log("transaction successful");
      }
    );
  });

  return (
    <View
      className="flex-1 items-center justify-center" // NATIVEWIND WORKS BABY!!!!!
      //style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <Text style={styles.title}>Tab Two</Text>
      <Text className="text-xl/10 font-bold underline">Exercises</Text>
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
