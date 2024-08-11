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
  SafeAreaView,
} from "react-native";
import { twColors } from "@/constants/Colors";
import { router } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import { useAddWorkout } from "@/hooks/workouts/workout-ids";
import { Workout } from "@/utils/exercise-types";
import { useWorkouts } from "@/hooks/workouts/workout-ids";

export default function NewWorkoutModal() {
  const selectCount = (data: Workout[]) => data.length;
  const { data: workoutCount } = useWorkouts(selectCount);

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      {!workoutCount ?
        <Text style={{ color: "#BDBDBD", fontWeight: "bold", fontSize: 22 }}>
          Loading...
        </Text>
      : <AddWorkoutCard workoutCount={workoutCount} />}
    </SafeAreaView>
  );
}

const AddWorkoutCard = (props: { workoutCount: number }) => {
  const db = useSQLiteContext();
  const colorScheme = useColorScheme();
  const queryClient = useQueryClient();
  const defaultTitle = `New Workout #${props.workoutCount + 1}`;
  const [title, setTitle] = useState(defaultTitle);
  const addWorkoutMutation = useAddWorkout();
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
          minWidth: "80%",
          fontSize: 36,
          borderBottomWidth: 1,
          borderBottomColor: twColors.neutral500,
          fontWeight: "bold",
          color: colorScheme == "dark" ? "white" : "black",
        }}
        placeholder={defaultTitle}
      />
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
        onPress={() =>
          addWorkoutMutation.mutate(
            { db, title, workoutCount: props.workoutCount },
            {
              onSuccess: (newWorkout) => {
                router.replace({
                  pathname: "/workouts/[workoutId]",
                  params: {
                    workoutId: newWorkout.id,
                    workoutTitle: newWorkout.title,
                  },
                });
              },
            }
          )
        }
      >
        <Text
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
        </Text>
      </Pressable>
      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </KeyboardAvoidingView>
  );
};
