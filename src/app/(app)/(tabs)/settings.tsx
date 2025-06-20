import {
  Pressable,
  StyleSheet,
  ScrollView,
  useColorScheme,
  Appearance,
  View,
} from "react-native";
import EditScreenInfo from "@/components/EditScreenInfo";
import { deleteDB } from "@/utils/db-utils";
import { ThemedText, ThemedView } from "@/components/Themed";
import { useSession } from "@/context/session-provider";
import { useState } from "react";
import { Link } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import { twColors } from "@/constants/Colors";
import { useAppUserId } from "@/context/app-user-id-provider";
import WeightAdjustView from "@/components/WeightAdjustView";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { appUser } from "@/db/schema";
import { useDeleteDrizzleTestDb } from "@/db/drizzle-test-db";

export default function TabOneScreen() {
  const appUserId = useAppUserId();
  const db = useSQLiteContext();
  const drizzleDb = drizzle(db);
  const readDb = async () => {
    const results = await drizzleDb.select().from(appUser);
    results.forEach((item) => {
      console.log(item);
    });
  };

  const deleteDrizzleTestDb = useDeleteDrizzleTestDb();

  type UserFields = {
    id: number;
    first_name: string;
    last_name: string;
    user_name: string;
    email: string;
    creation_date: string;
  };

  const colorScheme = useColorScheme();
  const { signOut, session } = useSession();
  const [userData, setUserData] = useState<UserFields | null>(null);

  if (!session) {
    throw new Error("session is null despite being in page that requires auth");
  }

  if (!userData) {
    const subjectClaim: string = session.subjectClaim;
    db.getFirstAsync<UserFields>(
      "SELECT id, first_name, last_name, user_name, email, creation_date FROM app_user WHERE aws_cognito_sub = ?",
      [subjectClaim]
    ).then((result) => {
      setUserData(result);
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.safeAreaView}>
      <ThemedText style={styles.title}>Database</ThemedText>
      <Pressable
        style={styles.btnStyle}
        onPress={() => {
          const subject = session.subjectClaim;
          deleteDB(db)
            .then((isDeleted) => {
              if (!isDeleted) {
                console.log(`${subject}.db doesn't exist, quitting deletion`);
              } else {
                console.log(`successfully deleted ${subject}.db`);
              }
            })
            .then(() => {
              deleteDrizzleTestDb();
            })
            .then(() => {
              signOut();
            })
            .catch((err) => {
              console.error(err);
            });
        }}
      >
        <ThemedText style={styles.btnTitle}>Reinitialize Database</ThemedText>
      </Pressable>
      <Pressable style={styles.btnStyle} onPress={() => readDb()}>
        <ThemedText style={styles.btnTitle}>Read From DB</ThemedText>
      </Pressable>
      <ThemedText style={styles.title}>Experimental</ThemedText>
      <ThemedText
        style={[{ padding: 0.25 * 14, textAlign: "center" }, styles.textxl]}
      >
        User Info:
      </ThemedText>
      {userData &&
        Object.entries(userData).map(([key, value]) => (
          <ThemedText style={styles.userTableText} key={key}>
            {key}:{" "}
            {key === "creation_date" && typeof value === "string" ?
              new Date(value).toDateString()
            : value}
          </ThemedText>
        ))}
      <ThemedText style={styles.userTableText}>
        appUserId from zustand store hook: {appUserId}
      </ThemedText>
      <ThemedView
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <EditScreenInfo path="app/(app)/(tabs)/" />
      <Link href="/hello" asChild>
        <Pressable style={styles.btnStyle}>
          <ThemedText style={styles.textxl}>Go to Hello</ThemedText>
        </Pressable>
      </Link>
      <Pressable
        onPress={() =>
          Appearance.setColorScheme(colorScheme === "dark" ? "light" : "dark")
        }
      >
        <ThemedText style={[{ textAlign: "center" }, styles.textxl]}>
          {"Toggle Color Scheme: " + colorScheme}
        </ThemedText>
      </Pressable>
      <ThemedText />
      <ThemedView
        style={styles.separator}
        lightColor="#eee"
        darkColor="rgba(255,255,255,0.1)"
      />
      <Pressable onPress={signOut}>
        <ThemedText style={[{ textAlign: "center" }, styles.text3xl]}>
          Sign Me Out!
        </ThemedText>
      </Pressable>
      <View style={{ alignSelf: "stretch", marginVertical: 24, width: 320 }}>
        <WeightAdjustView weight={9999.99} />
      </View>
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
