import { deleteDatabaseAsync, openDatabaseAsync } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import migrations from "drizzle/migrations";
import * as schema from "@/db/schema";
import { create } from "zustand";
import { DrizzleDatabase } from "./drizzle-context";
import { ActivityIndicator, SafeAreaView } from "react-native";
import { useEffect } from "react";

const testDbName = "test.db";

type DrizzleTestDbStore = {
  db: DrizzleDatabase | null;
  isFetching: boolean;
  setFetching: (loading: boolean) => void;
  error: Error | null;
  setError: (error: Error | null) => void;
  setDatabase: (db: DrizzleDatabase | null) => void;
  deleteDb: () => Promise<void>;
};

const useDrizzleTestDbStore = create<DrizzleTestDbStore>()((set, get) => {
  return {
    db: null,
    setDatabase: (inputDb) => set({ db: inputDb }),
    isFetching: false,
    setFetching: (inputLoading) => set({ isFetching: inputLoading }),
    error: null,
    setError: (inputError) => set({ error: inputError }),
    deleteDb: async () => {
      const db = get().db;
      const setFetching = get().setFetching;
      try {
        setFetching(true);
        if (!db) {
          throw new Error("db is null");
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

const LoadingSpinnerScreen = () => {
  return (
    <SafeAreaView
      style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
    >
      <ActivityIndicator />
    </SafeAreaView>
  );
};

const DrizzleTestDbProvider = (props: React.PropsWithChildren) => {
  const { db, setDatabase, isFetching, setFetching, setError } =
    useDrizzleTestDbStore();

  const garbageCollect = async () => {
    try {
      await db?.$client.closeAsync();
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (db) {
      console.log("db already exists, skipping init");
      return;
    }
    setFetching(true);
    openDatabaseAsync(testDbName)
      .then((expoDb) => {
        const drizzleTestDb = drizzle(expoDb, { schema });
        setDatabase(drizzleTestDb);
        console.log("opened test db");
      })
      .catch((err) => {
        setError(err);
        console.error(err);
      })
      .finally(() => {
        setFetching(false);
      });

    return () => {
      garbageCollect();
    };
  }, []);

  return !db || isFetching ? <LoadingSpinnerScreen /> : props.children;
};

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

export { DrizzleTestDbProvider, useDrizzleTestDb, useDeleteDrizzleTestDb };
