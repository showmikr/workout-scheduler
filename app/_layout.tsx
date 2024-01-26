import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, SplashScreen } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";
import { SessionProvider } from "../ctx";
import "../global.css";
import { SQLiteProvider, SQLiteDatabase } from "expo-sqlite/next";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(app)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const { colorScheme } = useColorScheme();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <SQLiteProvider databaseName="next-sqlite.db" onInit={initDb}>
          <Slot />
        </SQLiteProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}

async function initDb(db: SQLiteDatabase) {
  const tableInfo = db.getFirstSync<{ table_count: number }>(
    "SELECT COUNT(name) as table_count FROM sqlite_master WHERE type=?",
    ["table"]
  );

  const tableCount = tableInfo ? tableInfo.table_count : 0;
  console.log(`tableCount: ${tableCount}`);

  if (tableCount > 0) {
    return;
  }

  const sqlFile = await Asset.fromModule(
    require("../workout-scheduler-v2.sql")
  ).downloadAsync();

  if (!sqlFile.localUri) {
    console.log("workout-scheduler-v2.sql asset was not correctly downloaded");
    return;
  }
  const sqlScript = await FileSystem.readAsStringAsync(sqlFile.localUri);
  db.execSync(sqlScript);
  console.log("db script executed to load tables schema");
}
