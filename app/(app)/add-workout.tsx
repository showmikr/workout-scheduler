import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  Text,
  SafeAreaView,
  TextInput,
  Pressable,
  Keyboard,
  ScrollView,
} from "react-native";
import { router } from "expo-router";

export default function AddWorkoutComponent() {
  const db = useSQLiteContext();
  const [workoutTitle, setWorkoutTitle] = useState<string>("");

  // Grabs last_item_pos + 1 if there are already list items, otherwise this is the first entry
  const getLastItemPos = () => {
    const lastItemPos =
      db.getFirstSync<{ last_item_pos: number }>(
        `
        SELECT max(list_order) AS last_item_pos 
        FROM workout
        WHERE app_user_id = 1 AND training_day_id IS NULL;
        `
      )?.last_item_pos ?? 0;
    return lastItemPos;
  };

  const addWorkout = (title: string) => {
    return db.runSync(
      `INSERT INTO workout (app_user_id, title, list_order) VALUES (1, ?, ?);`,
      [title, getLastItemPos() + 1]
    );
  };

  const onSubmitWorkout = () => {
    Keyboard.dismiss();
    const title = workoutTitle.trim();
    if (!title) {
      setWorkoutTitle("");
      console.log("Hey! You can't enter an empty string. Get Outta Here!");
      return;
    }
    addWorkout(title);
    router.replace("/two");
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="border border-green-600 p-4"
        keyboardShouldPersistTaps="handled"
      >
        <Text className="pb-4 text-center text-3xl dark:text-white">
          New Workout
        </Text>
        <Text className="text-2xl font-bold dark:text-white">Title:</Text>
        <TextInput
          value={workoutTitle}
          onChangeText={setWorkoutTitle}
          className={`border-b ${workoutTitle ? "border-gray-600" : "border-gray-700"} pb-1 text-2xl dark:text-white`}
          placeholder="Add workout title here"
        />
        <Pressable
          disabled={workoutTitle.trim().length < 1}
          style={({ pressed }) => ({
            marginLeft: 14,
            marginTop: 28,
            borderWidth: 1,
            borderColor: pressed ? "green" : "yellow",
            opacity: pressed ? 0.5 : 1,
          })}
          onPress={onSubmitWorkout}
        >
          <Text className="w-24 border border-green-500 p-1 text-2xl text-blue-500">
            Submit
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
