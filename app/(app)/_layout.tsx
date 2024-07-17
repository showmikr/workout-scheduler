import { Redirect, Stack } from "expo-router";
import { SQLiteProvider } from "expo-sqlite";
import { useSession } from "../../ctx";
import { initDb } from "../../utils/db-utils";

export default function AppLayout() {
  const { session } = useSession();
  if (!session) {
    return <Redirect href="/auth" />;
  }
  return (
    <SQLiteProvider databaseName={`${session.subjectClaim}.db`} onInit={initDb}>
      <Stack screenOptions={{ animation: "default", headerShown: true }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </SQLiteProvider>
  );
}
