import { drizzle } from "drizzle-orm/expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { SQLiteDatabase } from "expo-sqlite";
import migrations from "drizzle/migrations";

async function doesLocalDbExist(dbFileName: string) {
  const filePath = FileSystem.documentDirectory + "SQLite/" + dbFileName;
  const fileInfo = await FileSystem.getInfoAsync(filePath);
  return fileInfo.exists;
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
  await db.execAsync("PRAGMA foreign_keys = ON");

  // Enable Write-Ahead Logging (WAL) mode which is more efficient for concurrent reads and writes
  await db.execAsync("PRAGMA journal_mode = WAL");

  const tableInfo = await db.getFirstAsync<{
    table_count: number;
  }>("SELECT COUNT(name) as table_count FROM sqlite_master WHERE type=?", [
    "table",
  ]);
  const tableCount = tableInfo?.table_count ?? 0;

  if (tableCount > 0) {
    console.log(
      `database already exists ${db.databasePath}, skipping migrations`
    );
    return;
  }

  const drizzleDb = drizzle(db);
  await migrate(drizzleDb, migrations);

  console.log(
    `${db.databasePath} successfully created and initialized w/ all necessary sql migrations`
  );
}

export { deleteDB, initDb };
