import { CardOptionsUnderlay } from "@/components/CardUnderlay";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { colorBox, figmaColors } from "@/constants/Colors";
import {
  ActiveSet,
  useActiveWorkoutActions,
  useActiveWorkoutExercise,
  useActiveWorkoutSetEntitiesByIds,
} from "@/context/active-workout-provider";
import { immediateDebounce } from "@/utils/debounce-utils";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCallback } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSpring,
} from "react-native-reanimated";

const ActiveExerciseCard = ({ exerciseId }: { exerciseId: number }) => {
  console.log(`${exerciseId} rendered`);
  const { exerciseClassId, setIds } = useActiveWorkoutExercise(exerciseId);
  const activeSets = useActiveWorkoutSetEntitiesByIds(setIds);
  return (
    <View style={styles.cardContainer}>
      <ThemedText style={{ fontSize: 24 }}>Id: {exerciseId}</ThemedText>
      <ThemedText style={{ fontSize: 24 }}>
        ExerciseClassId: {exerciseClassId}
      </ThemedText>
      <ActiveSetHeader />
      {activeSets.map((set) => (
        <ActiveSetItem key={set.id} exerciseId={exerciseId} set={set} />
      ))}
      <AddSetButton exerciseId={exerciseId} />
    </View>
  );
};

const ActiveSetHeader = () => {
  return (
    <View style={styles.setsHeaderContainer}>
      <ThemedText style={styles.headerText}>Rest</ThemedText>
      <ThemedText style={styles.headerText}>Kg</ThemedText>
      <ThemedText style={styles.headerText}>Reps</ThemedText>
      <View style={styles.headerCheckBox}>
        <FontAwesome6
          name="check"
          size={CHECK_ICON_SIZE}
          color={figmaColors.greyLighter}
        />
      </View>
    </View>
  );
};

const ActiveSetItem = ({
  exerciseId,
  set,
}: {
  exerciseId: number;
  set: ActiveSet;
}) => {
  const { deleteSet, changeReps } = useActiveWorkoutActions();
  const debouncedDelete = useCallback(
    immediateDebounce(() => deleteSet(exerciseId, set.id), 100),
    [exerciseId, set.id]
  );
  return (
    <Swipeable
      renderRightActions={(_progress, dragX) => (
        <CardOptionsUnderlay dragX={dragX} onPress={debouncedDelete} />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
      containerStyle={{ width: "100%" }}
    >
      <View style={styles.setContainer}>
        <View style={styles.dataCell}>
          <ThemedText style={styles.dataText}>{set.targetRest}</ThemedText>
        </View>
        <View style={styles.dataCell}>
          <ThemedText
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.dataText}
          >
            {set.weight}
          </ThemedText>
        </View>
        <View style={styles.dataCell}>
          <ThemedTextInput
            numberOfLines={1}
            maxLength={6}
            inputMode="numeric"
            placeholder={set.reps.toString()}
            returnKeyType="done"
            style={styles.dataText}
            onChangeText={(text) => {
              console.log("onChangeText", text);
              changeReps(set.id, parseInt(text));
            }}
            value={set.reps.toString()}
          />
        </View>
        <View
          style={[
            styles.checkBox,
            {
              backgroundColor:
                set.isCompleted ? figmaColors.orangeAccent : colorBox.grey800,
            },
          ]}
        />
      </View>
    </Swipeable>
  );
};

const AddSetButton = ({ exerciseId }: { exerciseId: number }) => {
  // Create a shared value for scale
  const scale = useSharedValue(1);
  const buttonOpacity = useSharedValue(1);

  const { addSet } = useActiveWorkoutActions();

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

  const onPress = () => {
    addSet(exerciseId);
  };

  return (
    <Pressable
      unstable_pressDelay={25}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      onPress={onPress}
      style={{ flexDirection: "row" }}
    >
      <Animated.View style={[styles.addSetButton, animatedStyle]}>
        <ThemedText style={styles.addSetText}>Add Set</ThemedText>
      </Animated.View>
    </Pressable>
  );
};

const ROW_ITEM_MIN_HEIGHT = 28;
const CHECK_ICON_SIZE = Math.floor((2 / 3) * ROW_ITEM_MIN_HEIGHT);
const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "flex-start",
  },
  setContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    gap: 24,
  },
  setsHeaderContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 12,
    marginBottom: -8,
  },
  headerText: {
    flex: 1,
    color: figmaColors.greyLighter,
    fontSize: 16,
    fontWeight: "500",
  },
  dataCell: {
    flex: 1,
    backgroundColor: figmaColors.primaryWhite,
    borderRadius: 4,
  },
  dataText: {
    fontSize: 20,
    color: figmaColors.primaryBlack,
    textAlign: "center",
  },
  headerCheckBox: {
    width: ROW_ITEM_MIN_HEIGHT,
    height: ROW_ITEM_MIN_HEIGHT,
    alignItems: "center",
  },
  checkBox: {
    width: ROW_ITEM_MIN_HEIGHT,
    height: ROW_ITEM_MIN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
    borderBottomColor: figmaColors.greyDarkBorder,
  },
  addSetButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colorBox.green700,
    borderTopColor: colorBox.green600,
    borderTopWidth: 1,
    borderRadius: 4,
    marginVertical: 12,
    paddingVertical: 4,
  },
  addSetText: {
    fontSize: 20,
    color: colorBox.green000,
  },
});

export default ActiveExerciseCard;
