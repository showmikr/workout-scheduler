import { Pressable, Text, View } from "react-native";
import { useSession } from "../ctx";
import { Redirect } from "expo-router";

export default function SignIn() {
  const { signIn, session, isLoading } = useSession() ?? {
    signIn: () => {
      console.error(
        "Hey, there is no sign-in function. Did you forget to implement it (or maybe useSession was null), you dummy?"
      );
    },
  };

  return !session ? (
    <View className="flex-1 items-center justify-center dark:bg-black">
      <Text className="text-3xl dark:text-white">
        Session: {session ?? "null"}
      </Text>
      <Text />
      <Text className="dark:text-white">
        {"session loading state: " + isLoading}
      </Text>
      <Pressable
        onPress={() => {
          signIn();
          // Navigate after signing in. You may want to tweak this to ensure sign-in is
          // successful before navigating.
          //router.replace("/"); // Not really working, read the readme
        }}
      >
        <Text className="dark:text-white text-3xl">Sign In</Text>
      </Pressable>
    </View>
  ) : (
    <Redirect href="/" />
  );
}
