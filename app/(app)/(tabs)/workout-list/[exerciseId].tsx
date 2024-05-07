import {
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TextInput,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { SQLiteDatabase, useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";
import {
  CardioSection,
  ExerciseParams,
  ExerciseSection,
  ResistanceSection,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../../../../utils/exercise-types";
import { twColors } from "../../../../constants/Colors";
import { useMutation } from "@tanstack/react-query";

function useExerciseData() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{ exerciseId: string }>();
  const exerciseId = searchParams.exerciseId!;

  const db = useSQLiteContext();
  const [exerciseSection, setExerciseSection] = useState<ExerciseSection>();

  if (exerciseSection) {
    return exerciseSection;
  }

  const getResistanceSection = async (
    exercise: ExerciseParams
  ): Promise<ResistanceSection> => {
    return db
      .getAllAsync<UnifiedResistanceSet>(
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
        `,
        exercise.exercise_id
      )
      .then((rows) => ({
        exerciseType: exerciseEnums.RESISTANCE_ENUM,
        exercise,
        data: rows,
      }));
  };

  const getCardioSection = async (
    exercise: ExerciseParams
  ): Promise<CardioSection> => {
    return db
      .getAllAsync<UnifiedCardioSet>(
        `
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
        exercise.exercise_id
      )
      .then((rows) => ({
        exerciseType: exerciseEnums.CARDIO_ENUM,
        exercise,
        data: rows,
      }));
  };

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
      (exercise) =>
        (exercise.exercise_type_id === exerciseEnums.RESISTANCE_ENUM ?
          getResistanceSection(exercise)
        : getCardioSection(exercise)) as Promise<ExerciseSection>
    )
    .then((section) => setExerciseSection(section));

  return exerciseSection;
}

export default function () {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{ exerciseId: string }>();
  const exerciseId = searchParams.exerciseId!;

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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0D0D0D" }}>
      <ScrollView>
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

const ResistanceSet = ({ set }: { set: UnifiedResistanceSet }) => {
  const db = useSQLiteContext();
  const weightMutation = useMutation({
    mutationFn: (argsObject: SetWeightArgs) => {
      return updateResistanceSetWeight(argsObject);
    },
    onError: (error) => {
      console.log(error);
    },
    onSuccess: (data) => {
      console.log("Updated Exercise Set Weight!", data.total_weight);
    },
  });
  const [weightString, setWeightString] = useState(
    set.total_weight.toFixed(2).toString()
  );

  return (
    <View
      style={[
        setStyles.rowContainer,
        setStyles.inline,
        {
          borderWidth: 1,
          borderColor: "red",
          flex: 1,
          justifyContent: "space-around",
        },
      ]}
    >
      <View style={{ maxWidth: 100 }}>
        <Text style={setStyles.inputLabel}>Reps</Text>
        <TextInput
          inputMode="numeric"
          value={set.reps.toString()}
          maxLength={5}
          style={[setStyles.textInput, setStyles.inertInputState]}
        />
      </View>
      <View style={{ maxWidth: 100 }}>
        <Text style={setStyles.inputLabel}>Weight</Text>
        <View style={setStyles.inline}>
          <TextInput
            inputMode="decimal"
            value={weightString}
            maxLength={5}
            style={[setStyles.textInput, setStyles.inertInputState]}
            onChangeText={(text) => {
              setWeightString(text);
            }}
            onEndEditing={(e) => {
              // if the changed input is the same as our initial state, don't update the db
              if (Number(e.nativeEvent.text) === set.total_weight) return;
              weightMutation.mutate({
                db,
                resistanceSetId: set.resistance_set_id,
                weight: Number(e.nativeEvent.text),
              });
            }}
          />
          <Text style={setStyles.unitsLabel}>kg</Text>
        </View>
      </View>
      <View style={{ maxWidth: 100 }}>
        <Text style={setStyles.inputLabel}>Rest</Text>
        <View style={setStyles.inline}>
          <TextInput
            inputMode="numeric"
            value={set.rest_time.toString()}
            style={[setStyles.textInput, setStyles.inertInputState]}
          />
          <Text style={setStyles.unitsLabel}>s</Text>
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
