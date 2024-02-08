import { Stack } from "expo-router";

export default function () {
  return (
    <Stack screenOptions={{ animation: "default", headerShown: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: "modal" }} />
    </Stack>
  );
}
