import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import { Workout } from "../context/query-workouts";

type WorkoutCardProps = { workout: Workout; tags: string[] };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { id, title } = props.workout;
  const tags = props.tags;
  return (
    <Link
      href={{
        pathname: "/(app)/(tabs)/workout-list/workout",
        params: { workoutId: id, workoutTitle: title },
      }}
      asChild
    >
      <Pressable className="h-32 w-full justify-center pl-8">
        <Text className="text-2xl dark:text-white">Title: {title}</Text>
        <Text className="text-2xl dark:text-white">
          Tags: {tags.length > 0 ? tags.join(", ") : "None"}
        </Text>
      </Pressable>
    </Link>
  );
}
