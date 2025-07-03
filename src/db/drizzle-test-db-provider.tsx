import { ActivityIndicator, Button, SafeAreaView, View } from "react-native";
import { testDbName, useDrizzleTestDbStore } from "./drizzle-test-db";
import { useEffect } from "react";
import { openDatabaseAsync, SQLiteDatabase } from "expo-sqlite";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { migrate } from "drizzle-orm/expo-sqlite/migrator";
import { generateSeedData } from "./drizzle-seed-data";
import * as schema from "@/db/schema";
import migrations from "drizzle/migrations";
import { ThemedText } from "@/components/Themed";
import { useSession } from "@/context/session-provider";

/**
 * Checks if a db needs migrations if it's just been newly created.
 * We do this check by counting the number of tables in the db.
 * If the count is 0, then we know that the db was just created and needs migrations.
 * Otherwise, we assume that the db already existed and doesn't need migrations.
 *
 * @param db the database to run migrations on
 * @returns true if the db was just created and hence needs migrations, false if it already existed
 */
const isDbInitNecessary = async (
  db: SQLiteDatabase
): Promise<
  { isNecessary: true; db: SQLiteDatabase } | { isNecessary: false; db: null }
> => {
  try {
    // First, we ensure migrations are only run once
    // And we do that by checking the db table count
    const tableInfo = await db.getFirstAsync<{
      table_count: number;
    }>("SELECT COUNT(name) as table_count FROM sqlite_master WHERE type=?", [
      "table",
    ]);
    const tableCount = tableInfo?.table_count ?? 0;
    if (tableCount > 0) {
      console.log(`${testDbName} already exists, skipping migrations`);
      return { isNecessary: false, db: null };
    }
    return { isNecessary: true, db: db };
  } catch (err) {
    console.error(err);
    return { isNecessary: false, db: null };
  }
};

const onInit = async (db: SQLiteDatabase) => {
  try {
    // Otherwise, we can run migrations
    // this migration only runs the first migration SQL script to setup the tables,
    // that way we can use drizzle-seed to seed our own data
    const drizzleDb = drizzle(db, { schema });
    const { journal: myJournal, migrations: myMigrations } = migrations;
    await migrate(drizzleDb, {
      journal: { ...myJournal, entries: [myJournal.entries[0]] },
      migrations: { m0000: myMigrations.m0000 },
    });
    await generateSeedData(drizzleDb);
  } catch (err) {
    console.error(err);
  }
};

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
  const {
    db,
    setDatabase,
    hasDbBeenInitialized,
    isFetching,
    setFetching,
    error,
    setError,
  } = useDrizzleTestDbStore();

  const { signOut } = useSession();

  useEffect(() => {
    if (error) {
      return;
    }
    if (hasDbBeenInitialized) {
      return;
    }
    setFetching(true);
    openDatabaseAsync(testDbName)
      .then((expoDb) => {
        const drizzleTestDb = drizzle(expoDb, { schema });
        setDatabase(drizzleTestDb);
        return expoDb;
      })
      .then(isDbInitNecessary)
      .then(({ isNecessary, db }) => {
        if (isNecessary) {
          onInit(db);
        }
      })
      .catch((err) => {
        setError(err);
        console.error(err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  if (error) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <ThemedText
          style={{
            textAlign: "center",
            fontSize: 24,
            marginBottom: 24,
          }}
        >
          Error opening drizzle test db:
        </ThemedText>
        <ThemedText style={{ fontSize: 16 }}>Nope</ThemedText>
        <View
          style={{
            marginTop: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Button
            title="go back"
            onPress={() => {
              setError(null);
              signOut();
            }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return !db || isFetching ? <LoadingSpinnerScreen /> : props.children;
};

export { DrizzleTestDbProvider };
