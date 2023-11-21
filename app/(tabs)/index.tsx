import { Pressable, StyleSheet } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useColorScheme } from "nativewind";
import { useSession } from "../../ctx";
import * as AuthSession from "expo-auth-session";

export default function TabOneScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { signOut, session } = useSession()!;
  return (
    <View
      //style={styles.container}
      className="flex-1 items-center justify-center"
    >
      <Text style={styles.title}>Tab One</Text>
      <View
        className="my-8 h-px w-4/5" // Replaces styles.separator native styling
        //style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(tabs)/index.tsx" />
      <Pressable
        onPress={() =>
          setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
      >
        <Text className="text-xl">{"Toggle Color Scheme: " + colorScheme}</Text>
      </Pressable>
      <Text />
      <Text className="text-xl dark:text-white">
        Session:{" "}
        {session
          ? (
              JSON.parse(session) as AuthSession.TokenResponse
            ).idToken?.substring(0, 10)
          : null}
      </Text>
      <View
        className="my-8 h-px w-4/5" // Replaces styles.separator native styling
        //style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Pressable onPress={signOut}>
        <Text className="text-3xl">Sign Me Out!</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
});
