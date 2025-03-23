/**
 * Default configuration for drizzle-kit when using in-app SQLite database.
 */
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "sqlite",
  driver: "expo", // <--- very important, won't work with expo sqlite without it
});
