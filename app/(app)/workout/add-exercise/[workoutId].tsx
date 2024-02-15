import { useSQLiteContext } from "expo-sqlite/next";
import {
  CardioSetParams,
  exerciseEnums,
  ExerciseSetParams,
  ResistanceSetParams,
} from "../[workoutId]";
import { useState } from "react";
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
import { twColors } from "../../../../constants/Colors";

type ExerciseSetInput = Pick<ExerciseSetParams, "reps" | "rest_time" | "title">;
type ResistanceSetInput = Pick<ResistanceSetParams, "total_weight"> &
  ExerciseSetInput;
type CardioSetInput = Pick<
  CardioSetParams,
  "target_distance" | "target_speed" | "target_time"
> &
  ExerciseSetInput;
type ResistanceInputForm = {
  exerciseType: typeof exerciseEnums.RESISTANCE_ENUM;
  formRows: ResistanceSetInput[];
};
type CardioInputForm = {
  exerciseType: typeof exerciseEnums.CARDIO_ENUM;
  formRows: CardioSetInput[];
};
type ExerciseInputForm = (ResistanceInputForm | CardioInputForm) & {
  exerciseTitle: string;
};

export default function AddExerciseComponent() {
  const db = useSQLiteContext();
  const [exerciseInputForm, setExerciseInputForm] = useState<ExerciseInputForm>(
    {
      exerciseTitle: "",
      exerciseType: exerciseEnums.RESISTANCE_ENUM,
      formRows: [{ title: "", reps: 1, rest_time: 0, total_weight: 0 }],
    }
  );
  const { exerciseType, exerciseTitle, formRows } = exerciseInputForm;
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
          <Pressable
            disabled={exerciseType === exerciseEnums.RESISTANCE_ENUM}
            style={[
              styles.exerciseTypeBtn,
              exerciseType === exerciseEnums.RESISTANCE_ENUM &&
                styles.selectedExerciseBtn,
            ]}
            onPress={() => {
              setExerciseInputForm({
                ...exerciseInputForm,
                exerciseType: exerciseEnums.RESISTANCE_ENUM,
                formRows: [],
              });
            }}
          >
            <Text
              style={
                exerciseType === exerciseEnums.RESISTANCE_ENUM &&
                styles.selectedExerciseText
              }
              className="text-center text-xl text-black dark:text-white"
            >
              Resistance
            </Text>
          </Pressable>
          <Pressable
            disabled={
              exerciseInputForm.exerciseType === exerciseEnums.CARDIO_ENUM
            }
            style={[
              styles.exerciseTypeBtn,
              exerciseType === exerciseEnums.CARDIO_ENUM &&
                styles.selectedExerciseBtn,
            ]}
            onPress={() => {
              setExerciseInputForm({
                ...exerciseInputForm,
                exerciseType: exerciseEnums.CARDIO_ENUM,
                formRows: [],
              });
            }}
          >
            <Text
              style={
                exerciseType === exerciseEnums.CARDIO_ENUM &&
                styles.selectedExerciseText
              }
              className="text-center text-xl text-black dark:text-white"
            >
              Cardio
            </Text>
          </Pressable>
        </View>
        <Text className="text-2xl font-bold dark:text-white">Title:</Text>
        <TextInput
          value={exerciseInputForm.exerciseTitle}
          onChangeText={(text) =>
            setExerciseInputForm({ ...exerciseInputForm, exerciseTitle: text })
          }
          className={` border-b pb-1 ${exerciseInputForm.exerciseTitle ? "border-neutral-600" : "border-neutral-700"} text-2xl dark:text-white`}
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
