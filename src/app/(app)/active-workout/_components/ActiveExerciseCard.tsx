import { ThemedText } from "@/components/Themed";
import {
  ActiveExercise,
  useActiveWorkoutActions,
} from "@/context/active-workout-provider";
import { router } from "expo-router";
import { TouchableOpacity, View } from "react-native";

type ActiveExerciseCardProps = {
  exercise: ActiveExercise;
};

export default function ActiveExerciseCard({
  exercise,
}: ActiveExerciseCardProps) {
  const { id, exerciseClass, sets } = exercise;
  return (
    <View>
      <ThemedText>{exerciseClass.title}</ThemedText>
    </View>
  );
}
