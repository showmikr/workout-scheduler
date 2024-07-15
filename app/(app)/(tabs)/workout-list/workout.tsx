import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { useSQLiteContext } from "expo-sqlite/next";
import {
  SafeAreaView,
  View,
  Pressable,
  FlatList,
  StyleSheet,
  Animated,
  I18nManager,
} from "react-native";
import { twColors } from "../../../../constants/Colors";
import {
  ExerciseCard,
  exerciseStyles,
} from "../../../../components/ExerciseCard";
import {
  ExerciseParams,
  ExerciseSection,
  UnifiedCardioSet,
  UnifiedResistanceSet,
  exerciseEnums,
} from "../../../../utils/exercise-types";
import { Text } from "../../../../components/Themed";
import { MaterialIcons } from "@expo/vector-icons";
import { useOverlayParams } from "react-native-swipeable-item";
import {
  Swipeable,
  RectButton,
  SwipeableProps,
} from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import AppleStyleSwipeableRow from "../../../../components/AppleStyleSwipeableRow";

type WorkoutItem = ExerciseSection & { key: string };

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
        position: "absolute",
        right: 3 * 14,
        bottom: 2 * 14,
        alignItems: "center",
        justifyContent: "center",
        height: 4 * 14,
        width: 4 * 14,
        borderRadius: 3 * 14 * 0.8,
        borderWidth: 1,
        borderColor: twColors.neutral800,
        opacity: pressed ? 0.7 : 1,
        backgroundColor: twColors.neutral400,
      })}
      onPress={() => {
        router.push({
          pathname: "/(app)/(tabs)/workout-list/add-exercise/",
          params: { workoutId: workoutId, workoutTitle: workoutTitle },
        });
      }}
    >
      <MaterialIcons
        style={{ fontSize: 3 * 14 }}
        color={twColors.neutral700}
        name="add"
      />
    </Pressable>
  );
};

function UnderlayLeft({ onPress }: { onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "flex-end",
        backgroundColor: "red",
      }}
    >
      <Text style={{ color: "white", paddingRight: 20 }}>Delete</Text>
    </TouchableOpacity>
  );
}

function OverlayItem({ workoutId }: { workoutId: string }) {
  const { item, openDirection, close } = useOverlayParams<WorkoutItem>();
  const highlighted = useSharedValue(false);
  const onPressHandler = () => {
    if (openDirection !== "none") {
      close();
      return;
    } else {
      router.push({
        pathname: "/(app)/(tabs)/workout-list/[exerciseId]",
        params: {
          exerciseId: item.exercise.exercise_id,
          workoutId: workoutId,
        },
      });
    }
  };

  return (
    <RectButton
      onPress={() => console.log("Hello")}
      underlayColor={twColors.neutral200}
      style={{ backgroundColor: "black" }}
    >
      <Animated.View style={[exerciseStyles.exerciseCard]}>
        <ExerciseCard
          workoutId={parseInt(workoutId)}
          exercise={{
            exerciseType: item.exerciseType,
            exerciseId: item.exercise.exercise_id,
            title: item.exercise.title,
            sets: item.data,
          }}
        />
      </Animated.View>
    </RectButton>
  );
}

