import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";

async function doesLocalDbExist(dbFileName: string) {
  const dbExists = (
    await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "SQLite/" + dbFileName
    )
  ).exists;
  return dbExists;
}

/* deletes the database.
 * We're expecting that there's a sql init script that
 * will be re-run elsewhere on app reload to recreate the db,
 * but that's not this function's responsibility. Should mainly
 * be used in conjunction with reinitializing the db when we change
 * the sql init script. Also, understand that this function should
 * ONLY be used in development mode, NOT for release builds!
 */
async function deleteDB(dbFileName: string) {
  const dbExists = await doesLocalDbExist(dbFileName);
  if (!dbExists) {
    console.log("db doesn't exist, quitting deletion");
    return;
  }
  // Otherwise, delete the db
  const db = await SQLite.openDatabaseAsync(dbFileName);
  await db.closeAsync();
  await SQLite.deleteDatabaseAsync(dbFileName);
  console.log(`${dbFileName} successfully deleted`);
}

async function initDb(db: SQLiteDatabase) {
  // Ensure Foreign Key constraints are enabled
  // Note: This also enforces cascade deletes
  // Note: added this also b/c app reloads in dev mode caused
  // any mutations to the db that relied on cascade deletes to fail
  // (i.e, deleting an exercise row didn't delete related exercise_sets and resistance_sets)
  // hence why I'm enabling it here so that on reloads, constraints are still enforced
  await db.runAsync("PRAGMA foreign_keys = ON;");

  const tableInfo = await db.getFirstAsync<{ table_count: number }>(
    "SELECT COUNT(name) as table_count FROM sqlite_master WHERE type=?",
    ["table"]
  );

  const tableCount = tableInfo?.table_count ?? 0;

  if (tableCount > 0) {
    return;
  }

  const sqlFile = await Asset.fromModule(
    require("../assets/wo-scheduler-v3.sql")
  ).downloadAsync();

  if (!sqlFile.localUri) {
    console.error("wo-scheduler-v3.sql asset was not correctly downloaded");
    return;
  }
  const sqlScript = await FileSystem.readAsStringAsync(sqlFile.localUri);
  await db.execAsync(sqlScript);
  console.log(
    "%s successfully created and initialized w/ wo-scheduler-v3 schema",
    db.databasePath
  );
}

export { deleteDB, initDb };
