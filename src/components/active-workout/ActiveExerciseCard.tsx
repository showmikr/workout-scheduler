import { CardOptionsUnderlay } from "@/components/CardUnderlay";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { colorBox, figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutExercise,
  useActiveWorkoutSetIsCompleted,
  useActiveWorkoutSetReps,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutSetWeight,
} from "@/context/active-workout-provider";
import { immediateDebounce } from "@/utils/debounce-utils";
import { FontAwesome6 } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Pressable, Keyboard } from "react-native";
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
  return (
    <View style={styles.cardContainer}>
      <ThemedText style={{ fontSize: 24 }}>Id: {exerciseId}</ThemedText>
      <ThemedText style={{ fontSize: 24 }}>
        ExerciseClassId: {exerciseClassId}
      </ThemedText>
      <ActiveSetHeader />
      {setIds.map((setId) => (
        <ActiveSetItem key={setId} exerciseId={exerciseId} setId={setId} />
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
          size={CHECKMARK_ICON_SIZE}
          color={figmaColors.greyLighter}
        />
      </View>
    </View>
  );
};

const ActiveSetItem = ({
  exerciseId,
  setId,
}: {
  exerciseId: number;
  setId: number;
}) => {
  const { deleteSet } = useActiveWorkoutActions();
  const debouncedDelete = useCallback(
    immediateDebounce(() => deleteSet(exerciseId, setId), 100),
    [exerciseId, setId]
  );
  return (
    <Swipeable
      renderRightActions={(_progress, dragX) => (
        <CardOptionsUnderlay dragX={dragX} onPress={debouncedDelete} />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
      childrenContainerStyle={{ flex: 1 }}
      containerStyle={{ flexDirection: "row" }}
    >
      <View style={styles.setContainer}>
        <RestCelll setId={setId} />
        <WeightCell setId={setId} />
        <RepsCell setId={setId} />
        <CheckboxCell setId={setId} />
      </View>
    </Swipeable>
  );
};

const WeightCell = ({ setId }: { setId: number }) => {
  const { changeWeight } = useActiveWorkoutActions();
  const weight = useActiveWorkoutSetWeight(setId);
  return (
    <View style={styles.dataCell}>
      <ThemedTextInput
        numberOfLines={1}
        maxLength={5}
        inputMode="decimal"
        placeholder={weight.toString()}
        value={weight.toString()}
        returnKeyType="done"
        style={styles.dataText}
        onChangeText={(text) => {
          console.log("onChangeText", text);
          changeWeight(setId, parseInt(text));
        }}
      />
    </View>
  );
};

const RepsCell = ({ setId }: { setId: number }) => {
  const { changeReps } = useActiveWorkoutActions();
  const reps = useActiveWorkoutSetReps(setId);
  return (
    <View style={styles.dataCell}>
      <ThemedTextInput
        numberOfLines={1}
        maxLength={6}
        inputMode="numeric"
        placeholder={reps.toString()}
        value={reps.toString()}
        returnKeyType="done"
        style={styles.dataText}
        onChangeText={(text) => {
          console.log("onChangeText", text);
          changeReps(setId, parseInt(text));
        }}
      />
    </View>
  );
};

const DIGITS_SET = new Set(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]);
const RestCelll = ({ setId }: { setId: number }) => {
  // TODO: Implement logic for changing rest
  const cursorRange = { start: 5, end: 5 };
  const rest = useActiveWorkoutSetTargetRest(setId);
  const minutes = Math.trunc(rest / 60);
  const seconds = rest - (minutes * 60);
  const minutesString = minutes < 10 ? '0' + String(minutes) : String(minutes);
  const secondsString = seconds < 10 ? '0' + String(seconds) : String(seconds);
  const [digitChars, setDigitChars] = useState([...minutesString, ...secondsString]);
  const textOutput = digitChars[0] + digitChars[1] + ":" + digitChars[2] + digitChars[3];

  return (
    <View style={styles.dataCell}>
      <ThemedTextInput
        numberOfLines={1}
        maxLength={5}
        inputMode="numeric"
        placeholder={rest.toString()}
        value={textOutput}
        selection={cursorRange}
        returnKeyType="done"
        style={styles.dataText}
        onKeyPress={(e) => {
          const key = e.nativeEvent.key
          if (DIGITS_SET.has(key)) {
            setDigitChars([...digitChars.slice(1), key]);
          } else if (key === "Backspace") {
            setDigitChars(['0', ...digitChars.slice(0, -1)])
          }
        }}
      />
    </View>
  );
};

const CheckboxCell = ({ setId }: { setId: number }) => {
  const isCompleted = useActiveWorkoutSetIsCompleted(setId);
  return (
    <View
      style={[
        styles.checkBox,
        {
          backgroundColor:
            isCompleted ? figmaColors.orangeAccent : colorBox.grey800,
        },
      ]}
    />
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
/// The size of the checkmark icon, calculated as a fraction of the minimum row item height.
const CHECKMARK_ICON_SIZE = Math.floor((2 / 3) * ROW_ITEM_MIN_HEIGHT);
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
    aspectRatio: 1,
    height: ROW_ITEM_MIN_HEIGHT,
    alignItems: "center",
  },
  checkBox: {
    aspectRatio: 1,
    height: ROW_ITEM_MIN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 4,
    borderWidth: 1,
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
