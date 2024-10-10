import { CardOptionsUnderlay } from "@/components/CardUnderlay";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { colorBox, figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutExercise,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutSetIsCompleted,
  useActiveWorkoutSetReps,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutSetWeight,
} from "@/context/active-workout-provider";
import { immediateDebounce } from "@/utils/debounce-utils";
import { FontAwesome6 } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  Easing,
  withTiming,
  withSpring,
  useDerivedValue,
} from "react-native-reanimated";

const ActiveExerciseCard = ({ exerciseId }: { exerciseId: number }) => {
  console.log(`${exerciseId} rendered`);
  const {
    exerciseClass: { id: exerciseClassId, title },
    setIds,
  } = useActiveWorkoutExercise(exerciseId);
  return (
    <View style={styles.cardContainer}>
      <ThemedText
        style={{
          fontSize: 24,
          fontWeight: 600,
        }}
      >
        {title}
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
        <RestCell setId={setId} />
        <WeightCell setId={setId} />
        <RepsCell setId={setId} />
        <CheckboxCell setId={setId} />
      </View>
    </Swipeable>
  );
};

const WEIGHT_REGEX = /^\d*\.?\d+/;
const WeightCell = ({ setId }: { setId: number }) => {
  const { changeWeight } = useActiveWorkoutActions();
  const weight = useActiveWorkoutSetWeight(setId);
  const [weightText, setWeightText] = useState(() => weight.toString());
  return (
    <ThemedTextInput
      numberOfLines={1}
      maxLength={6}
      inputMode="decimal"
      value={weightText}
      returnKeyType="done"
      style={[styles.dataCell, styles.dataText]}
      onChangeText={(text) => {
        setWeightText(text);
      }}
      onEndEditing={(e) => {
        const parsedWeight = Number(
          e.nativeEvent.text.match(WEIGHT_REGEX)?.at(0) ?? "0"
        );
        const truncatedWeight = Math.round(parsedWeight * 10) / 10;
        setWeightText(truncatedWeight.toString());
        changeWeight(setId, truncatedWeight);
      }}
    />
  );
};

const REPS_REGEX = /^0*(\d+)/;
const RepsCell = ({ setId }: { setId: number }) => {
  const { changeReps } = useActiveWorkoutActions();
  const reps = useActiveWorkoutSetReps(setId);
  const [repsText, setRepsText] = useState(() => reps.toString());
  return (
    <ThemedTextInput
      numberOfLines={1}
      maxLength={3}
      inputMode="numeric"
      value={repsText}
      returnKeyType="done"
      style={[styles.dataCell, styles.dataText]}
      onChangeText={(text) => {
        const matchedText = text.match(REPS_REGEX)?.at(0) ?? "";
        setRepsText(matchedText);
      }}
      onEndEditing={() => {
        const parsedReps = Number(repsText); // Note, Number(<empty string>) = 0
        setRepsText(parsedReps.toString());
        changeReps(setId, parsedReps);
      }}
    />
  );
};

