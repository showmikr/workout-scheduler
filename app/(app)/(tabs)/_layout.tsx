import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Link, Redirect, Tabs, router } from "expo-router";
import { Pressable, View, Text, useColorScheme, Button } from "react-native";

import Colors from "../../../constants/Colors";
import { useSession } from "../../../ctx";
import { useSQLiteContext } from "expo-sqlite/next";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const db = useSQLiteContext();

  // Kinda gross, but it works. useSession object is either a full object with all properties defined or is completely null, so this is the workaround...
  const { session, isLoading } = useSession();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center ">
        <Text className="text-3xl dark:text-white">Loading...</Text>
      </View>
    );
  }
  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    // On web, static rendering will stop here as the user is not authenticated
    // in the headless Node process that the pages are rendered in.
    return <Redirect href="/auth" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Summary",
          tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          headerRight: () => (
            <Link href="/goals" asChild>
              <Pressable>
                {({ pressed }) => (
                  <Text
                    style={{
                      color: "rgb(10, 132, 255)",
                      paddingRight: 20,
                      fontSize: 16,
                    }}
                  >
                    Goals
                  </Text>
                )}
              </Pressable>
            </Link>
          ),
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
  );
}
