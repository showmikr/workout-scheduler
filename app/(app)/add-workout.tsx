import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  Text,
  SafeAreaView,
  TextInput,
  Pressable,
  Keyboard,
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
    if (title.length < 1) {
      console.log("Hey! You can't enter an empty string. Get Outta Here!");
      setWorkoutTitle("");
      return;
    }
    addWorkout(workoutTitle);
    console.log("I hope I added", title, "to the workouts list...");
    router.replace("/two");
  };

  return (
    <SafeAreaView className="flex-1">
      <Pressable
        className="flex-1 border border-green-600 p-4"
        onPress={() => Keyboard.dismiss()}
      >
        <Text className="pb-4 text-center text-3xl dark:text-white">
          New Workout
        </Text>
        <Text className="text-2xl font-bold dark:text-white">Title:</Text>
        <TextInput
          onChangeText={setWorkoutTitle}
          className="border-b border-blue-700 pb-1 text-2xl dark:text-white"
          placeholder="Add workout title here"
        />
        <Pressable className="mt-8 self-center border border-red-600 active:opacity-60">
          <Text
            className="p-1 text-2xl text-blue-500"
            onPress={onSubmitWorkout}
          >
            Submit
          </Text>
        </Pressable>
      </Pressable>
    </SafeAreaView>
  );
}
