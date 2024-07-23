import { StyleSheet, SafeAreaView, ScrollView, View } from "react-native";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { Stack, useLocalSearchParams } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  ResistanceSection,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { twColors } from "@/constants/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TableRow } from "@/components/Table";

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

  const weightMutation = useMutation({
    mutationFn: ({ setId, weight }: { setId: number; weight: number }) =>
      updateResistanceSetWeight({ db, resistanceSetId: setId, weight }),
    onError: (error) => {
      console.log(error);
    },
    onSuccess: () => {
      console.log(workoutId);
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
                onWeightChange={(weight) =>
                  weightMutation.mutate({
                    weight,
                    setId: set.exercise_set_id,
                  })
                }
                key={set.exercise_set_id}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type SetWeightArgs = {
  db: SQLiteDatabase;
  resistanceSetId: number;
  weight: number;
};

async function updateResistanceSetWeight({
  db,
  resistanceSetId,
  weight,
}: SetWeightArgs) {
  const updatedWeight = await db.getFirstAsync<{ total_weight: number }>(
    `
    UPDATE resistance_set
    SET total_weight = ?
    WHERE exercise_set_id = ?
    RETURNING resistance_set.total_weight;
    `,
    [weight, resistanceSetId]
  );
  //  Non-null assert is okay here b/c we can handle the error
  //  in the onError() handler for the weightMutation
  return updatedWeight!;
}

const ResistanceSet = ({
  set,
  onWeightChange,
}: {
  set: UnifiedResistanceSet;
  onWeightChange: (weight: number) => void;
}) => {
  const [weightString, setWeightString] = useState(
    set.total_weight.toFixed(2).toString()
  );
  return (
    <TableRow style={{ marginBottom: 1 * 14 }}>
      <View style={styles.inline}>
        <ThemedTextInput
          inputMode="numeric"
          value={set.reps.toString()}
          returnKeyType="done"
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
          value={set.rest_time.toString()}
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

export { ResistanceSet };
