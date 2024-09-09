import { ThemedText } from "@/components/Themed";
import {
  useActiveWorkoutExercise,
  useActiveWorkoutSetEntities,
} from "@/context/active-workout-provider";
import { useMemo } from "react";
import { View } from "react-native";

export default function ActiveExerciseCard({
  exerciseId,
}: {
  exerciseId: number;
}) {
  console.log(`${exerciseId} rendered`);
  const { exerciseClassId, setIds } = useActiveWorkoutExercise(exerciseId);
  const allSets = useActiveWorkoutSetEntities();
  const activeSets = useMemo(
    () => setIds.map((setId) => allSets[setId]),
    [setIds]
  );
  return (
    <View style={{ marginVertical: 12 }}>
      <ThemedText style={{ fontSize: 24 }}>Id: {exerciseId}</ThemedText>
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