const SINGLE_DIGIT_REGEX = /^\d$/;
const RestCell = ({ setId }: { setId: number }) => {
  const cursorRange = { start: 5, end: 5 };
  const rest = useActiveWorkoutSetTargetRest(setId);
  const restingSetId = useActiveWorkoutRestingSetId();
  const { changeRest } = useActiveWorkoutActions();
  const minutes = Math.trunc(rest / 60);
  const seconds = rest - minutes * 60;
  const minutesString = minutes.toString().padStart(2, "0");
  const secondsString = seconds.toString().padStart(2, "0");
  const [digitChars, setDigitChars] = useState([
    ...minutesString,
    ...secondsString,
  ]);
  const textOutput =
    digitChars[0] + digitChars[1] + ":" + digitChars[2] + digitChars[3];

  if (restingSetId === setId) {
    return <RestCountdown setId={setId} />;
  }

  return (
    <ThemedTextInput
      editable={setId !== restingSetId}
      numberOfLines={1}
      maxLength={5}
      inputMode="numeric"
      value={textOutput}
      selection={cursorRange}
      returnKeyType="done"
      style={[styles.dataCell, styles.dataText]}
      onKeyPress={(e) => {
        const key = e.nativeEvent.key;
        const digitPressed = key.match(SINGLE_DIGIT_REGEX)?.at(0) !== undefined;
        if (digitPressed) {
          setDigitChars([...digitChars.slice(1), key]);
        } else if (key === "Backspace") {
          setDigitChars(["0", ...digitChars.slice(0, -1)]);
        }
      }}
      onEndEditing={() => {
        // handle seconds overflow
        const minutes = parseInt(digitChars[0] + digitChars[1]);
        const seconds = parseInt(digitChars[2] + digitChars[3]);
        const secondsOverflow = seconds - 59;
        if (secondsOverflow > 0) {
          const adjustedOverflow = minutes >= 99 ? 59 : secondsOverflow;
          const adjustedMinutes = Math.min(minutes + 1, 99);
          const minutesString = adjustedMinutes.toString().padStart(2, "0");
          const secondsString = adjustedOverflow.toString().padStart(2, "0");
          const [minutesArray, secondsArray] = [
            [...minutesString],
            [...secondsString],
          ];
          changeRest(setId, adjustedMinutes * 60 + adjustedOverflow);
          setDigitChars([...minutesArray, ...secondsArray]);
        } else {
          changeRest(setId, minutes * 60 + seconds);
        }
      }}
    />
  );
};

const RestCountdown = ({ setId }: { setId: number }) => {
  const elapsedRest = useActiveWorkoutRestingTime();
  const targetRest = useActiveWorkoutSetTargetRest(setId);
  const containerWidth = useSharedValue(0);
  const containerHeight = useSharedValue(0);
  const offset = useSharedValue(-82);
  // const rightPos = useDerivedValue(() => containerWidth.value - offset.value);

  const slidingWindowStyles = useAnimatedStyle(() => ({
    left: offset.value,
    width: containerWidth.value,
    height: containerHeight.value,
  }));

  useEffect(() => {
    console.log("What");
    offset.value = withTiming(0, {
      duration: targetRest * 1000,
      easing: Easing.inOut(Easing.linear),
    });
  }, []);

  if (elapsedRest === undefined) {
    console.warn("Trying to render countdownTime in set that is NOT resting");
    return null;
  }
  const remainingRest = targetRest - elapsedRest;
  const minutes = Math.trunc(remainingRest / 60);
  const seconds = remainingRest % 60;
  const minutesText = minutes.toString().padStart(2, "0");
  const secondsText = seconds.toString().padStart(2, "0");
  return (
    <MaskedView
      style={{ flex: 1 }}
      onLayout={(e) => {
        containerWidth.value = e.nativeEvent.layout.width;
        containerHeight.value = e.nativeEvent.layout.height;
      }}
      maskElement={<View style={styles.dataCell} />}
    >
      <View style={{ backgroundColor: styles.dataCell.backgroundColor }}>
        <ThemedText style={[styles.dataText, { zIndex: 1 }]}>
          {minutesText + ":" + secondsText}
        </ThemedText>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              backgroundColor: "#4db8ff",
            },
            slidingWindowStyles,
          ]}
        />
      </View>
    </MaskedView>
  );
};

const CheckboxCell = ({ setId }: { setId: number }) => {
  const isCompleted = useActiveWorkoutSetIsCompleted(setId);
  const { toggleSetDone } = useActiveWorkoutActions();
  return (
    <Pressable
      hitSlop={24}
      onPress={() => toggleSetDone(setId)}
      style={[
        styles.checkBox,
        {
          backgroundColor:
            isCompleted ? figmaColors.orangeAccent : colorBox.grey800,
        },
      ]}
    >
      {isCompleted && <FontAwesome6 name="check" size={16} />}
    </Pressable>
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

export { styles as activeExStyles };
