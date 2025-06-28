/**
 * This script is used to update the SQLite database schema for the workout app
 * during development BEFORE the app is released. The way this script works is by
 * removing the old SQL migration files and creating new ones from scratch based
 * on the drizzle `schema.ts` file in your codebase. So, anytime you change the
 * schema in the `schema.ts` file, you can run this script to automatically update
 * the SQL migration files that need to run on the app's first start.
 *
 * To run the script, use the following command:
 * `node update-schema.mjs`
 */

import { execSync } from "node:child_process";
import { readFileSync, rmSync, appendFileSync } from "node:fs";

function main() {
  const seedDataName = "seed_data";
  const seedDataMigrationFileName = `./drizzle/0001_${seedDataName}.sql`;
  const drizzleConfigFileName = "./drizzle.config.ts";

  try {
    const seedDataText = readFileSync(seedDataMigrationFileName, "utf-8");
    rmSync("./drizzle", { recursive: true });
    execSync(
      `npx drizzle-kit generate --name=black_mac_gargan --config=${drizzleConfigFileName}`
    );
    execSync(
      `npx drizzle-kit generate --custom --name=${seedDataName} --config=${drizzleConfigFileName}`
    );
    appendFileSync(seedDataMigrationFileName, "\n");
    appendFileSync(seedDataMigrationFileName, seedDataText);
    console.log("Drizzle schema update and migrations files created");
  } catch (error) {
    console.error("Error updating schema:", error);
  }
}

main();
