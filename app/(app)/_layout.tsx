import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ animation: "default", headerShown: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      <Stack.Screen
        name="new-workout-modal"
        options={{ presentation: "modal", headerShown: false }}
      />
    </Stack>
  );
}
