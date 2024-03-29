import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite/next";

const defaultDatabase = "next-sqlite.db";

async function doesLocalDbExist(dbFileName: string = defaultDatabase) {
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
async function deleteDB(dbFileName: string = defaultDatabase) {
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

export { deleteDB };
