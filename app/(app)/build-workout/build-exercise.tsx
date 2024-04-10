import { useLocalSearchParams } from "expo-router";
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  View,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { twColors } from "../../../constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite/next";
import { useReducer, useRef } from "react";
import {
  CardioSetParams,
  ExerciseEnums,
  ExerciseSetParams,
  ResistanceSetParams,
  exerciseEnums,
} from "../../../utils/exercise-types";

type ExerciseSetInput = Pick<ExerciseSetParams, "reps" | "rest_time"> & {
  inputId: number;
};
type ResistanceSetInput = Pick<ResistanceSetParams, "total_weight"> &
  ExerciseSetInput;
type CardioSetInput = Pick<CardioSetParams, "target_distance" | "target_time"> &
  ExerciseSetInput;
type ResistanceInputForm = {
  exerciseType: ExerciseEnums["RESISTANCE_ENUM"];
  exerciseClassId: number;
  formRows: ResistanceSetInput[];
};
type CardioInputForm = {
  exerciseType: ExerciseEnums["CARDIO_ENUM"];
  exerciseClassId: number;
  formRows: CardioSetInput[];
};

type ExerciseInputEnums = {
  RESISTANCE_ENUM: ResistanceInputForm;
  CARDIO_ENUM: CardioInputForm;
};

type ExerciseInputEnumsMap = {
  [K in keyof ExerciseInputEnums as ExerciseEnums[K]]: ExerciseInputEnums[K];
};

type ExerciseInputForm<
  T extends keyof ExerciseInputEnumsMap = keyof ExerciseInputEnumsMap,
> = ExerciseInputEnumsMap[T];

type ExerciseInputFormAction =
  | { type: "change_reps"; targetIndex: number; newRepCount: number }
  | { type: "change_rest"; targetIndex: number; newRest: number }
  | { type: "add_set"; setId: number }
  | { type: "change_weight"; targetIndex: number; newWeight: number };

const getBlankResistanceFormState = (
  exerciseClassId: number
): ExerciseInputForm<ExerciseEnums["RESISTANCE_ENUM"]> => ({
  exerciseType: exerciseEnums.RESISTANCE_ENUM,
  exerciseClassId,
  formRows: [
    {
      inputId: 0,
      reps: 1,
      rest_time: 0,
      total_weight: 0,
    },
  ],
});

const getBlankCardioFormState = (
  exerciseClassId: number
): ExerciseInputForm<ExerciseEnums["CARDIO_ENUM"]> => ({
  exerciseType: exerciseEnums.CARDIO_ENUM,
  exerciseClassId,
  formRows: [
    {
      inputId: 0,
      reps: 1,
      rest_time: 0,
      target_distance: 0,
      target_time: 0,
    },
  ],
});

function updateReps<T extends ExerciseInputForm["formRows"][number]>(
  sets: T[],
  targetPos: number,
  reps: number
): T[] {
  return sets.map(
    (set) =>
      (set.inputId === targetPos ?
        { ...set, reps }
      : set) satisfies ExerciseSetInput as T
  );
}

function updateRest<T extends ExerciseInputForm["formRows"][number]>(
  sets: T[],
  targetPos: number,
  rest: number
): T[] {
  return sets.map(
    (set) =>
      (set.inputId === targetPos ?
        { ...set, rest_time: rest }
      : set) satisfies ExerciseSetInput as T
  );
}

function ResistanceExerciseFormReducer(
  state: ExerciseInputForm<ExerciseEnums["RESISTANCE_ENUM"]>,
  action: ExerciseInputFormAction
): ExerciseInputForm<ExerciseEnums["RESISTANCE_ENUM"]> {
  switch (action.type) {
    case "change_reps": {
      const { formRows } = state;
      const { targetIndex, newRepCount } = action;
      return {
        ...state,
        formRows: updateReps(formRows, targetIndex, newRepCount),
      };
    }
    case "change_rest": {
      const { formRows } = state;
      const { targetIndex, newRest } = action;
      return {
        ...state,
        formRows: updateRest(formRows, targetIndex, newRest),
      };
    }
    case "add_set": {
      // TODO
      const { formRows } = state;
      const { setId } = action;
      return {
        ...state,
        formRows: [
          ...formRows,
          {
            inputId: setId,
            reps: 1,
            rest_time: 0,
            total_weight: 0,
          },
        ],
      };
    }
    case "change_weight": {
      const { formRows } = state;
      const { targetIndex, newWeight } = action;
      return {
        ...state,
        formRows: formRows.map((row) =>
          row.inputId === targetIndex ?
            { ...row, total_weight: newWeight }
          : row
        ),
      };
    }
    default:
      const _unreachableCase: never = action;
      return _unreachableCase;
  }
}

