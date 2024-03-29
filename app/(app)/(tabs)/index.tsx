import { Pressable, StyleSheet, ScrollView } from "react-native";
import EditScreenInfo from "../../../components/EditScreenInfo";
import { Text, View } from "../../../components/Themed";
import { useColorScheme } from "nativewind";
import { useSession } from "../../../ctx";
import * as AuthSession from "expo-auth-session";
import { useState } from "react";
import { AppUser } from "../../../sqlite-types";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";

export default function TabOneScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { fakeSignOut, signOut, session } = useSession()!;
  const [userData, setUserData] = useState<Partial<AppUser> | null>(null);
  const db = useSQLiteContext();
  type SelectFields = Pick<
    AppUser,
    "id" | "first_name" | "last_name" | "user_name" | "email" | "creation_date"
  >;

  if (session && !userData) {
    const subjectClaim: string = JSON.parse(session).subjectClaim;
    db.getFirstAsync<SelectFields>(
      "SELECT id, first_name, last_name, user_name, email, creation_date FROM app_user WHERE aws_cognito_sub = ?",
      [subjectClaim]
    ).then((result) => {
      setUserData(result);
    });
  }

  return (
    <ScrollView contentContainerClassName="pt-4 pb-8 items-stretch justify-center">
      <Text style={styles.title}>Tab One</Text>
      <Text className="p-1 text-center text-xl">User Info:</Text>
      {userData &&
        Object.entries(userData).map(([key, value]) => (
          <Text
            className="border border-solid border-slate-400 p-1 text-center text-xl"
            key={key}
          >
            {key}:{" "}
            {key === "creation_date" ?
              new Date(value as string).toDateString()
            : value}
          </Text>
        ))}
      <View
        className="my-8 h-px w-4/5 self-center" // Replaces styles.separator native styling
        //style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(app)/(tabs)/" />
      <Link href="/hello" asChild>
        <Pressable className="m-10 items-center border-2 border-solid border-slate-400 bg-slate-600 p-1">
          <Text className="text-xl">Go to Hello</Text>
        </Pressable>
      </Link>
      <Pressable
        onPress={() =>
          setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
      >
        <Text className="text-center text-xl">
          {"Toggle Color Scheme: " + colorScheme}
        </Text>
      </Pressable>
      <Text />
      <Text className="text-center text-xl dark:text-white">
        Session:{" "}
        {session ?
          (JSON.parse(session) as AuthSession.TokenResponse).idToken?.substring(
            0,
            10
          )
        : null}
      </Text>
      <Link className="text-center text-xl dark:text-white" href="/summary">
        Go To Summary Page
      </Link>
      <View
        className="my-8 h-px w-4/5 self-center" // Replaces styles.separator native styling
        //style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Pressable onPress={fakeSignOut}>
        <Text className="text-center text-3xl">Sign Me Out!</Text>
      </Pressable>
    </ScrollView>
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
