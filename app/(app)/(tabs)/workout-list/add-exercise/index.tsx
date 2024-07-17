import { useSQLiteContext } from "expo-sqlite/next";
import {
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  useColorScheme,
} from "react-native";
import { Link, useLocalSearchParams } from "expo-router";
import {
  addExercise,
  AddExerciseCardParams,
  getExerciseClasses,
} from "../../../../../utils/query-exercises";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { View, Text } from "../../../../../components/Themed";

export default function AddExerciseIndex() {
  const colorScheme = useColorScheme();
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId;
  const workoutTitle = searchParams.workoutTitle;
  if (!workoutId) {
    throw new Error(
      `workoutId or workoutTitle is undefined. This should never happen. \
      workoutId: ${workoutId}, workoutTitle: ${workoutTitle}`
    );
  }

  const db = useSQLiteContext();
  const queryClient = useQueryClient();
  // TODO: handle when query errors out
  const { data: exerciseClasses, isLoading } = useQuery({
    queryKey: ["add-exercise-list", workoutId],
    queryFn: () => getExerciseClasses(db),
  });

  const addExerciseMutation = useMutation({
    mutationFn: ({
      exerciseClass,
    }: {
      exerciseClass: AddExerciseCardParams;
    }) => {
      return addExercise(db, workoutId, exerciseClass);
    },
    onError: (error) => {
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["exercise-sections", workoutId],
      });
    },
  });

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingView}>
        <View style={[styles.loadingView, { flexDirection: "row" }]}>
          <ActivityIndicator style={styles.loadingSpinner} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {exerciseClasses && exerciseClasses.length > 0 ?
        exerciseClasses.map((exerciseClass) => (
          <Link
            href={{
              pathname: "/workout-list/workout",
              params: { workoutId: workoutId, workoutTitle: workoutTitle },
            }}
            key={exerciseClass.id}
            style={[
              styles.exerciseLink,
              { color: colorScheme === "dark" ? "white" : "black" },
            ]}
            onPress={() => {
              addExerciseMutation.mutate({ exerciseClass });
            }}
          >
            {exerciseClass.title}
          </Link>
        ))
      : <Text
          style={[
            styles.loadingText,
            { color: colorScheme === "dark" ? "white" : "black" },
          ]}
        >
          Loading...
        </Text>
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  exerciseLink: {
    paddingBottom: 0.5 * 14,
    paddingTop: 0.5 * 14,
    paddingLeft: 14,
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingText: {
    fontSize: 1.875 * 14,
    lineHeight: 2.25 * 14,
  },
  loadingView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingSpinner: { paddingRight: 14, height: 2.25 * 14 },
});
