import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite/next";

const defaultDatabase = "next-sqlite.db";

async function doesLocalDbExist(dbFileName: string = defaultDatabase) {
  const dbExists = (
    await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "SQLite/" + defaultDatabase
    )
  ).exists;
  return dbExists;
}

/* Use w/ caution alongside database context.
 * When you delete the databse, the context doesn't reload,
 * so you have to reload the whole app to recreate the database
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
