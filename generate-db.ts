import Database from "better-sqlite3";
import { readFileSync } from "fs";
import * as dotenv from "dotenv";

function createDb() {
  dotenv.config({ path: ".env.local" });
  const filePath = process.env.DB_FILE_NAME;
  if (!filePath) {
    console.error(
      "Couldn't find DB_FILE_PATH variable specified in .env.local file. Make sure to include a DB_FILE_PATH var"
    );
    return;
  }
  const db = new Database(":memory:", { verbose: console.log });
  const sqlScript = readFileSync("./src/assets/wo-scheduler-v3.sql").toString();
  db.exec(sqlScript)
    .backup(filePath)
    .finally(() => {
      db.close();
      console.log("finished saving db to local file: %s", filePath);
    });
}

createDb();
