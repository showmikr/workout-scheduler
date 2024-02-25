import { useLocalSearchParams } from "expo-router";
import { Text, SafeAreaView } from "react-native";

export default function BuildExerciseComponent() {
  const { exercise_class_id } = useLocalSearchParams<{
    exercise_class_id: string;
  }>();
  const exerciseClassId = parseInt(exercise_class_id);
  return (
    <SafeAreaView>
      <Text className="text-xl text-black dark:text-white">
        Build Exercise Page!
      </Text>
      <Text className="text-xl text-black dark:text-white">
        Exercise Class Id: {exerciseClassId}
      </Text>
    </SafeAreaView>
  );
}
