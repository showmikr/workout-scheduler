import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { Text as ThemedText } from "../components/Themed";

import { useSession } from "../ctx";

export default function SignIn() {
  const { signIn } = useSession() ?? {
    signIn: () => {
      console.error(
        "Hey, there is no sign-in function. Did you forget to implement it (or maybe useSession was null), you dummy?"
      );
    },
  };
  return (
    <View className="flex-1 items-center justify-center">
      <Pressable>
        <ThemedText
          onPress={() => {
            signIn();
            // Navigate after signing in. You may want to tweak this to ensure sign-in is
            // successful before navigating.
            router.replace("/");
          }}
        >
          Sign In
        </ThemedText>
      </Pressable>
    </View>
  );
}
