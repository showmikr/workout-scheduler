import { router } from "expo-router";
import { Pressable, StyleSheet, View, Text, Dimensions } from "react-native";

import { ThemedText } from "@/components/Themed";
import ResistanceIcon from "@/assets/icons/resistance_icon_grey.svg";
import { FontAwesome6 } from "@expo/vector-icons";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import { DeleteUnderlay } from "./CardUnderlay";
import { Workout, WorkoutStats } from "@/utils/exercise-types";

export default function WorkoutCard({
  workout,
  workoutStats,
}: {
  workout: Workout;
  workoutStats: WorkoutStats;
}) {
  const { id: workoutId, title } = workout;
  return (
    <Swipeable
      renderRightActions={(_progress, drag) => (
        <DeleteUnderlay
          drag={drag}
          onPress={() => {
            console.log("TODO Implement Delete Workout");
          }}
        />
      )}
      friction={2}
      overshootFriction={8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
    >
      <Pressable
        onPress={() => {
          router.navigate({
            pathname: "/workouts/[workoutId]",
            params: { workoutId: workoutId, workoutTitle: title },
          });
        }}
        style={[styles.cardContainer]}
      >
        <ResistanceIcon width={36} height={36} />
        <View style={styles.mainContent}>
          <ThemedText
            style={[styles.titleStyle]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </ThemedText>
          {workoutStats ?
            <Subtitles workoutStats={workoutStats} />
          : null}
        </View>
        <Pressable
          style={styles.optionsIcon}
          hitSlop={10}
          onPress={() => {
            console.log("ellipsis pressed");
          }}
        >
          <FontAwesome6 name="ellipsis" size={20} color="#575757" />
        </Pressable>
      </Pressable>
    </Swipeable>
  );
}

const Subtitles = ({ workoutStats }: { workoutStats: WorkoutStats }) => {
  const { totalExercises, totalSets } = workoutStats;
  const exerciseString =
    totalExercises + " exercise" + (totalExercises !== 1 ? "s" : "");
  const setString = totalSets + " set" + (totalSets !== 1 ? "s" : "");
  return (
    <ThemedText style={styles.subtitleStyle}>
      {exerciseString}, {setString}
    </ThemedText>
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 20,
  },
  cardContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 1 * 14,
    paddingVertical: 2 * 14,
    marginHorizontal: 1 * 14,
    paddingHorizontal: 1 * 14,
  },
  mainContent: {
    flexShrink: 1, // Allow the text to shrink if it doesn't fit
    flexDirection: "column",
    gap: 2 * 2,
  },
  subtitleStyle: {
    fontSize: 14,
    color: "#575757",
  },
  optionsIcon: {
    marginLeft: "auto",
  },
});

const swipeStyles = StyleSheet.create({
  whiteText: {
    color: "white",
    borderColor: "red",
  },
  swipeable: {
    width: 50,
    flex: 1,
    borderWidth: 1,
    borderColor: "blue",
    alignItems: "center",
    alignContent: "stretch",
  },
});
