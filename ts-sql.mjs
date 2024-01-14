/* 
Just run 'node ts-sql.mjs' in your terminal 
to generate typescript definitions for your sqlite database
*/

import sqlts from "@rmp135/sql-ts";
import { writeFileSync } from "node:fs";

const config = {
  client: "sqlite3",
  connection: {
    filename: "./ddl.sqlite",
  },
  filename: "sqlite-types",
  useNullAsDefault: true,
};

const tsString = await sqlts.toTypeScript(config);

let definitions = await sqlts.toObject(config);
const column_obj = definitions.tables[0].columns[0];

definitions.tables = definitions.tables.map((table) => {
  const newColumns = table.columns.map((column) => ({
    ...column,
    propertyName: column.name
      .split("_")
      .map((word, index) =>
        index > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word
      )
      .reduce((acc, word) => acc + word, ""),
  }));
  return {
    ...table,
    interfaceName: table.name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .reduce((acc, word) => acc + word, ""),
    columns: newColumns,
  };
});

const tsTypes = sqlts.fromObject(definitions);
writeFileSync("./sqlite-types.ts", tsTypes);
console.log("Database types created: sqlite-types.ts");
