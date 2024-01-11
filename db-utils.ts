import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import sqlite_ddl from "./pgdb-ddl";

const dbName = "pg-sqlite.db";

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
    return SQLite.openDatabase(dbName);
  }

  // otherwise, we need to initialize the db before returning it
  const db = SQLite.openDatabase(
    dbName,
    undefined,
    undefined,
    undefined,
    () => {
      for (const queryString of sqlite_ddl) {
        db.transaction((transaction) => {
          transaction.executeSql(queryString);
        });
      }
    }
  );
  return db;
}

export { openDB, doesLocalDbExist };
