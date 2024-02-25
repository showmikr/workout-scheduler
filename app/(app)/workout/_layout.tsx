import { Asset } from "expo-asset";
import { Stack } from "expo-router";
import { SQLiteDatabase, SQLiteProvider } from "expo-sqlite/next";
import * as FileSystem from "expo-file-system";

export default function WorkoutLayout() {
  return (
    // This provider will be phased out once
    // I get the workout route to support the v3 sql schema
    <SQLiteProvider databaseName="wo-scheduler-v2.db" onInit={initV2Db}>
      <Stack screenOptions={{ headerShown: false }} />
    </SQLiteProvider>
  );
}

// This function will be phased out once
// I get the workout route to support the v3 sql schema
async function initV2Db(db: SQLiteDatabase) {
  const tableInfo = db.getFirstSync<{ table_count: number }>(
    "SELECT COUNT(name) as table_count FROM sqlite_master WHERE type=?",
    ["table"]
  );

  const tableCount = tableInfo ? tableInfo.table_count : 0;

  if (tableCount > 0) {
    return;
  }

  const sqlFile = await Asset.fromModule(
    require("../../../workout-scheduler-v2.sql")
  ).downloadAsync();

  if (!sqlFile.localUri) {
    console.log("workout-scheduler-v2.sql asset was not correctly downloaded");
    return;
  }
  const sqlScript = await FileSystem.readAsStringAsync(sqlFile.localUri);
  db.execSync(sqlScript);
  console.log("db script executed to load workout-scheduler-v2 schema");
}
