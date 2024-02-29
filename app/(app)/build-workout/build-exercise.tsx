import { useLocalSearchParams } from "expo-router";
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  View,
  TextInput,
} from "react-native";
import { twColors } from "../../../constants/Colors";
import { FontAwesome } from "@expo/vector-icons";
import { useSQLiteContext } from "expo-sqlite/next";
import { useReducer } from "react";
import {
  CardioSetParams,
  ExerciseEnums,
  ExerciseSetParams,
  ResistanceSetParams,
  exerciseEnums,
} from "../workout/[workoutId]";

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
  | { type: "TODO AGAIN" }; // should be union of action types

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

function ExerciseFormReducer(
  state: ExerciseInputForm,
  action: ExerciseInputFormAction
): ExerciseInputForm {
  switch (action.type) {
    case "change_reps": {
      const { formRows } = state;
      const { targetIndex, newRepCount } = action;
      const updateReps: <T extends keyof ExerciseInputEnumsMap>(
        state: ExerciseInputForm<T>
      ) => ExerciseInputForm<T> = (state) => ({
        ...state,
        formRows: formRows.map(
          (row) =>
            (row.inputId === targetIndex ?
              { ...row, reps: newRepCount }
            : row) satisfies ExerciseInputForm["formRows"][number]
        ),
      });
      return updateReps(state) satisfies ExerciseInputForm;
    }
    case "TODO AGAIN": {
      return state;
    }
    default:
      const _unreachableCase: never = action;
      return _unreachableCase;
  }
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

  const [exerciseFormState, exerciseFormDispatch] = useReducer(
    ExerciseFormReducer,
    exerciseTypeIdParam === exerciseEnums.RESISTANCE_ENUM ?
      getBlankResistanceFormState(exerciseClassIdParam)
    : getBlankCardioFormState(exerciseClassIdParam)
  );
  const { formRows, exerciseType } = exerciseFormState;
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="ml-4 mr-4 mt-4 flex-1">
        <Text className="text-xl text-black dark:text-white">
          Build Exercise Page!
        </Text>
        <Text className="text-xl text-black dark:text-white">
          Exercise: {exerciseTitleParam}
        </Text>
        <Text className="text-xl text-black dark:text-white">
          Exercise Class Id: {exerciseClassIdParam}
        </Text>
        {exerciseType === exerciseEnums.RESISTANCE_ENUM ?
          <View>
            {formRows.map((inputRow, index) => {
              const stringReps = inputRow.reps.toString();
              const stringWeight = inputRow.total_weight.toString();
              const stringRest = inputRow.rest_time.toString();
              return (
                <View
                  className="mb-8 mt-8 flex-row gap-12"
                  key={inputRow.inputId}
                >
                  <View>
                    <Text className="text-xl text-black dark:text-white">
                      Reps
                    </Text>
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
                      value={stringWeight}
                      className={`border-b pb-1 ${formRows[index].total_weight ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
                    />
                  </View>
                  <View>
                    <Text className="text-xl text-black dark:text-white">
                      Rest
                    </Text>
                    <TextInput
                      inputMode="numeric"
                      value={stringRest}
                      className={`border-b pb-1 ${stringRest ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        : <View>
            <Text className="text-xl text-black dark:text-white">
              Cardio Placeholder
            </Text>
          </View>
        }
        <Pressable
          style={({ pressed }) => ({
            flexDirection: "row",
            columnGap: 14 * 0.25,
            marginTop: 3.5,
            marginBottom: 17.5,
            alignItems: "center",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <FontAwesome
            size={14 * 1.25}
            name="plus"
            color={twColors.neutral500}
          />
          <Text className="text-2xl text-black dark:text-white">Add Set</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
