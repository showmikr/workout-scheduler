import { CardOptionsUnderlay } from "@/components/CardUnderlay";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { colorBox, figmaColors } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutExerciseClass,
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
  useSharedValue,
  Easing,
  withTiming,
} from "react-native-reanimated";
import CustomAnimatedButton from "../CustomAnimatedButton";

const ActiveExerciseHeader = ({ exerciseId }: { exerciseId: number }) => {
  const { id: exerciseClassId, title } =
    useActiveWorkoutExerciseClass(exerciseId);
  return (
    <View style={styles.activeExerciseHeaderContainer}>
      <ThemedText style={styles.activeExerciseTitle}>{title}</ThemedText>
      <View style={styles.activeExerciseHeaderUnits}>
        <ThemedText style={styles.headerText}>Rest</ThemedText>
        <ThemedText style={styles.headerText}>Kg</ThemedText>
        <ThemedText style={styles.headerText}>Reps</ThemedText>
        <View style={styles.headerCheckBox}>
          <FontAwesome6
            name="check"
            size={CHECKMARK_ICON_SIZE}
            color={colorBox.stoneGrey500}
          />
        </View>
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
      childrenContainerStyle={{
        flex: 1,
        paddingHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
      }}
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
  const restingSetId = useActiveWorkoutRestingSetId();

  return (
    <MaskedView
      style={{
        flex: 1,
        flexDirection: "row",
      }}
      maskElement={<View style={styles.dataCell} />}
    >
      {restingSetId === setId ?
        <RestCountdown setId={setId} />
      : <RestInput setId={setId} />}
    </MaskedView>
  );
};

const RestInput = ({ setId }: { setId: number }) => {
  const cursorRange = { start: 5, end: 5 };
  const rest = useActiveWorkoutSetTargetRest(setId);
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

  return (
    <ThemedTextInput
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
        const secondsOverflow = seconds - 60;
        if (secondsOverflow >= 0) {
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
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const elapsedRest = useActiveWorkoutRestingTime();
  const targetRest = useActiveWorkoutSetTargetRest(setId);

  if (elapsedRest === undefined) {
    return null;
  }

  const remainingRest = targetRest - elapsedRest;
  const minutes = Math.max(Math.trunc(remainingRest / 60), 0); // ensure no negatives if elapsedRest goes past targetRest
  const seconds = Math.max(remainingRest % 60, 0); // ensure no negatives if elapsedRest goes past targetRest
  const minutesText = minutes.toString().padStart(2, "0");
  const secondsText = seconds.toString().padStart(2, "0");
  return (
    <View
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (dimensions) return;
        setDimensions({ width, height });
      }}
      style={[styles.dataCell]}
    >
      <ThemedText style={[styles.dataText, { zIndex: 1 }]}>
        {minutesText + ":" + secondsText}
      </ThemedText>
      {dimensions && (
        <SlidingLoader
          setId={setId}
          elapsedRest={elapsedRest}
          dimensions={dimensions}
        />
      )}
    </View>
  );
};

const SlidingLoader = ({
  setId,
  dimensions,
  elapsedRest,
}: {
  setId: number;
  elapsedRest: number;
  dimensions: { height: number; width: number };
}) => {
  const { width, height } = dimensions;
  const targetRest = useActiveWorkoutSetTargetRest(setId);
  const percentRemaining = 1 - elapsedRest / targetRest;
  const offset = useSharedValue(width * percentRemaining);

  useEffect(() => {
    offset.value = withTiming(0, {
      duration: (targetRest - elapsedRest) * 1000,
      easing: Easing.inOut(Easing.linear),
    });
    return () => {
      offset.value = offset.value;
    };
  }, [elapsedRest, targetRest]);

  return (
    <Animated.View
      style={[styles.animatedSlider, { right: offset, width, height }]}
    />
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
            isCompleted ? colorBox.orangeAccent400 : colorBox.stoneGrey900,
        },
      ]}
    >
      {isCompleted && <FontAwesome6 name="check" size={CHECKMARK_ICON_SIZE} />}
    </Pressable>
  );
};

const AddSetButton = ({ exerciseId }: { exerciseId: number }) => {
  const { addSet } = useActiveWorkoutActions();
  const onPress = useCallback(() => {
    addSet(exerciseId);
  }, [addSet]);

  return (
    <CustomAnimatedButton
      contentContainerStyle={[styles.addSetContainer, { marginBottom: 32 }]}
      style={styles.addSetButton}
      onPress={onPress}
    >
      <ThemedText style={styles.addSetText}>Add Set</ThemedText>
    </CustomAnimatedButton>
  );
};

const ROW_ITEM_MIN_HEIGHT = 34;
/// The size of the checkmark icon, calculated as a fraction of the minimum row item height.
const CHECKMARK_ICON_SIZE = Math.floor((2 / 3) * ROW_ITEM_MIN_HEIGHT);

const LIST_CONTAINER_HORIZONTAL_MARGIN = 16;

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "flex-start",
  },
  setContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 24,
  },
  activeExerciseHeaderContainer: {
    backgroundColor: figmaColors.primaryBlack,
    paddingHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
  },
  activeExerciseTitle: {
    fontSize: 24,
    color: colorBox.stoneGrey100,
    fontWeight: 600,
  },
  activeExerciseHeaderUnits: {
    flex: 1,
    flexDirection: "row",
    marginTop: 12,
    marginBottom: -10,
  },
  headerText: {
    flex: 1,
    color: colorBox.stoneGrey500,
    fontSize: 16,
    fontWeight: "500",
  },
  dataCell: {
    flex: 1,
    backgroundColor: colorBox.stoneGrey800,
    borderBottomColor: colorBox.stoneGrey900,
    borderBottomWidth: 1,
    borderColor: colorBox.stoneGrey900,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dataText: {
    fontSize: 20,
    color: colorBox.stoneGrey000,
    textAlign: "center",
  },
  animatedSlider: {
    position: "absolute",
    backgroundColor: colorBox.blue400,
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
    borderRadius: 8,
  },
  addSetContainer: {
    marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
  },
  addSetButton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: colorBox.orangeAccent400,
    borderRadius: 20,
    marginVertical: 12,
    paddingVertical: 6,
  },
  addSetText: {
    fontSize: 20,
    fontWeight: 600,
    color: colorBox.orangeAccent1000,
  },
});

export {
  styles as activeExStyles,
  LIST_CONTAINER_HORIZONTAL_MARGIN,
  ActiveSetItem,
  ActiveExerciseHeader as ActiveSetHeader,
  AddSetButton,
};
