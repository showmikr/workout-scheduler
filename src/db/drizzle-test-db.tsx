import { deleteDatabaseAsync } from "expo-sqlite";
import { create } from "zustand";
import { DrizzleDatabase } from "./drizzle-context";

const testDbName = "test.db";

type DrizzleTestDbStore = {
  db: DrizzleDatabase | null;
  isFetching: boolean;
  setFetching: (loading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  hasDbBeenInitialized: boolean;
  setDatabase: (db: DrizzleDatabase | null) => void;
  deleteDb: () => Promise<void>;
};

const useDrizzleTestDbStore = create<DrizzleTestDbStore>()((set, get) => {
  return {
    db: null,
    setDatabase: (inputDb) =>
      set({ db: inputDb, hasDbBeenInitialized: inputDb ? true : false }),
    isFetching: false,
    setFetching: (inputLoading) => set({ isFetching: inputLoading }),
    error: null,
    setError: (inputError) => set({ error: inputError }),
    hasDbBeenInitialized: false,
    deleteDb: async () => {
      const db = get().db;
      const setFetching = get().setFetching;
      try {
        setFetching(true);
        if (!db) {
          throw new Error("db reference is null");
        }
        await db.$client.closeAsync();
        await deleteDatabaseAsync(testDbName);
        get().setDatabase(null);
        console.log(`successfully deleted ${testDbName}`);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    },
  } satisfies DrizzleTestDbStore;
});

const useDrizzleTestDb = () => {
  const db = useDrizzleTestDbStore((state) => state.db);
  if (!db) {
    throw new Error(
      "Drizzle Test DB context is null! Make sure you're using this within a DrizzleTestDbProvider in React Tree"
    );
  }
  return db;
};

const useDeleteDrizzleTestDb = () => {
  return useDrizzleTestDbStore((state) => state.deleteDb);
};

export {
  useDrizzleTestDb,
  useDrizzleTestDbStore,
  useDeleteDrizzleTestDb,
  testDbName,
};
