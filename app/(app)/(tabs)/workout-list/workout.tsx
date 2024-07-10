import { FontAwesome } from "@expo/vector-icons";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import {
  SafeAreaView,
  View,
  Pressable,
  FlatList,
  StyleSheet,
} from "react-native";
import { twColors } from "../../../../constants/Colors";
import {
  ExerciseCard,
  exerciseStyles,
} from "../../../../components/ExerciseCard";
import {
  ExerciseParams,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../../../../utils/exercise-types";
import { Text } from "../../../../components/Themed";

const AddExerciseBtn = ({
  workoutId,
  workoutTitle,
}: {
  workoutId: string;
  workoutTitle: string;
}) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        marginLeft: 14,
        marginBottom: 17.5,
        borderWidth: 1,
        opacity: pressed ? 0.7 : 1,
      })}
      onPress={() => {
        router.push({
          pathname: "/(app)/(tabs)/workout-list/add-exercise/",
          params: { workoutId: workoutId, workoutTitle: workoutTitle },
        });
      }}
    >
      <FontAwesome
        style={{ marginRight: 0.25 * 14, alignSelf: "center" }}
        name="plus"
        color={twColors.neutral500}
      />
      <Text style={{ fontSize: 1.5 * 14, lineHeight: 2 * 14 }}>
        Add Exercise
      </Text>
    </Pressable>
  );
};

export default function WorkoutDetails() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId!;
  const workoutTitle = searchParams.workoutTitle!;
  const db = useSQLiteContext();

  const exercises = db.getAllSync<ExerciseParams>(
    `
    SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id
    FROM exercise AS ex
      INNER JOIN
      exercise_class AS ex_class ON ex.exercise_class_id = ex_class.id
    WHERE ex.workout_id = ?;
    `,
    workoutId
  );

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.emptyView}>
        <Text
          style={{
            fontSize: 1.875 * 14,
            lineHeight: 2.25 * 14,
            color: twColors.neutral500,
          }}
        >
          Wow, much empty...
        </Text>
        <AddExerciseBtn workoutId={workoutId} workoutTitle={workoutTitle} />
      </SafeAreaView>
    );
  }

  const sectionData = exercises.map((ex) => {
    if (ex.exercise_type_id === exerciseEnums.RESISTANCE_ENUM) {
      return {
        exerciseType: ex.exercise_type_id,
        exercise: ex,
        data: db.getAllSync<UnifiedResistanceSet>(
          `SELECT 
            exercise_set.id AS exercise_set_id,
            exercise_set.list_order,
            exercise_set.reps,
            exercise_set.rest_time,
            exercise_set.title,
            resistance_set.id AS resistance_set_id,
            resistance_set.total_weight
            FROM exercise_set 
            INNER JOIN resistance_set ON exercise_set.id = resistance_set.exercise_set_id 
            WHERE exercise_set.exercise_id = ?`,
          ex.exercise_id
        ),
        key: ex.exercise_id.toString(),
      };
    } else {
      return {
        exerciseType: ex.exercise_type_id,
        exercise: ex,
        data: db.getAllSync<UnifiedCardioSet>(
          `SELECT
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
            WHERE exercise_set.exercise_id = ?`,
          ex.exercise_id
        ),
        key: ex.exercise_id.toString(),
      };
    }
  });

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        ListHeaderComponent={() => {
          return (
            <View
              style={{
                alignItems: "center",
                borderWidth: 1,
                paddingBottom: 1.5 * 14,
                paddingTop: 1.5 * 14,
              }}
            >
              <Text style={{ fontSize: 1.875 * 14, lineHeight: 2.25 * 14 }}>
                {workoutTitle}
              </Text>
              <View
                style={{
                  marginTop: 16,
                  width: "90%",
                  borderBottomWidth: 1,
                  borderColor: twColors.neutral700,
                  justifyContent: "flex-end",
                }}
              />
            </View>
          );
        }}
        data={sectionData}
        keyExtractor={(item) => item.exercise.exercise_id.toString()}
        renderItem={({ item }) => (
          <Link
            asChild
            style={exerciseStyles.exerciseCard}
            href={{
              pathname: "/(app)/(tabs)/workout-list/[exerciseId]",
              params: {
                exerciseId: item.exercise.exercise_id,
                workoutId: workoutId,
              },
            }}
          >
            <ExerciseCard
              workoutId={parseInt(workoutId)}
              exercise={{
                exerciseType: item.exerciseType,
                exerciseId: item.exercise.exercise_id,
                title: item.exercise.title,
                sets: item.data,
              }}
            />
          </Link>
        )}
      />
      <AddExerciseBtn workoutId={workoutId} workoutTitle={workoutTitle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
  },
  emptyView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 24,
  },
});
