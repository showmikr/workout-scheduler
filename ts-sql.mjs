/* 
Just run 'node ts-sql.mjs' in your terminal 
to generate typescript definitions for your sqlite database
*/

import sqlts from "@rmp135/sql-ts";
import { writeFileSync, readFileSync, rmSync } from "node:fs";
import sqlite3 from "sqlite3";

const sqliteThree = sqlite3.verbose(); // Allow for longer stack traces on sql errors from sqlite
const dbFilePath = "file:temp.db"; // Not sure why but a file named 'file' is produced after closing connection

const db = new sqliteThree.Database(dbFilePath);
const sqlScript = readFileSync("./workout-scheduler-v2.sql").toString();

// Use regular expression to grab all CREATE TABLE queries from sql script
const queryStrings = sqlScript.match(/CREATE.+?\);/gs);

const config = {
  client: "sqlite3",
  connection: {
    filename: dbFilePath,
  },
  filename: "sqlite-types",
  useNullAsDefault: true,
};

/* 
Creates a new typescript definitions object with
PascalCase table names and camelCase column names for each table
*/
function renameTables(definitions) {
  const toPascalCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);
  const toCamelCase = (word, index) =>
    index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;

  return {
    ...definitions,
    tables: definitions.tables.map((table) => ({
      ...table,
      interfaceName: table.name.split("_").map(toPascalCase).join(""),
      columns: table.columns.map((column) => ({
        ...column,
        propertyName: column.name.split("_").map(toCamelCase).join(""),
      })),
    })),
  };
}

function main() {
  db.serialize(() => {
    for (const query of queryStrings) {
      db.run(query);
    }
    db.all("SELECT day FROM days_of_week;", (err, rows) => {
      if (err) {
        return console.log(err);
      }
      console.log(rows);
      sqlts
        .toObject(config)
        .then((definitions) => {
          const tsTypes = sqlts.fromObject(renameTables(definitions));
          writeFileSync("./sqlite-types.ts", tsTypes);
          console.log("Database types created: sqlite-types.ts");
        })
        .then(() => {
          db.close((err) => {
            if (err) {
              return console.log(err);
            }
            console.log("Closed db");
          });
        })
        .then(() => {
          rmSync("./file"); // Removes the temporary 'file' that gets made after closing the db
          console.log("Deleted temporary db file");
        })
        .catch((reason) => {
          console.log(reason);
          console.log("Couldn't get definitions");
        });
    });
  });
}

main();
