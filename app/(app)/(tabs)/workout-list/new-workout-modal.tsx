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
import { twColors } from "../../../../constants/Colors";
import { router } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddNewWorkoutArgsObj,
  addNewWorkout,
  getWorkoutCount,
} from "../../../../context/query-workouts";

export default function NewWorkoutModal() {
  const db = useSQLiteContext();
  const { data: workoutCount } = useQuery({
    queryKey: ["workout_count"],
    queryFn: () => getWorkoutCount(db),
  });

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
  const defaultTitle = `New Workout #${props.workoutCount}`;
  const [title, setTitle] = useState(defaultTitle);
  const newWorkoutMutation = useMutation({
    mutationFn: (argsObject: AddNewWorkoutArgsObj) => addNewWorkout(argsObject),
    onSuccess: (newWorkout) => {
      queryClient.invalidateQueries({ queryKey: ["workout_count"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["workout_tag_mappings"] });
      console.log(
        "Added new workout, id:",
        newWorkout.id,
        ", title:",
        newWorkout.title
      );
      router.replace({
        pathname: "/workout-list/workout",
        params: { workoutId: newWorkout.title },
      });
    },
    onError: (err) => {
      console.error(err);
    },
  });
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
          newWorkoutMutation.mutate({
            db,
            title,
            workoutCount: props.workoutCount,
          })
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
