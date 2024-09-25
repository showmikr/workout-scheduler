import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Redirect, router, Tabs, useRouter } from "expo-router";
import { Pressable, useColorScheme, View } from "react-native";

import Colors, { figmaColors } from "@/constants/Colors";
import { useSession } from "@/context/session-provider";
import { useSQLiteContext } from "expo-sqlite";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { BottomTabBar } from "@react-navigation/bottom-tabs";
import { ThemedText } from "@/components/Themed";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}
import { StyleSheet } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import {
  useActiveWorkoutActions,
  useActiveWorkoutElapsedTime,
  useActiveWorkoutStatus,
  useActiveWorkoutTitle,
} from "@/context/active-workout-provider";

const MiniWorkoutPlayer = ({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) => {
  const { toggleWorkoutTimer } = useActiveWorkoutActions();
  const elapsedTime = useActiveWorkoutElapsedTime();
  return (
    <View>
      <TouchableOpacity
        style={styles.miniPlayerContainer}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View>
          <ThemedText style={styles.miniPlayerText}>{title}</ThemedText>
          <ThemedText style={{ fontSize: 16 }}>{elapsedTime}</ThemedText>
        </View>
        <TouchableOpacity hitSlop={8} onPress={toggleWorkoutTimer}>
          <FontAwesome name="play" size={24} color={figmaColors.primaryWhite} />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { session } = useSession();
  const db = useSQLiteContext();
  useDrizzleStudio(db);
  const isWorkoutInProgress = useActiveWorkoutStatus();
  const activeWorkoutTitle = useActiveWorkoutTitle();

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        }}
        tabBar={(props) => {
          return (
            <View>
              {isWorkoutInProgress && (
                <MiniWorkoutPlayer
                  title={activeWorkoutTitle}
                  onPress={() => {
                    // setModalVisible(true);
                    router.push("/active-workout");
                  }}
                />
              )}
              <BottomTabBar {...props} />
            </View>
          );
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Summary",
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          }}
        />

        <Tabs.Screen
          name="workouts"
          options={{
            title: "Workouts",
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
            headerRight: () => (
              <Link href="/modal" asChild>
                <Pressable>
                  {({ pressed }) => (
                    <FontAwesome
                      name="info-circle"
                      size={25}
                      color={Colors[colorScheme ?? "light"].text}
                      style={{ marginRight: 15, opacity: pressed ? 0.5 : 1 }}
                    />
                  )}
                </Pressable>
              </Link>
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  miniPlayerContainer: {
    minHeight: 64,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: figmaColors.redAccent,
  },
  miniPlayerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: figmaColors.primaryWhite,
  },
});
