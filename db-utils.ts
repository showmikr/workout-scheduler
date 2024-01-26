import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite/next";
import { giantSqlString } from "./giant-sql-string";
import { Asset } from "expo-asset";

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

function initDB() {
  console.log("initDB");
  Asset.fromModule(require("./workout-scheduler-v2.sql"))
    .downloadAsync()
    .then((asset) => asset.localUri)
    .then((fileUrl) =>
      fileUrl ? FileSystem.readAsStringAsync(fileUrl) : "null"
    )
    .then((str) => console.log(str));
}

export { openDB, doesLocalDbExist, deleteDB };
