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
import { rmSync } from "node:fs";

function main() {
  /**
  Yes, despite this file being in the ./src/db directory,
  b/c we execute this script from the project root directory,
  everything is relative to the project root directory
  */
  const drizzleConfigFileName = "./drizzle.config.ts";

  try {
    rmSync("./drizzle", { recursive: true });
    execSync(
      `npx drizzle-kit generate --name=black_mac_gargan --config=${drizzleConfigFileName}`
    );
    console.log("Drizzle schema update and migrations files created");
  } catch (error) {
    console.error("Error updating schema:", error);
  }
}

main();
