import { useSQLiteContext } from "expo-sqlite/next";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  Platform,
  Text,
  useColorScheme,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
} from "react-native";
import Animated from "react-native-reanimated";
import { twColors } from "../../../../constants/Colors";
import { router } from "expo-router";
import { TaggedWorkout } from ".";
import { useWorkoutsContext } from "../../../../context/workouts-context";

export default function NewWorkoutModal() {
  const colorScheme = useColorScheme();
  const db = useSQLiteContext();
  const { workoutsDispatch } = useWorkoutsContext();

  const workoutCount =
    db.getFirstSync<{ workout_count: number }>(
      `
        SELECT count(id) AS workout_count
        FROM workout
        WHERE app_user_id = 1 AND training_day_id IS NULL;
        `
    )?.workout_count ?? 0;
  console.log("workoutCount:", workoutCount);
  const defaultTitle = `New Workout #${workoutCount + 1}`;
  const [title, setTitle] = useState(defaultTitle);

  const addNewEmptyWorkout = () => {
    const newWorkoutId = db.getFirstSync<{ id: number }>(
      `INSERT INTO workout (app_user_id, title, list_order) VALUES (1, ?, ?) RETURNING workout.id;`,
      [title.length > 0 ? title : defaultTitle, workoutCount + 1]
    );
    return newWorkoutId!.id;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{
        flex: 1,
        rowGap: 48,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          color: colorScheme == "dark" ? "white" : "black",
        }}
      >
        Give your workout a name
      </Text>
      <TextInput
        maxLength={80}
        value={title}
        selectTextOnFocus
        autoFocus
        onChangeText={(text) => {
          setTitle(text);
        }}
        style={{
          width: "95%",
          fontSize: 36,
          borderBottomWidth: 1,
          borderBottomColor: twColors.neutral500,
          fontWeight: "bold",
          color: colorScheme == "dark" ? "white" : "black",
        }}
        placeholder={defaultTitle}
      ></TextInput>
      <Pressable
        style={({ pressed }) => ({
          paddingVertical: 8,
          paddingHorizontal: 16,
          backgroundColor: pressed ? "forestgreen" : "green",
          borderRadius: 30,
          justifyContent: "center",
          height: "auto",
          width: "auto",
        })}
        onPress={() => {
          const newWorkoutId = addNewEmptyWorkout();
          const newWorkout: TaggedWorkout = {
            id: newWorkoutId,
            tags: [],
            title,
          };
          workoutsDispatch({ type: "add_new_workout", newWorkout });
          router.replace(`/workouts/${newWorkoutId}`);
        }}
      >
        <Animated.Text
          style={{
            textShadowColor: "black",
            textShadowRadius: 0,
            textShadowOffset: { width: 1, height: 1 },
            fontSize: 24,
            fontWeight: "bold",
            color: colorScheme == "dark" ? "white" : "black",
          }}
        >
          Submit
        </Animated.Text>
      </Pressable>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </KeyboardAvoidingView>
  );
}
