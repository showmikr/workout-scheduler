import { useLocalSearchParams } from "expo-router";
import { SafeAreaView, Text } from "react-native";
export default function () {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  return (
    <SafeAreaView>
      <Text className="text-3xl text-black dark:text-white">
        Hello, I'm an exercise page placeholder
      </Text>
      <Text className="text-3xl text-black dark:text-white">
        Exercise ID: {exerciseId}
      </Text>
    </SafeAreaView>
  );
}
