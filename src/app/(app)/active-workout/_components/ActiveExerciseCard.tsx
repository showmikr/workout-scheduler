import { ThemedText } from "@/components/Themed";
import {
  useActiveWorkoutExercise,
  useActiveWorkoutSets,
} from "@/context/active-workout-provider";
import { View } from "react-native";

export default function ActiveExerciseCard({
  exerciseId,
}: {
  exerciseId: number;
}) {
  const { exerciseClassId, id, setIds } = useActiveWorkoutExercise(exerciseId);
  const activeSets = useActiveWorkoutSets(id);
  return (
    <View style={{ marginVertical: 12 }}>
      <ThemedText style={{ fontSize: 24 }}>Id: {id}</ThemedText>
      <ThemedText style={{ fontSize: 24 }}>
        ExerciseClassId: {exerciseClassId}
      </ThemedText>
      {activeSets.map((set) => {
        return (
          <View key={set.id} style={{ marginVertical: 4 }}>
            <ThemedText style={{ fontSize: 20 }}>SetId: {set.id}</ThemedText>
            <ThemedText style={{ fontSize: 20 }}>Reps: {set.reps}</ThemedText>
            <ThemedText style={{ fontSize: 20 }}>
              Weight: {set.weight}
            </ThemedText>
            <ThemedText style={{ fontSize: 20 }}>
              Rest: {set.targetRest}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}
