/**
Just run 'node sql-typegen.mjs' in your terminal
to generate typescript definitions for your sqlite database
*/

/**
 * At this point this file has no purpose, I've long
 * since deleted the `sql-ts` dependency that does the db
 * interospection. I'm keeping this file b/c I have paranoia
 * that it may be useful in the future, but I'm most likely going
 * to delete it.
 */

import sqlts from "@rmp135/sql-ts"; // I've uninstalled sql-ts! This file won't even run you dummy!
import { writeFileSync, readFileSync, rmSync } from "node:fs";
import sqlite3 from "sqlite3";

const sqliteThree = sqlite3.verbose(); // Allow for longer stack traces on sql errors from sqlite
const dbFilePath = "file:temp.db"; // Not sure why but a file named 'file' is produced after closing connection

const db = new sqliteThree.Database(dbFilePath);
const sqlScript = readFileSync("./assets/wo-scheduler-v3.sql").toString();

// Use regular expression to grab all CREATE TABLE queries from sql script
const queryStrings = sqlScript.match(/CREATE TABLE.+?\);/gs);
console.log(queryStrings);

const config = {
  client: "sqlite3",
  connection: {
    filename: dbFilePath,
  },
  filename: "sqlite-types",
  useNullAsDefault: true,
  typeMap: {
    number: ["bigint"],
  },
};

/* 
Creates a new typescript definitions object with
PascalCase table names and leaves column_names unchanged
*/
function renameTables(definitions) {
  const toPascalCase = (word) => word.charAt(0).toUpperCase() + word.slice(1);

  return {
    ...definitions,
    tables: definitions.tables.map((table) => ({
      ...table,
      interfaceName: table.name.split("_").map(toPascalCase).join(""),
    })),
  };
}

function main() {
  db.serialize(() => {
    for (const query of queryStrings) {
      db.run(query);
    }
    db.all(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';",
      (err, rows) => {
        if (err) {
          return console.log(err);
        }
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
      }
    );
  });
}

main();
