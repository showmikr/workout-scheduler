import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite/next";
import { giantSqlString } from "./giant-sql-string";

const dbName = "next-sqlite.db";

async function doesLocalDbExist() {
  const dbExists = (
    await FileSystem.getInfoAsync(
      FileSystem.documentDirectory + "SQLite/" + dbName
    )
  ).exists;
  return dbExists;
}

// function for opening sqlite version of our postgresDB
async function openDB() {
  if (await doesLocalDbExist()) {
    return SQLite.openDatabaseAsync(dbName);
  }

  // Otherwise, initialize db with create and sample insert statments and then return db connection
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.execAsync(giantSqlString);
  return db;
}

async function deleteDB() {
  const dbExists = await doesLocalDbExist();
  if (!dbExists) {
    console.log("db doesn't exist, quitting deletion");
    return;
  }
  // Otherwise, delete the db
  const db = await SQLite.openDatabaseAsync(dbName);
  await db.closeAsync();
  await SQLite.deleteDatabaseAsync(dbName);
  console.log(`${dbName} successfully deleted`);
}

export { openDB, doesLocalDbExist, deleteDB };
