import { ThemedText } from "@/components/Themed";
import { ActiveExercise } from "@/context/active-workout-provider";
import { View } from "react-native";

type ActiveExerciseCardProps = {
  exercise: ActiveExercise;
};

export default function ActiveExerciseCard({
  exercise,
}: ActiveExerciseCardProps) {
  const { id, exerciseClassId, sets } = exercise;
  return (
    <View style={{ marginVertical: 10 }}>
      <ThemedText style={{ fontSize: 24 }}>
        ExerciseClassId: {exerciseClassId}
      </ThemedText>
    </View>
  );
}
