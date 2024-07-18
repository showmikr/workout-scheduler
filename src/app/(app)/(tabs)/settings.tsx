import {
  Pressable,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Appearance,
} from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { deleteDB } from "@/utils/db-utils";
import { Text, View } from "@/components/Themed";
import { useSession } from "@/context/session-provider";
import { useState } from "react";
import { AppUser } from "../../../../sqlite-types";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { twColors } from "@/constants/Colors";

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

  const colorScheme = useColorScheme();
  const { signOut, session } = useSession();
  const [userData, setUserData] = useState<Partial<AppUser> | null>(null);
  const db = useSQLiteContext();
  type SelectFields = Pick<
    AppUser,
    "id" | "first_name" | "last_name" | "user_name" | "email" | "creation_date"
  >;

  if (!session) {
    throw new Error("session is null despite being in page that requires auth");
  }

  if (!userData) {
    const subjectClaim: string = session.subjectClaim;
    db.getFirstAsync<SelectFields>(
      "SELECT id, first_name, last_name, user_name, email, creation_date FROM app_user WHERE aws_cognito_sub = ?",
      [subjectClaim]
    ).then((result) => {
      setUserData(result);
    });
  }

  return (
    <ScrollView
      style={{ backgroundColor: twColors.neutral950 }}
      contentContainerStyle={styles.safeAreaView}
    >
      <Text style={styles.title}>Database</Text>
      <Pressable
        style={styles.btnStyle}
        onPress={() => {
          const subject = session.subjectClaim;
          signOut();
          deleteDB(`${subject}.db`).then();
        }}
      >
        <Text style={styles.btnTitle}>Reinitialize Database</Text>
      </Pressable>
      <Pressable style={styles.btnStyle} onPress={() => readDb()}>
        <Text style={styles.btnTitle}>Read From DB</Text>
      </Pressable>
      <Text style={styles.title}>Experimental</Text>
      <Text
        style={[{ padding: 0.25 * 14, textAlign: "center" }, styles.textxl]}
      >
        User Info:
      </Text>
      {userData &&
        Object.entries(userData).map(([key, value]) => (
          <Text style={styles.userTableText} key={key}>
            {key}:{" "}
            {key === "creation_date" ?
              new Date(value as string).toDateString()
            : value}
          </Text>
        ))}
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(app)/(tabs)/" />
      <Link href="/hello" asChild>
        <Pressable style={styles.btnStyle}>
          <Text style={styles.textxl}>Go to Hello</Text>
        </Pressable>
      </Link>
      <Pressable
        onPress={() =>
          Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
      >
        <Text style={[{ textAlign: "center" }, styles.textxl]}>
          {"Toggle Color Scheme: " + colorScheme}
        </Text>
      </Pressable>
      <Text />
      <View
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Pressable onPress={signOut}>
        <Text style={[{ textAlign: "center" }, styles.text3xl]}>
          Sign Me Out!
        </Text>
      </Pressable>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  text3xl: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  textxl: {
    fontSize: 1.25 * 14,
    lineHeight: 1.75 * 14,
  },
  userTableText: {
    borderWidth: 1,
    borderColor: twColors.neutral400,
    textAlign: "center",
    width: "90%",
    fontSize: 1.25 * 14,
    lineHeight: 1.75 * 14,
  },
  btnStyle: {
    margin: 2.5 * 14,
    alignItems: "center",
    borderWidth: 2,
    borderColor: twColors.neutral400,
    backgroundColor: twColors.neutral600,
    padding: 0.25 * 14,
    width: "75%",
  },
  btnTitle: {
    fontSize: 1.125 * 14,
    lineHeight: 2.5 * 14,
    textAlign: "center",
  },
  safeAreaView: {
    paddingTop: 14,
    paddingBottom: 2 * 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: twColors.neutral950,
  },
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
