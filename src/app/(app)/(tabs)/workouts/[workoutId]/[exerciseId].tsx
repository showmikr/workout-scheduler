import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  View,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ViewStyle,
  TextStyle,
} from "react-native";
import { ThemedText, ThemedTextInput, ThemedView } from "@/components/Themed";
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
import FloatingAddButton, {
  floatingAddButtonStyles,
} from "@/components/FloatingAddButton";
import { MaterialIcons } from "@expo/vector-icons";
import BottomMenu from "@/components/SetOptionsMenu";
import { useRef } from "react";
import { BottomSheetModal } from "@gorhom/bottom-sheet";

const REPS_ROW_FLEX = 9;
const WEIGHT_ROW_FLEX = 10;
const REST_ROW_FLEX = 8;
const ACTIONS_ROW_FLEX = 2;

const tableConfig: {
  key: keyof UnifiedResistanceSet | "actions";
  header: string;
  flex: number;
}[] = [
  { key: "reps", header: "Reps", flex: REPS_ROW_FLEX },
  { key: "total_weight", header: "Weight", flex: WEIGHT_ROW_FLEX },
  { key: "rest_time", header: "Rest", flex: REST_ROW_FLEX },
  { key: "actions", header: "", flex: ACTIONS_ROW_FLEX },
];

const TableHeaders = ({ config }: { config: typeof tableConfig }) => {
  return (
    <TableRow style={{ marginBottom: 0.5 * 14 }}>
      {config.map((item) => (
        <ThemedText
          key={item.key}
          style={[styles.columnHeader, { flex: item.flex }]}
        >
          {item.header}
        </ThemedText>
      ))}
    </TableRow>
  );
};

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
        <Stack.Screen options={{ title: title, headerTransparent: true }} />
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
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: twColors.neutral950 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Stack.Screen
        options={{
          title: title,
          headerTransparent: true,
          headerBackTitle: "Exercises",
        }}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={floatingAddButtonStyles.blankSpaceMargin}
        >
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
            <TableHeaders config={tableConfig} />
            {resistanceSets.map((set) => {
              return (
                <ResistanceSet
                  set={set}
                  workoutId={workoutId}
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
    </KeyboardAvoidingView>
  );
}

const ResistanceSet = ({
  set,
  workoutId,
  onRepsChange,
  onWeightChange,
  onRestTimeChange,
}: {
  set: UnifiedResistanceSet;
  workoutId: string;
  onRepsChange: (reps: number) => void;
  onWeightChange: (weight: number) => void;
  onRestTimeChange: (restTime: number) => void;
}) => {
  const weightString = set.total_weight.toFixed(1);
  const optionsSheet = useRef<BottomSheetModal>(null);
  return (
    <TableRow style={{ marginBottom: 2 * 14 }}>
      <BottomMenu workoutId={workoutId} ref={optionsSheet} exerciseSet={set} />
      <View style={[styles.inline, { flex: REPS_ROW_FLEX }]}>
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
      <View style={[styles.inline, { flex: WEIGHT_ROW_FLEX }]}>
        <ThemedTextInput
          inputMode="decimal"
          defaultValue={weightString}
          returnKeyType="done"
          maxLength={4}
          style={[styles.textInput]}
          onEndEditing={(e) => {
            // if the changed input is the same as our initial state, don't update the db
            if (Number(e.nativeEvent.text) === set.total_weight) return;
            onWeightChange(Number(e.nativeEvent.text));
          }}
        />
        <ThemedText style={styles.unitsLabel}>kg</ThemedText>
      </View>
      <View style={[styles.inline, { flex: REST_ROW_FLEX }]}>
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
      <Pressable
        onPress={() => {
          optionsSheet.current?.present();
        }}
        hitSlop={8}
        style={[styles.inline, { flex: ACTIONS_ROW_FLEX }]}
      >
        <MaterialIcons
          name="more-horiz"
          size={24}
          color={twColors.neutral500}
        />
      </Pressable>
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
