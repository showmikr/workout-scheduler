import { StyleSheet, SafeAreaView, ScrollView, TextInput } from "react-native";
import { ThemedText, ThemedView } from "@/components/Themed";
import { Stack, useLocalSearchParams } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  ResistanceSection,
  UnifiedResistanceSet,
} from "@/utils/exercise-types";
import { twColors } from "@/constants/Colors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0D" }}>
      <Stack.Screen options={{ title: title }} />
      <ScrollView>
        <ThemedText style={{ fontSize: 1.875 * 14, lineHeight: 2.25 * 14 }}>
          Hello, I'm an exercise page placeholder
        </ThemedText>
        <ThemedText style={{ fontSize: 1.875 * 14, lineHeight: 2.25 * 14 }}>
          Exercise ID: {exerciseId}
        </ThemedText>
        {resistanceSets.map((set, index) => {
          return (
            <ResistanceSet
              set={set}
              onWeightChange={(weight) =>
                weightMutation.mutate({ weight, setId: set.exercise_set_id })
              }
              key={set.exercise_set_id}
            />
          );
        })}
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
    <ThemedView
      style={[
        styles.rowContainer,
        styles.inline,
        {
          borderWidth: 1,
          borderColor: "red",
          flex: 1,
          justifyContent: "space-around",
        },
      ]}
    >
      <ThemedView style={{ maxWidth: 100 }}>
        <ThemedText style={styles.inputLabel}>Reps</ThemedText>
        <TextInput
          inputMode="numeric"
          value={set.reps.toString()}
          maxLength={5}
          style={[styles.textInput, styles.inertInputState]}
        />
      </ThemedView>
      <ThemedView style={{ maxWidth: 100 }}>
        <ThemedText style={styles.inputLabel}>Weight</ThemedText>
        <ThemedView style={styles.inline}>
          <TextInput
            inputMode="decimal"
            value={weightString}
            maxLength={5}
            style={[styles.textInput, styles.inertInputState]}
            onChangeText={(text) => {
              setWeightString(text);
            }}
            onEndEditing={(e) => {
              // if the changed input is the same as our initial state, don't update the db
              if (Number(e.nativeEvent.text) === set.total_weight) return;
              onWeightChange(Number(e.nativeEvent.text));
            }}
          />
          <ThemedText style={styles.unitsLabel}>kg</ThemedText>
        </ThemedView>
      </ThemedView>
      <ThemedView style={{ maxWidth: 100 }}>
        <ThemedText style={styles.inputLabel}>Rest</ThemedText>
        <ThemedView style={styles.inline}>
          <TextInput
            inputMode="numeric"
            value={set.rest_time.toString()}
            style={[styles.textInput, styles.inertInputState]}
          />
          <ThemedText style={styles.unitsLabel}>s</ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: twColors.neutral950,
  },
  inputLabel: {
    fontSize: 18,
    color: "white",
    textAlign: "left",
    paddingBottom: 2,
  },
  unitsLabel: {
    fontSize: 18,
    color: "white",
  },
  textInput: {
    //width: 64,
    fontSize: 20,
    color: "white",
    textAlign: "left",
  },
  inline: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  rowContainer: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  inertInputState: {
    //backgroundColor: twColors.neutral800,
    //minWidth: 32,
    borderRadius: 5,
    paddingLeft: 2,
    paddingRight: 2,
  },
  activeInputState: {
    backgroundColor: twColors.neutral100,
    color: "black",
  },
});

export { ResistanceSet };
