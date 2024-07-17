import { useSQLiteContext } from "expo-sqlite/next";
import { useReducer } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { twColors } from "@/constants/Colors";
import {
  CardioSetParams,
  ExerciseEnums,
  ExerciseSetParams,
  ResistanceSetParams,
  exerciseEnums,
} from "@/utils/exercise-types";

type ExerciseSetInput = Pick<ExerciseSetParams, "reps" | "rest_time" | "title">;
type ResistanceSetInput = Pick<ResistanceSetParams, "total_weight"> &
  ExerciseSetInput;
type CardioSetInput = Pick<CardioSetParams, "target_distance" | "target_time"> &
  ExerciseSetInput;
type ResistanceInputForm = {
  exerciseType: ExerciseEnums["RESISTANCE_ENUM"];
  formRows: ResistanceSetInput[];
  exerciseTitle: string;
};
type CardioInputForm = {
  exerciseType: ExerciseEnums["CARDIO_ENUM"];
  formRows: CardioSetInput[];
  exerciseTitle: string;
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
  | { type: "toggle_exercise_type" }
  | { type: "change_exercise_title"; newTitle: string };

const blankResistanceFormState: ExerciseInputForm<
  ExerciseEnums["RESISTANCE_ENUM"]
> = {
  exerciseTitle: "",
  exerciseType: exerciseEnums.RESISTANCE_ENUM,
  formRows: [
    {
      title: "",
      reps: 0,
      rest_time: 0,
      total_weight: 0,
    },
  ],
};

const blankCardioFormState: ExerciseInputForm<ExerciseEnums["CARDIO_ENUM"]> = {
  exerciseTitle: "",
  exerciseType: exerciseEnums.CARDIO_ENUM,
  formRows: [
    {
      title: "",
      reps: 1,
      rest_time: 0,
      target_distance: 10,
      target_time: 0,
    },
  ],
};

function ExerciseFormReducer(
  state: ExerciseInputForm,
  action: ExerciseInputFormAction
): ExerciseInputForm {
  switch (action.type) {
    case "toggle_exercise_type": {
      const { exerciseType: currentType } = state;
      const newData =
        currentType === exerciseEnums.RESISTANCE_ENUM ?
          blankCardioFormState
        : blankResistanceFormState;
      return newData;
    }
    case "change_exercise_title": {
      return {
        ...state,
        exerciseTitle: action.newTitle,
      };
    }
    default:
      const _unreachableCase: never = action;
      return _unreachableCase;
  }
}

export default function AddExerciseComponent() {
  const db = useSQLiteContext();
  const [exerciseFormState, exerciseFormDispatch] = useReducer(
    ExerciseFormReducer,
    blankResistanceFormState
  );
  const { exerciseType, exerciseTitle, formRows } = exerciseFormState;
  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="ml-4 mr-4 mt-4 flex-1">
        <Text className="text-2xl font-bold text-black dark:text-white">
          Exercise Type:
        </Text>
        <View
          style={{ columnGap: 14 * 2 }}
          className="flex-1 flex-row items-baseline"
        >
          {Object.values(exerciseEnums).map((buttonType) => (
            <ExerciseTypeToggle
              key={buttonType}
              expectedType={buttonType}
              currentType={exerciseType}
              dispatch={exerciseFormDispatch}
            />
          ))}
        </View>
        <Text className="text-2xl font-bold dark:text-white">Title:</Text>
        <TextInput
          value={exerciseTitle}
          onChangeText={(text) =>
            exerciseFormDispatch({
              type: "change_exercise_title",
              newTitle: text,
            })
          }
          className={`border-b pb-1 ${exerciseTitle ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
          placeholder="Add exercise title here"
        />
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

type ExerciseTypeToggleProps = {
  expectedType: ExerciseEnums[keyof ExerciseEnums];
  currentType: ExerciseEnums[keyof ExerciseEnums];
  dispatch: React.Dispatch<ExerciseInputFormAction>;
};
function ExerciseTypeToggle({
  expectedType,
  currentType,
  dispatch,
}: ExerciseTypeToggleProps) {
  return (
    <Pressable
      disabled={expectedType === currentType}
      style={[
        styles.exerciseTypeBtn,
        expectedType === currentType && styles.selectedExerciseBtn,
      ]}
      onPress={() => dispatch({ type: "toggle_exercise_type" })}
    >
      <Text
        style={expectedType === currentType && styles.selectedExerciseText}
        className="text-center text-xl text-black dark:text-white"
      >
        {expectedType === exerciseEnums.RESISTANCE_ENUM ?
          "Resistance"
        : "Cardio"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  exerciseTypeBtn: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 14 * 0.25,
  },
  selectedExerciseBtn: {
    borderRadius: 14 * 0.5,
    borderWidth: 1,
    backgroundColor: twColors.neutral300,
  },
  selectedExerciseText: {
    fontWeight: "bold",
    color: twColors.neutral900,
  },
});
