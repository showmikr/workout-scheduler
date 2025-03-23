import { Redirect, Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useSession } from "@/context/session-provider";
import { initDb } from "@/utils/db-utils";
import { View } from "react-native";
import { AppUserIdProvider } from "@/context/app-user-id-provider";

export default function AppLayout() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }

  return (
    <SQLiteProvider
      databaseName={`${session.subjectClaim}.db`}
      onInit={initDb}
      /* options={{ enableChangeListener: true }} */
    >
      <AppUserIdProvider>
        <Stack screenOptions={{ animation: "default", headerShown: true }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: "modal" }} />
          <Stack.Screen
            name="active-workout/index"
            options={{ title: "Active Workout" }}
          />
          <Stack.Screen
            name="active-workout/add-exercise"
            options={{ presentation: "modal", title: "Choose an exercise" }}
          />
          <Stack.Screen
            name="hello"
            options={{
              headerBackTitle: "Back",
              headerBackground: () => <View style={{ flex: 1, opacity: 1 }} />,
            }}
          />
        </Stack>
      </AppUserIdProvider>
    </SQLiteProvider>
  );
}
