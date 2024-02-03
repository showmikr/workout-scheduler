import { Link } from "expo-router";
import { Pressable, Text } from "react-native";
import type { TaggedWorkout } from "../app/(app)/(tabs)/two";

type WorkoutCardProps = { workout: TaggedWorkout };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { id, title, tags } = props.workout;
  return (
    <Link href={`/workout/${id}`} asChild>
      <Pressable className="h-32 w-full justify-center pl-8 active:bg-slate-200 dark:active:bg-gray-900">
        <Text className="text-2xl dark:text-white">Title: {title}</Text>
        <Text className="text-2xl dark:text-white">
          Tags: {tags.length > 0 ? tags.join(", ") : "None"}
        </Text>
      </Pressable>
    </Link>
  );
}
