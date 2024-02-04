import { Text, View } from "react-native";

type TaggedWorkout = { id: number; title: string; tags: string[] };
type WorkoutCardProps = { workout: TaggedWorkout };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { title, tags } = props.workout;
  return (
    <View className="h-32 w-full pl-8">
      <Text className="text-2xl dark:text-white">Title: {title}</Text>
      <Text className="text-2xl dark:text-white">
        Tags: {tags.length > 0 ? tags : "None"}
      </Text>
    </View>
  );
}
