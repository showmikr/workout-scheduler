import {
  calculatePlates,
  DeleteUnderlay,
  PlatesUnderlay,
} from "@/components/CardUnderlay";
import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { colorBox } from "@/constants/Colors";
import {
  useActiveWorkoutActions,
  useActiveWorkoutBottomSheet,
  useActiveWorkoutExerciseClass,
  useActiveWorkoutIsSetCellSelected,
  useActiveWorkoutRestingSetId,
  useActiveWorkoutRestingTime,
  useActiveWorkoutSetIsCompleted,
  useActiveWorkoutSetReps,
  useActiveWorkoutSetTargetRest,
  useActiveWorkoutSetWeight,
  useActiveWorkoutStoreSelectedSetText,
} from "@/context/active-workout-provider";
import { immediateDebounce } from "@/utils/debounce-utils";
import { FontAwesome6 } from "@expo/vector-icons";
import MaskedView from "@react-native-masked-view/masked-view";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  LayoutAnimationConfig,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useSharedValue,
  Easing,
  withTiming,
  ZoomIn,
} from "react-native-reanimated";
import CustomAnimatedButton from "../CustomAnimatedButton";
import React from "react";

const ActiveExerciseHeader = ({ exerciseId }: { exerciseId: number }) => {
  const { id: exerciseClassId, title } =
    useActiveWorkoutExerciseClass(exerciseId);
  return (
    <View style={styles.activeExerciseHeaderContainer}>
      <ThemedText style={styles.activeExerciseTitle}>{title}</ThemedText>
      <View style={styles.columnLabelsContainer}>
        <ThemedText style={styles.columnLabel}>Rest</ThemedText>
        <ThemedText style={styles.columnLabel}>Kg</ThemedText>
        <ThemedText style={styles.columnLabel}>Reps</ThemedText>
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

const listUpdateAnimationConfig: LayoutAnimationConfig = {
  duration: 400, // default fallback duration. shouldn't be used
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.7,
    duration: 200,
  },
};

const DEFAULT_INVENTORY = [45, 35, 25, 10, 5, 2.5];
const ActiveSetItem = ({
  exerciseId,
  setId,
}: {
  exerciseId: number;
  setId: number;
}) => {
  const { deleteSet } = useActiveWorkoutActions();
  const totalWeight = useActiveWorkoutSetWeight(setId);
  const plates = useMemo(
    () => calculatePlates(totalWeight, DEFAULT_INVENTORY),
    [totalWeight]
  );
  const debouncedDelete = useCallback(
    immediateDebounce(() => {
      LayoutAnimation.configureNext(listUpdateAnimationConfig);
      deleteSet(exerciseId, setId);
    }, 200),
    [exerciseId, setId]
  );

  return (
    <Animated.View entering={ZoomIn.springify(150).dampingRatio(0.8)}>
      <Swipeable
        renderRightActions={(_progress, drag) => (
          <DeleteUnderlay drag={drag} onPress={debouncedDelete} />
        )}
        renderLeftActions={(_progress, drag) => (
          <PlatesUnderlay drag={drag} plates={plates} />
        )}
        friction={2}
        overshootFriction={8}
        rightThreshold={20}
        leftThreshold={20}
        dragOffsetFromLeftEdge={30}
        childrenContainerStyle={[
          styles.setContainer,
          { paddingHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN },
        ]}
      >
        <RestCell setId={setId} />
        <WeightCell setId={setId} />
        <RepsCell setId={setId} />
        <CheckboxCell setId={setId} />
      </Swipeable>
    </Animated.View>
  );
};

const WeightCellTempText = () => {
  const text = useActiveWorkoutStoreSelectedSetText();
  return <ThemedText style={styles.dataText}>{text}</ThemedText>;
};

const WEIGHT_REGEX = /^\d*\.?\d+/;
const WeightCell = ({ setId }: { setId: number }) => {
  const isSelected = useActiveWorkoutIsSetCellSelected({
    setId,
    param: "weight",
  });
  const { setSelectedSetCell } = useActiveWorkoutActions();
  const weight = useActiveWorkoutSetWeight(setId);
  const sheetMenu = useActiveWorkoutBottomSheet();
  return (
    <Pressable
      onPress={() => {
        setSelectedSetCell({
          setId,
          param: "weight",
          interimText: weight.toString(),
        });
        sheetMenu?.present();
      }}
      style={[
        styles.dataCell,
        isSelected && {
          borderWidth: 2,
          borderBottomWidth: 2,
          borderColor: colorBox.stoneGrey300,
          borderBottomColor: colorBox.stoneGrey300,
        },
      ]}
    >
      {isSelected ?
        <WeightCellTempText />
      : <ThemedText style={styles.dataText}>{weight}</ThemedText>}
    </Pressable>
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
      editable={false}
      onPress={() => {
        console.log("reps pressed");
      }}
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
        const minutes = Number(digitChars[0] + digitChars[1]);
        const seconds = Number(digitChars[2] + digitChars[3]);
        const adjustedMinutes = Math.min(
          99,
          minutes + Math.trunc(seconds / 60)
        );
        const adjustedSeconds =
          adjustedMinutes >= 99 && seconds >= 60 ? 59 : seconds % 60;
        if (seconds >= 60) {
          const minutesString = adjustedMinutes.toString().padStart(2, "0");
          const secondsString = adjustedSeconds.toString().padStart(2, "0");
          const [minutesArray, secondsArray] = [
            [...minutesString],
            [...secondsString],
          ];
          setDigitChars([...minutesArray, ...secondsArray]);
        }
        changeRest(setId, adjustedMinutes * 60 + adjustedSeconds);
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
  const onPress = useCallback(
    immediateDebounce(() => {
      LayoutAnimation.configureNext(listUpdateAnimationConfig);
      addSet(exerciseId);
    }, 200),
    [addSet]
  );

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
    backgroundColor: "transparent",
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: 24,
  },
  activeExerciseHeaderContainer: {
    paddingHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
  },
  activeExerciseTitle: {
    fontSize: 24,
    color: colorBox.stoneGrey100,
    fontWeight: 600,
  },
  columnLabelsContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 12,
    marginBottom: -10,
  },
  columnLabel: {
    flex: 1,
    color: colorBox.stoneGrey500,
    fontSize: 16,
    fontWeight: 500,
  },
  dataCell: {
    flex: 1,
    backgroundColor: colorBox.stoneGrey850,
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
