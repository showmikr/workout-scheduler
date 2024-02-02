import { Text, View } from "react-native";

type TaggedWorkout = { id: number; title: string; tags: string[] };
type WorkoutCardProps = { workout: TaggedWorkout };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { title, tags } = props.workout;
  return (
    <View className="w-full h-32 pl-8">
      <Text className="dark:text-white text-2xl">Title: {title}</Text>
      <Text className="dark:text-white text-2xl">
        Tags: {tags.length > 0 ? tags : "None"}
      </Text>
    </View>
  );
}
