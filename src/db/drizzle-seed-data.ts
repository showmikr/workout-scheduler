import { DrizzleDatabase } from "./drizzle-context";
import { seed } from "drizzle-seed";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";
import { appUser } from "./schema";

async function generateUsers(db: SQLiteDatabase) {
  const drizzleDb = drizzle(db);
  await seed(drizzleDb, { appUser }, { count: 5, seed: 30 });
}

const readTestDb = async (db: DrizzleDatabase) => {
  return await db.select({ firstName: appUser.firstName }).from(appUser);
};

const seedData = { generate: generateUsers, read: readTestDb };

export { seedData };
