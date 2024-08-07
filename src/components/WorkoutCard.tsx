import { Link } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { Workout } from "@/utils/query-workouts";
import { ThemedText } from "@/components/Themed";

type WorkoutCardProps = { workout: Workout; tags: string[] };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { id, title } = props.workout;
  const tags = props.tags;
  return (
    <Link
      href={{
        pathname: "/workouts/[workoutId]",
        params: { workoutId: id, workoutTitle: title },
      }}
      asChild
    >
      <Pressable style={styles.exerciseBtn}>
        <ThemedText style={styles.text2xl}>Title: {title}</ThemedText>
        <ThemedText style={styles.text2xl}>
          Tags: {tags.length > 0 ? tags.join(", ") : "None"}
        </ThemedText>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  text2xl: {
    fontSize: 1.5 * 14,
    lineHeight: 2 * 14,
  },
  exerciseBtn: {
    height: 8 * 14,
    width: "100%",
    justifyContent: "center",
    paddingLeft: 2 * 14,
  },
});
