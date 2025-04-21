/**
 * This file is used to generate the schema for the database.
 * It is used by the drizzle-kit package to generate the drizzle schema for the database.
 */
import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
// This is a variable to ensure we specify a file path for reading our sqlite db file
const dbFilePath = process.env.DB_FILE_NAME;
if (!dbFilePath) {
  throw new Error(
    "Failed to read `DB_FILE_NAME` environment variable specified in `.env.local`"
  );
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: dbFilePath, // use whatever file name you've named your local db (on your computer, this ain't for the app itself)
  },
});
