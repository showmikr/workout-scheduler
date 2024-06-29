import { Pressable, Text, View } from "react-native";
import { useSession } from "../../ctx";
import { Redirect } from "expo-router";
import { TokenResponse } from "expo-auth-session";

export default function SignIn() {
  const { signIn, session } = useSession();

  return !session ?
      <View className="flex-1 items-center justify-center dark:bg-black">
        <Text className="text-3xl dark:text-white">
          Session:{" "}
          {session ? (JSON.parse(session) as TokenResponse).idToken : "null"}
        </Text>
        <Text />
        <Pressable
          onPress={() => {
            signIn();
            // Navigate after signing in. You may want to tweak this to ensure sign-in is
            // successful before navigating.
            //router.replace("/"); // Not really working, read the readme
          }}
        >
          <Text className="text-3xl dark:text-white">Sign In</Text>
        </Pressable>
      </View>
    : <Redirect href="/" />;
}
