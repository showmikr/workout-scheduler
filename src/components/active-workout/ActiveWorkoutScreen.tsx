import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseIds,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutExerciseEntities,
  useActiveWorkoutTitle,
} from "@/context/active-workout-provider";
import {
  StyleSheet,
  Pressable,
  SectionList,
  View,
  ViewStyle,
  Text,
  PressableProps,
} from "react-native";
import { ThemedText } from "../Themed";
import { router } from "expo-router";
import {
  ActiveSetItem,
  ActiveSetHeader,
  AddSetButton,
  LIST_CONTAINER_HORIZONTAL_MARGIN,
} from "./ActiveExerciseCard";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { colorBox } from "@/constants/Colors";

/**
 * @param contentContainerStyle controls the style of the outer container view of the child elements
 * @param style controls the style of the container for the child elements. Think of it as the button view that gets animated
 */
const CustomAnimatedButton = ({
  onPress,
  style,
  contentContainerStyle,
  children,
}: {
  onPress: () => void;
  contentContainerStyle?: PressableProps["style"];
  style?: ViewStyle;
  children: React.ReactElement;
}) => {
  // Create a shared value for scale
  const scale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  // Define the animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { translateY: (1 - scale.value) * 50 },
      ],
      opacity: buttonOpacity.value,
    };
  });

  // Handle button press
  const onPressIn = () => {
    scale.value = withTiming(0.95, {
      duration: 50,
      easing: Easing.in(Easing.quad),
    });
    buttonOpacity.value = withTiming(0.9, {
      duration: 100,
      easing: Easing.in(Easing.quad),
    });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { mass: 0.1, stiffness: 100, damping: 10 });
    buttonOpacity.value = withTiming(1, {
      duration: 50,
      easing: Easing.in(Easing.quad),
    });
  };
  return (
    <Pressable
      unstable_pressDelay={25}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={contentContainerStyle}
    >
      <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
    </Pressable>
  );
};

const AddExerciseButton = () => {
  const onPress = () => {
    router.push("/active-workout/add-exercise");
  };

  return (
    <CustomAnimatedButton onPress={onPress} style={styles.addExerciseButton}>
      <ThemedText style={styles.addExerciseText}>Add Exercise</ThemedText>
    </CustomAnimatedButton>
  );
};

const ActiveWorkoutHeader = () => {
  const workoutTitle = useActiveWorkoutTitle();
  const restingSetId = useActiveWorkoutRestingSetId();
  return (
    <View
      style={{
        marginTop: LIST_CONTAINER_HORIZONTAL_MARGIN,
        marginBottom: LIST_CONTAINER_HORIZONTAL_MARGIN * 3,
        marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
      }}
    >
      <ThemedText style={{ flex: 1, fontSize: 32, marginBottom: 16 }}>
        {workoutTitle}
      </ThemedText>
      {restingSetId !== undefined && <RestTimer />}
    </View>
  );
};

const ActiveWorkoutSectionList = () => {
  const exerciseIds = useActiveWorkoutExerciseIds();
  const exerciseEntities = useActiveWorkoutExerciseEntities();
  const sections = exerciseIds.map((id) => ({
    exerciseId: id,
    exerciseClass: exerciseEntities[id].exerciseClass,
    data: exerciseEntities[id].setIds,
  }));
  console.log("SectionList re-rendered");

  return (
    <SectionList
      ListHeaderComponent={<ActiveWorkoutHeader />}
      ListFooterComponent={<ActiveWorkoutFooter />}
      initialNumToRender={16} // This vastly improves loading performance when there are many exercises
      stickySectionHeadersEnabled={false}
      sections={sections}
      keyExtractor={(setId) => setId.toString()}
      renderItem={({ item: setId, section: { exerciseId } }) => (
        <ActiveSetItem exerciseId={exerciseId} setId={setId} />
      )}
      renderSectionHeader={({ section }) => (
        <ActiveSetHeader exerciseId={section.exerciseId} />
      )}
      renderSectionFooter={({ section }) => (
        <AddSetButton exerciseId={section.exerciseId} />
      )}
    />
  );
};

const ActiveWorkoutFooter = () => {
  const { cancelWorkout } = useActiveWorkoutActions();
  return (
    <View style={styles.footerView}>
      <AddExerciseButton />
      <View style={styles.cancelFinishButtonContainer}>
        <CustomAnimatedButton
          contentContainerStyle={{ flex: 1 }}
          style={styles.cancelWorkoutButton}
          onPress={() => cancelWorkout()}
        >
          <Text style={styles.cancelWorkoutText}>Cancel</Text>
        </CustomAnimatedButton>
        <CustomAnimatedButton
          contentContainerStyle={{ flex: 1 }}
          style={styles.finishWorkoutButton}
          onPress={() => {
            console.log("todo: implement saving workout session");
          }}
        >
          <Text style={styles.finishWorkoutText}>Finish</Text>
        </CustomAnimatedButton>
      </View>
    </View>
  );
};

const RestTimer = () => {
  const setId = useActiveWorkoutRestingSetId();
  const elapsedRest = useActiveWorkoutRestingTime() ?? 0;
  const targetRest = useActiveWorkoutSetTargetRest(setId ?? 0);
  const remainingRest = targetRest - elapsedRest;
  const minutes = Math.trunc(remainingRest / 60);
  const seconds = remainingRest % 60;
  const minutesText = minutes.toString().padStart(2, "0");
  const secondsText = seconds.toString().padStart(2, "0");
  const output = minutesText + ":" + secondsText;

  if (setId === undefined || elapsedRest === undefined) {
    return null;
  }

  return (
    <View>
      <ThemedText style={{ fontSize: 24 }}>{output}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  addExerciseButton: {
    flex: 1,
    backgroundColor: colorBox.green700,
    borderTopWidth: 1,
    borderTopColor: colorBox.green600,
    borderRadius: 20,
    paddingVertical: 6,
  },
  addExerciseText: {
    fontSize: 20,
    textAlign: "center",
  },
  footerView: {
    marginTop: 80,
    gap: 32,
    paddingHorizontal: 16,
    marginBottom: 112,
  },
  cancelWorkoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#931818",
    borderTopWidth: 1,
    borderTopColor: "#C42525",
    paddingVertical: 6,
    borderRadius: 20,
  },
  cancelWorkoutText: {
    fontSize: 20,
    color: "#FFE0D4",
  },
  finishWorkoutButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#976400",
    borderTopWidth: 1,
    borderTopColor: "#BB7C00",
    paddingVertical: 6,
    borderRadius: 20,
  },
  finishWorkoutText: {
    fontSize: 20,
    textAlign: "center",
    color: "#FFF8C2",
  },
  cancelFinishButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
  },
});

export default ActiveWorkoutSectionList;
