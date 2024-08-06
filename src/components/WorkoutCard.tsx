import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { getWorkoutStats, Workout, WorkoutStats } from "@/utils/query-workouts";
import { ThemedText } from "@/components/Themed";
import ResistanceIcon from "@/assets/icons/resistance_icon_grey.svg";
import { FontAwesome6 } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { CardOptionsUnderlay } from "./CardUnderlay";
import { useQuery } from "@tanstack/react-query";
import { useSQLiteContext } from "expo-sqlite";
type WorkoutCardProps = { workout: Workout; tags: string[] };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { id: workoutId, title } = props.workout;
  const db = useSQLiteContext();
  const { data: workoutStats } = useQuery({
    queryKey: ["workout-stats", workoutId],
    queryFn: () => getWorkoutStats(db, workoutId),
  });
  return (
    <Swipeable
      renderRightActions={(_progress, dragX) => (
        <CardOptionsUnderlay
          dragX={dragX}
          onPress={() => {
            console.log("TODO Implement Delete Workout");
          }}
        />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
    >
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/workouts/[workoutId]",
            params: { workoutId: workoutId, workoutTitle: title },
          });
        }}
        style={styles.cardContainer}
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
          {workoutStats ? <Subtitles workoutStats={workoutStats} /> : null}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3D3D3D",
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
