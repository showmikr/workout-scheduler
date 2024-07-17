import { Pressable, View, StyleSheet, useColorScheme } from "react-native";
import { useSession } from "@/context/session-provider";
import { Redirect } from "expo-router";
import { TokenResponse } from "expo-auth-session";
import { Text } from "@/components/Themed";

export default function SignIn() {
  const { signIn, session } = useSession();
  const colorScheme = useColorScheme();

  return !session ?
      <View
        style={[
          styles.outerView,
          { backgroundColor: colorScheme === "dark" ? "black" : "white" },
        ]}
      >
        <Text style={styles.textStyle}>
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
          <Text style={styles.textStyle}>Sign In</Text>
        </Pressable>
      </View>
    : <Redirect href="/" />;
}

const styles = StyleSheet.create({
  outerView: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  textStyle: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
});
