import { drizzle } from "drizzle-orm/expo-sqlite";
import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { SQLiteDatabase } from "expo-sqlite";
import migrations from "drizzle/migrations";
import * as schema from "@/db/schema";

/* deletes the database.
 * We're expecting that there's a sql init script that
 * will be re-run elsewhere on app reload to recreate the db,
 * but that's not this function's responsibility. Should mainly
 * be used in conjunction with reinitializing the db when we change
 * the sql init script. Also, understand that this function should
 * ONLY be used in development mode, NOT for release builds!
 *
 * @returns true if the db was deleted, false if it didn't exist
 */
async function deleteDB(db: SQLiteDatabase): Promise<boolean> {
  try {
    const dbFilePathInfo = await FileSystem.getInfoAsync(db.databasePath);
    const pathSegments = db.databasePath.split("/");
    const dbName = pathSegments[pathSegments.length - 1];

    if (!dbFilePathInfo.exists) {
      console.log(`${db.databasePath} doesn't exist, quitting deletion`);
      return false;
    }

    // Otherwise, delete the db
    await db.closeAsync();
    await SQLite.deleteDatabaseAsync(dbName);
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
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

  const drizzleDb = drizzle(db, { schema });
  await migrate(drizzleDb, migrations);

  console.log(
    "successfully created and initialized w/ all necessary sql migrations"
  );
  console.log(`Created database path: ${db.databasePath}`);
}

export { deleteDB, initDb };
