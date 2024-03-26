import { Stack } from "expo-router";

export default function () {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="add-exercise/index"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}
