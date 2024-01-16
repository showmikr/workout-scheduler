import * as FileSystem from "expo-file-system";
import * as SQLite from "expo-sqlite";
import { sqlite_ddl, sqlite_dml } from "./pgdb-ddl";

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
      /* 
      At the moment, to make the sample data for app_user and days_of_week
      show up in the tabs, I need to grab the sql ddl and the first 2 insert
      statements from the dml 
      */
      for (const queryString of [...sqlite_ddl, ...sqlite_dml.slice(0, 2)]) {
        db.transaction((transaction) => {
          transaction.executeSql(queryString);
        });
      }
    }
  );
  return db;
}

export { openDB, doesLocalDbExist };
