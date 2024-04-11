import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  ExerciseParams,
  ExerciseSection,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../../../../../../utils/exercise-types";
import { twColors } from "../../../../../../constants/Colors";

function useExerciseData() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const db = useSQLiteContext();
  const [exerciseSection, setExerciseSection] = useState<ExerciseSection>();

  if (exerciseSection) {
    return exerciseSection;
  }

  const getExerciseSection = (exercise: ExerciseParams) =>
    db
      .getAllAsync<UnifiedResistanceSet | UnifiedCardioSet>(
        exercise.exercise_type_id === exerciseEnums.RESISTANCE_ENUM ?
          `
        SELECT 
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          resistance_set.id AS resistance_set_id,
          resistance_set.total_weight
        FROM exercise_set 
        INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?
          `
        : `
        SELECT
          exercise_set.id AS exercise_set_id,
          exercise_set.list_order,
          exercise_set.reps,
          exercise_set.rest_time,
          exercise_set.title,
          cardio_set.id AS cardio_set_id,
          cardio_set.target_distance,
          cardio_set.target_time
        FROM exercise_set 
        INNER JOIN cardio_set ON exercise_set.id = cardio_set.exercise_set_id 
        WHERE exercise_set.exercise_id = ?
          `,
        exerciseId
      )
      .then((rows) => ({
        exercise,
        data: rows,
      }))
      .catch((err) => {
        console.log(err);
      });

  db.getFirstAsync<ExerciseParams>(
    `
      SELECT ex.id as exercise_id, ex_class.exercise_type_id, ex_class.title
      FROM exercise AS ex
      INNER JOIN exercise_class as ex_class ON ex.exercise_class_id = ex_class.id
      WHERE ex.id = ?
      `,
    exerciseId
  )
    .then((exercise) => {
      if (!exercise) {
        throw new Error(
          `SQL Query Error: couldn't find exercise table row associated with id: ${exerciseId}`
        );
      }
      return {
        exercise_id: exercise.exercise_id,
        exercise_type_id: exercise.exercise_type_id,
        title: exercise.title,
      };
    })
    .then(
      (exercise) => getExerciseSection(exercise) as unknown as ExerciseSection
    )
    .then((section) => setExerciseSection(section));

  return exerciseSection;
}

export default function () {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  const exerciseSection = useExerciseData();
  // If all the exercise set data isn't fully loaded, display a loading screen
  if (!exerciseSection) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text className="text-center text-3xl text-black dark:text-white">
          Loading...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ borderWidth: 1, borderColor: "red" }}>
        <Text className="text-3xl text-black dark:text-white">
          Hello, I'm an exercise page placeholder
        </Text>
        <Text className="text-3xl text-black dark:text-white">
          Exercise ID: {exerciseId}
        </Text>
        {exerciseSection.data.map((item) => {
          return (
            <ResistanceSet
              set={item as UnifiedResistanceSet}
              key={item.exercise_set_id}
            />
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const ResistanceSet = ({ set }: { set: UnifiedResistanceSet }) => {
  return (
    <View
      style={[
        setStyles.rowContainer,
        setStyles.inline,
        { justifyContent: "space-around" },
      ]}
    >
      <View>
        <Text style={setStyles.inputLabel}>Reps</Text>
        <TextInput
          inputMode="decimal"
          value={set.reps.toString()}
          maxLength={5}
          style={[setStyles.textInput, setStyles.inertInputState]}
        />
      </View>
      <View>
        <Text style={setStyles.inputLabel}>Weight</Text>
        <View style={setStyles.inline}>
          <TextInput
            inputMode="decimal"
            value={set.total_weight.toFixed(2)}
            style={[setStyles.textInput, setStyles.inertInputState]}
          />
          <Text style={setStyles.inputLabel}>kg</Text>
        </View>
      </View>
      <View>
        <Text style={setStyles.inputLabel}>Rest</Text>
        <View style={setStyles.inline}>
          <TextInput
            inputMode="numeric"
            value={set.rest_time.toString()}
            style={[setStyles.textInput, setStyles.inertInputState]}
          />
          <Text style={setStyles.inputLabel}>s</Text>
        </View>
      </View>
    </View>
  );
};

const setStyles = StyleSheet.create({
  inputLabel: {
    fontSize: 18,
    color: "white",
    textAlign: "left",
    paddingBottom: 2,
  },
  textInput: {
    fontSize: 20,
    color: "white",
    textAlign: "right",
  },
  inline: {
    flexDirection: "row",
  },
  rowContainer: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  inertInputState: {
    backgroundColor: twColors.neutral800,
    minWidth: 32,
    borderRadius: 5,
    paddingLeft: 2,
    paddingRight: 2,
  },
  activeInputState: {
    backgroundColor: twColors.neutral100,
    color: "black",
  },
});
