import { ThemedText } from "@/components/Themed";
import { ActiveExercise } from "@/context/active-workout-provider";
import { View } from "react-native";

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