export default function WorkoutDetails() {
  // TODO: Refactor hacky fix of 'value!' to deal with undefined search params
  const searchParams = useLocalSearchParams<{
    workoutId: string;
    workoutTitle: string;
  }>();
  const workoutId = searchParams.workoutId!;
  const workoutTitle = searchParams.workoutTitle!;
  if (!workoutId || !workoutTitle) {
    throw new Error("Workout ID or title not provided. This should not happen");
  }

  const [sectionData, setSectionData] = useState<WorkoutItem[]>([]);
  const db = useSQLiteContext();
  const swipeableRowRefs = useRef<Map<string, Swipeable | null>>(new Map());

  useEffect(() => {
    const fetchData = () => {
      const fetchedExercises = db.getAllSync<ExerciseParams>(
        `
        SELECT ex.id AS exercise_id, ex_class.title, ex_class.exercise_type_id
        FROM exercise AS ex
          INNER JOIN
          exercise_class AS ex_class ON ex.exercise_class_id = ex_class.id
        WHERE ex.workout_id = ?;
        `,
        workoutId
      );

      if (fetchedExercises.length > 0) {
        const newSectionData = fetchedExercises.map((ex) => {
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
        setSectionData(newSectionData);
      }
    };

    fetchData();
  }, []);

  const renderRightAction = (
    text: string,
    color: string,
    x: number,
    progress: Animated.AnimatedInterpolation<number>,
    onPress?: () => void
  ) => {
    const trans = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [x, 0],
      extrapolate: "clamp",
    });
    return (
      <Animated.View style={{ flex: 1, transform: [{ translateX: trans }] }}>
        <RectButton
          style={[styles.rightAction, { backgroundColor: color }]}
          onPress={onPress}
        >
          <Text style={styles.actionText}>{text}</Text>
        </RectButton>
      </Animated.View>
    );
  };

  const renderRightActions: SwipeableProps["renderRightActions"] = (
    progress: Animated.AnimatedInterpolation<number>,
    _dragAnimatedValue: Animated.AnimatedInterpolation<number>,
    _swipeable: Swipeable
  ) => (
    <View
      style={{
        width: "25%",
        flexDirection: I18nManager.isRTL ? "row-reverse" : "row",
      }}
    >
      {renderRightAction("Delete", "#dd2c00", 64, progress)}
    </View>
  );

  if (sectionData.length === 0) {
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

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <FlatList
        ItemSeparatorComponent={() => (
          <View
            style={{
              borderTopColor: twColors.neutral700,
              borderTopWidth: StyleSheet.hairlineWidth,
              width: "90%",
              alignSelf: "center",
              backgroundColor: twColors.neutral700,
            }}
          />
        )}
        ListFooterComponent={
          <View style={{ marginTop: 4 * 14, marginBottom: 4 * 14 }}></View>
        }
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
          <Swipeable
            ref={(ref) => {
              swipeableRowRefs.current.set(item.key, ref);
            }}
            friction={1.5}
            enableTrackpadTwoFingerGesture
            dragOffsetFromLeftEdge={30}
            leftThreshold={30}
            rightThreshold={30}
            renderRightActions={renderRightActions}
            renderLeftActions={(_progress, dragX) => {
              const trans = dragX.interpolate({
                inputRange: [0, 50, 100, 101],
                outputRange: [-50, 0, 0, 1],
                extrapolate: "clamp",
              });
              return (
                <RectButton
                  style={styles.leftAction}
                  onPress={() =>
                    swipeableRowRefs.current?.get(item.key)?.close()
                  }
                >
                  <Animated.Text
                    style={[
                      styles.actionText,
                      {
                        transform: [{ translateX: trans }],
                      },
                    ]}
                  >
                    Archive
                  </Animated.Text>
                </RectButton>
              );
            }}
            onSwipeableOpen={(direction) => {
              console.log(`Opening swipeable from the ${direction}`);
            }}
            onSwipeableClose={(direction) => {
              console.log(`Closing swipeable to the ${direction}`);
            }}
          >
            <Pressable
              onPress={() => {
                router.push({
                  pathname: "/(app)/(tabs)/workout-list/[exerciseId]",
                  params: {
                    exerciseId: item.exercise.exercise_id,
                    workoutId: workoutId,
                  },
                });
              }}
              style={[
                exerciseStyles.exerciseCard,
                {
                  backgroundColor: "black",
                },
              ]}
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
            </Pressable>
          </Swipeable>
        )}
      />
      <AddExerciseBtn workoutId={workoutId} workoutTitle={workoutTitle} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    width: 192,
    // flex: 1,
    backgroundColor: "#497AFC",
    justifyContent: "center",
  },
  rightAction: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  actionText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "transparent",
    padding: 10,
  },
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
