import { Pressable, StyleSheet, ScrollView, DevSettings } from "react-native";
import EditScreenInfo from "../../../components/EditScreenInfo";
import { deleteDB } from "../../../db-utils";
import { Text, View } from "../../../components/Themed";
import { useColorScheme } from "nativewind";
import { useSession } from "../../../ctx";
import { useState } from "react";
import { AppUser } from "../../../sqlite-types";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";

export default function TabOneScreen() {
  const readDb = () => {
    const results = db.getAllSync<any>(
      `
      SELECT title FROM workout WHERE app_user_id = 1
      UNION
      SELECT day FROM days_of_week;
      `,
      null
    );
    console.log(results);
  };

  const { colorScheme, setColorScheme } = useColorScheme();
  const { signOut, session } = useSession();
  const [userData, setUserData] = useState<Partial<AppUser> | null>(null);
  const db = useSQLiteContext();
  type SelectFields = Pick<
    AppUser,
    "id" | "first_name" | "last_name" | "user_name" | "email" | "creation_date"
  >;

  if (session && !userData) {
    const subjectClaim: string = session.subjectClaim;
    db.getFirstAsync<SelectFields>(
      "SELECT id, first_name, last_name, user_name, email, creation_date FROM app_user WHERE aws_cognito_sub = ?",
      [subjectClaim]
    ).then((result) => {
      setUserData(result);
    });
  }

  return (
    <ScrollView contentContainerClassName="pt-4 pb-8 items-stretch justify-center">
      <Text style={styles.title}>Database</Text>
      <Pressable
        className="center justify-content-center m-10 border-2 border-solid border-slate-400 bg-slate-600 p-1"
        onPress={() => {
          deleteDB().then(() => {
            DevSettings.reload();
          });
        }}
      >
        <Text className="text-center text-lg/10">Reinitialize Database</Text>
      </Pressable>
      <Pressable
        className="m-10 border-2 border-solid border-slate-400  bg-slate-600 p-1"
        onPress={() => readDb()}
      >
        <Text className="text-center text-lg/10">Read From DB</Text>
      </Pressable>
      <Text style={styles.title}>Experimental</Text>
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
      <View
        className="my-8 h-px w-4/5 self-center" // Replaces styles.separator native styling
        //style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Pressable onPress={signOut}>
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
