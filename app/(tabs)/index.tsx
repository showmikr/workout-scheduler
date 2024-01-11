import { Pressable, StyleSheet, ScrollView } from "react-native";
import EditScreenInfo from "../../components/EditScreenInfo";
import { Text, View } from "../../components/Themed";
import { useColorScheme } from "nativewind";
import { useSession } from "../../ctx";
import * as AuthSession from "expo-auth-session";
import { openDB } from "../../db-utils";
import { useState } from "react";

type User = {
  firstName?: string;
  lastName?: string;
  userName: string;
  email: string;
  subjectClaim: string;
};

export default function TabOneScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { fakeSignOut, signOut, session } = useSession()!;
  const [userData, setUserData] = useState(null as User | null);

  if (session && !userData) {
    openDB().then((db) => {
      db.transaction((tx) => {
        // get subject claim - this will be used as the search criteria in the sqlite app_user table
        const subjectClaim: string = JSON.parse(session).subjectClaim;
        tx.executeSql(
          "SELECT aws_cognito_sub, first_name, last_name, user_name, email FROM app_user WHERE aws_cognito_sub = ?",
          [subjectClaim],
          (_tx, resultSet) => {
            const { aws_cognito_sub, first_name, last_name, user_name, email } =
              resultSet.rows._array[0];
            const readData: User = {
              subjectClaim: aws_cognito_sub,
              firstName: first_name,
              lastName: last_name,
              userName: user_name,
              email: email,
            };
            setUserData(readData);
          }
        );
      });
    });
  }

  return (
    <ScrollView contentContainerClassName="pt-4 pb-8 items-stretch justify-center">
      <Text style={styles.title}>Tab One</Text>
      <Text className="p-1 text-xl text-center">User Info:</Text>
      {userData &&
        Object.entries(userData).map(([key, value]) => (
          <Text
            className="text-center border-solid border border-slate-400 text-xl p-1"
            key={key}
          >
            {key}: {value}
          </Text>
        ))}
      <View
        className="my-8 h-px w-4/5 self-center" // Replaces styles.separator native styling
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
        <Text className="text-center text-xl">
          {"Toggle Color Scheme: " + colorScheme}
        </Text>
      </Pressable>
      <Text />
      <Text className="text-center text-xl dark:text-white">
        Session:{" "}
        {session
          ? (
              JSON.parse(session) as AuthSession.TokenResponse
            ).idToken?.substring(0, 10)
          : null}
      </Text>
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
