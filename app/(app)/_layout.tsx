import { Stack } from "expo-router";
import { router } from "expo-router";
import { Button } from "react-native";

export default function () {
  return (
    <Stack screenOptions={{ animation: "default", headerShown: true }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="modal"
        options={{
          presentation: "modal",
          headerLeft: () => (
            <Button onPress={() => router.back()} title="Back" />
          ),
          headerBackVisible: true,
        }}
      />
    </Stack>
  );
}
