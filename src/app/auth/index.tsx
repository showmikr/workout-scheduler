import {
  Pressable,
  View,
  StyleSheet,
  useColorScheme,
  Button,
} from "react-native";
import { useSession } from "@/context/session-provider";
import { Redirect } from "expo-router";
import { TokenResponse } from "expo-auth-session";
import { ThemedText } from "@/components/Themed";
import { useDeleteDrizzleTestDb } from "@/db/drizzle-test-db";

export default function SignIn() {
  const { signIn, session } = useSession();
  const colorScheme = useColorScheme();

  const deleteDB = useDeleteDrizzleTestDb();

  return !session ?
      <View
        style={[
          styles.outerView,
          { backgroundColor: colorScheme === "dark" ? "black" : "white" },
        ]}
      >
        <ThemedText style={styles.textStyle}>
          Session:{" "}
          {session ? (JSON.parse(session) as TokenResponse).idToken : "null"}
        </ThemedText>
        <ThemedText />
        <Pressable
          onPress={() => {
            signIn();
            // Navigate after signing in. You may want to tweak this to ensure sign-in is
            // successful before navigating.
            //router.replace("/"); // Not really working, read the readme
          }}
        >
          <ThemedText style={styles.textStyle}>Sign In</ThemedText>
        </Pressable>
        <View style={{ marginTop: 36 }}>
          <Button title="Delete DB" onPress={deleteDB} />
        </View>
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
