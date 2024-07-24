import { StyleSheet, SafeAreaView, ScrollView, View } from "react-native";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { Stack, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite";
import {
  ResistanceSection,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { twColors } from "@/constants/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TableRow } from "@/components/Table";
import {
  updateResistanceSetReps,
  updateExerciseSetReps,
  updateExerciseSetRestTime,
  addResistanceSet,
} from "@/utils/query-sets";
import FloatingAddButton from "@/components/FloatingAddButton";

export default function ExerciseDetails() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const { exerciseId, workoutId, title } = useLocalSearchParams<{
    workoutId: string;
    exerciseId: string;
    title: string;
  }>();
  if (!(exerciseId && title && workoutId)) {
    throw new Error(`exerciseId is undefined. This should never happen`);
  }
  const queryClient = useQueryClient();
  const db = useSQLiteContext();

  const { data: resistanceSets } = useQuery({
    queryKey: ["exercise-sections", workoutId],
    select: (data: ResistanceSection[]) =>
      data?.find((exercise) => exercise.exercise_id.toString() === exerciseId)
        ?.sets,
  });

  const repsMutation = useMutation({
    mutationFn: updateResistanceSetReps,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.reps ?
          "updatedReps: " + data.reps
        : "No data returned from updateResistanceSetReps"
      );
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
    },
  });

  const weightMutation = useMutation({
    mutationFn: updateExerciseSetReps,
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.total_weight ?
          "updatedWeight " + data.total_weight
        : "No data returned from updateResistanceSetWeight"
      );
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
    },
  });

  const restTimeMutation = useMutation({
    mutationFn: updateExerciseSetRestTime,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: (data) => {
      console.log(
        data?.rest_time ?
          "updatedRestTime " + data.rest_time
        : "No data returned from updateResistanceSetRestTime"
      );
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
    },
  });

  const addSetMutation = useMutation({
    mutationFn: addResistanceSet,
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
    },
  });

  // If all the exercise set data isn't fully loaded, display a loading screen
  if (!resistanceSets) {
    return (
      <SafeAreaView style={[styles.outerContainer, { alignItems: "center" }]}>
        <Stack.Screen options={{ title: title }} />
        <ThemedText
          style={{
            textAlign: "center",
            fontSize: 1.875 * 14,
            lineHeight: 2.25 * 14,
          }}
        >
          Loading...
        </ThemedText>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: twColors.neutral950 }}>
      <Stack.Screen options={{ title: title }} />
      <ScrollView>
        <View style={{ marginHorizontal: 1.25 * 14 }}>
          <ThemedText
            style={{
              fontSize: 1.875 * 14,
              lineHeight: 2.25 * 14,
              marginVertical: 1 * 14,
            }}
          >
            {title}
          </ThemedText>
          <TableRow style={{ marginBottom: 0.5 * 14 }}>
            {["Reps", "Weight", "Rest"].map((column) => (
              <ThemedText key={column} style={styles.columnHeader}>
                {column}
              </ThemedText>
            ))}
          </TableRow>
          {resistanceSets.map((set) => {
            return (
              <ResistanceSet
                set={set}
                onRepsChange={(reps) =>
                  repsMutation.mutate({
                    db,
                    reps,
                    exerciseSetId: set.exercise_set_id,
                  })
                }
                onWeightChange={(weight) =>
                  weightMutation.mutate({
                    db,
                    weight,
                    exerciseSetId: set.exercise_set_id,
                  })
                }
                onRestTimeChange={(restTime) =>
                  restTimeMutation.mutate({
                    db,
                    restTime,
                    exerciseSetId: set.exercise_set_id,
                  })
                }
                key={set.exercise_set_id}
              />
            );
          })}
        </View>
      </ScrollView>
      <FloatingAddButton
        onPress={() => {
          const idNumber = parseInt(exerciseId);
          if (isNaN(idNumber)) {
            console.error(
              "Could not parse exerciseId as number for adding set"
            );
            return;
          }
          addSetMutation.mutate({ db, exerciseId: idNumber });
        }}
      />
    </SafeAreaView>
  );
}

const ResistanceSet = ({
  set,
  onRepsChange,
  onWeightChange,
  onRestTimeChange,
}: {
  set: UnifiedResistanceSet;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onRestTimeChange: (restTime: number) => void;
}) => {
  const weightString = set.total_weight.toFixed(1);
  return (
    <TableRow style={{ marginBottom: 1 * 14 }}>
      <View style={styles.inline}>
        <ThemedTextInput
          inputMode="numeric"
          defaultValue={set.reps.toString()}
          returnKeyType="done"
          onEndEditing={(e) => {
            // if the changed input is the same as our initial state, don't update the db
            if (Number(e.nativeEvent.text) === set.reps) return;
            onRepsChange(Number(e.nativeEvent.text));
          }}
          maxLength={3}
          style={[styles.textInput]}
        />
      </View>
      <View style={styles.inline}>
        <ThemedTextInput
          inputMode="decimal"
          defaultValue={weightString}
          maxLength={5}
          style={[styles.textInput]}
          onEndEditing={(e) => {
            // if the changed input is the same as our initial state, don't update the db
            if (Number(e.nativeEvent.text) === set.total_weight) return;
            onWeightChange(Number(e.nativeEvent.text));
          }}
        />
        <ThemedText style={styles.unitsLabel}>kg</ThemedText>
      </View>
      <View style={styles.inline}>
        <ThemedTextInput
          inputMode="numeric"
          returnKeyType="done"
          defaultValue={set.rest_time.toString()}
          onEndEditing={(e) => {
            // if the changed input is the same as our initial state, don't update the db
            if (Number(e.nativeEvent.text) === set.rest_time) return;
            onRestTimeChange(Number(e.nativeEvent.text));
          }}
          style={[styles.textInput]}
        />
        <ThemedText style={styles.unitsLabel}>s</ThemedText>
      </View>
    </TableRow>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: twColors.neutral950,
  },
  textInput: {
    fontSize: 1.5 * 14,
    backgroundColor: twColors.neutral800,
    borderRadius: 5,
    minWidth: 60,
    textAlign: "center",
    paddingHorizontal: 5,
    paddingVertical: 5,
    marginRight: 0.25 * 14,
  },
  inline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "baseline",
  },
  unitsLabel: {
    fontSize: 1.5 * 14,
    paddingBottom: 5,
    fontWeight: "200",
  },
  columnHeader: {
    flex: 1,
    fontSize: 1.5 * 14,
    color: twColors.neutral500,
    fontWeight: "light",
  },
});
