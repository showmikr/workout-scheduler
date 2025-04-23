import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";
import { createContext, useContext } from "react";

const DrizzleContext = createContext<ReturnType<typeof drizzle> | null>(null);

const DrizzleProvider = ({ children }: { children?: React.ReactNode }) => {
  const db = useSQLiteContext();
  const dbFilePath = db.databasePath;
  if (!dbFilePath || dbFilePath.length === 0) {
    throw new Error(
      "useDrizzle must be used within a DrizzleProvider or maybe the database path may also be be null"
    );
  }
  const drizzleDb = drizzle(db);
  return (
    <DrizzleContext.Provider value={drizzleDb}>
      {children}
    </DrizzleContext.Provider>
  );
};

const useDrizzle = () => {
  const drizzleDb = useContext(DrizzleContext);
  return drizzleDb as Exclude<typeof drizzleDb, null>; // We can safely assume drizzleDb is not null here since we check if it's null in the context provider
};

export { DrizzleProvider, useDrizzle };