// Will act as high level component for building out a Resistance Exercise
function ResistanceExerciseForm({
  exerciseClassId,
}: {
  exerciseClassId: number;
}) {
  const inputRowCount = useRef(1);
  const [exerciseFormState, exerciseFormDispatch] = useReducer(
    ResistanceExerciseFormReducer,
    getBlankResistanceFormState(exerciseClassId)
  );
  const { formRows } = exerciseFormState;
  return (
    <View>
      {formRows.map((inputRow, index) => {
        const stringReps = inputRow.reps.toString();
        const stringWeight = inputRow.total_weight.toString();
        const stringRest = inputRow.rest_time.toString();
        return (
          <View
            style={{
              flexDirection: "row",
              gap: 3 * 14,
              marginTop: 2 * 14,
              marginBottom: 2 * 14,
            }}
            //className="mb-8 mt-8 flex-row gap-12"
            key={inputRow.inputId}
          >
            <View>
              <Text className="text-xl text-black dark:text-white">Reps</Text>
              <TextInput
                inputMode="numeric"
                value={Number.isNaN(inputRow.reps) ? "" : stringReps}
                onChangeText={(text) =>
                  exerciseFormDispatch({
                    type: "change_reps",
                    targetIndex: inputRow.inputId,
                    newRepCount: parseInt(text),
                  })
                }
                className={`border-b pb-1 ${stringReps ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
              />
            </View>
            <View>
              <Text className="text-xl text-black dark:text-white">
                Total Weight
              </Text>
              <TextInput
                inputMode="numeric"
                value={Number.isNaN(inputRow.total_weight) ? "" : stringWeight}
                onChangeText={(text) =>
                  exerciseFormDispatch({
                    type: "change_weight",
                    targetIndex: inputRow.inputId,
                    newWeight: parseInt(text),
                  })
                }
                className={`border-b pb-1 ${stringWeight ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
              />
            </View>
            <View>
              <Text className="text-xl text-black dark:text-white">Rest</Text>
              <TextInput
                inputMode="numeric"
                value={Number.isNaN(inputRow.rest_time) ? "" : stringRest}
                onChangeText={(text) =>
                  exerciseFormDispatch({
                    type: "change_rest",
                    targetIndex: inputRow.inputId,
                    newRest: parseInt(text),
                  })
                }
                className={`border-b pb-1 ${stringRest ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
              />
            </View>
          </View>
        );
      })}
      <AddSetButton
        onPress={() => {
          const nextSetId = inputRowCount.current++;
          exerciseFormDispatch({ type: "add_set", setId: nextSetId });
        }}
      />
    </View>
  );
}

function AddSetButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        columnGap: 14 * 0.25,
        marginTop: 3.5,
        marginBottom: 17.5,
        alignItems: "center",
        opacity: pressed ? 0.7 : 1,
      })}
      onPress={onPress}
    >
      <FontAwesome size={14 * 1.25} name="plus" color={twColors.neutral500} />
      <Text className="text-2xl text-black dark:text-white">Add Set</Text>
    </Pressable>
  );
}

export default function BuildExerciseComponent() {
  const localSearchParams = useLocalSearchParams<{
    exercise_class_id: string;
    exercise_title: string;
    exercise_type_id: string;
  }>();
  const exerciseClassIdParam = parseInt(localSearchParams.exercise_class_id);
  const exerciseTypeIdParam = parseInt(localSearchParams.exercise_type_id);
  const exerciseTitleParam = localSearchParams.exercise_title;

  const db = useSQLiteContext();

  return (
    <SafeAreaView className="flex-1">
      <KeyboardAvoidingView
        behavior="padding"
        style={{ flex: 1 }}
        contentContainerClassName="ml-4 mr-4 mt-4 border border-red-400"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          //contentContainerClassName="ml-4 mr-4 mt-4 flex-1"
          //contentContainerStyle={{ backgroundColor: "red" }}
          style={{ flex: 1 }}
        >
          <Text className="text-xl text-black dark:text-white">
            Build Exercise Page!
          </Text>
          <Text className="text-xl text-black dark:text-white">
            Exercise: {exerciseTitleParam}
          </Text>
          <Text className="text-xl text-black dark:text-white">
            Exercise Class Id: {exerciseClassIdParam}
          </Text>
          {exerciseTypeIdParam === exerciseEnums.RESISTANCE_ENUM ?
            <ResistanceExerciseForm exerciseClassId={exerciseClassIdParam} />
          : <View>
              <Text className="text-xl text-black dark:text-white">
                Cardio Placeholder
              </Text>
            </View>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
