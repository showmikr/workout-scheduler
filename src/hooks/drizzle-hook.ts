import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

/**
 * Hook must be used within a child component of an `SQLiteProvider` component.
 * @returns Drizzle database instance
 */
const useDrizzle = () => {
  const expoDb = useSQLiteContext();
  const drizzleDb = drizzle(expoDb);
  return drizzleDb;
};

export { useDrizzle };
