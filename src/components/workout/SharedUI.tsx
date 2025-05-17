import { View, StyleSheet } from "react-native";
import { ThemedText, ThemedTextInput } from "../Themed";
import { colorBox } from "@/constants/Colors";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import type { SwipeableProps } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { ZoomIn } from "react-native-reanimated";
import { useRef, useState } from "react";

const ExerciseHeader = ({
  title,
  children: columnLabels,
}: {
  title: string;
  children?: Iterable<React.ReactNode>;
}) => {
  return (
    <View>
      <ThemedText style={styles.activeExerciseTitle}>{title}</ThemedText>
      <View style={[styles.setContainer, { paddingTop: 12, paddingBottom: 0 }]}>
        {columnLabels}
      </View>
    </View>
  );
};

const SetSwipeable = ({
  renderLeftActions,
  renderRightActions,
  children,
}: {
  renderLeftActions?: SwipeableProps["renderLeftActions"];
  renderRightActions?: SwipeableProps["renderRightActions"];
  children: React.ReactNode;
}) => {
  return (
    <Animated.View entering={ZoomIn.springify(150).dampingRatio(0.8)}>
      <Swipeable
        renderLeftActions={renderLeftActions}
        renderRightActions={renderRightActions}
        friction={2}
        overshootFriction={8}
        rightThreshold={20}
        leftThreshold={20}
        dragOffsetFromLeftEdge={30}
        childrenContainerStyle={styles.setContainer}
      >
        {children}
      </Swipeable>
    </Animated.View>
  );
};

const toTimeString = ({
  minutes,
  seconds,
}: {
  minutes: number;
  seconds: number;
}) =>
  [minutes, seconds].map((num) => num.toString().padStart(2, "0")).join(":");

const REST_TEXT_HIGHLIGHT_RANGE = { start: 5, end: 5 };
const SINGLE_DIGIT_REGEX = /^\d$/;
const RestInputDisplay = ({
  totalSeconds,
  onUpdate,
}: {
  totalSeconds: number;
  onUpdate: (totalSeconds: number) => void;
}) => {
  const minutes = Math.trunc(totalSeconds / 60);
  const seconds = totalSeconds - minutes * 60;
  const digitsAsText = useRef(
    [minutes, seconds].map((num) => num.toString().padEnd(2, "0")).join("")
  );
  const myTime = { minutes, seconds };
  const [time, setTime] = useState(myTime);

  return (
    <ThemedTextInput
      numberOfLines={1}
      maxLength={5}
      inputMode="numeric"
      value={toTimeString(time)}
      selection={REST_TEXT_HIGHLIGHT_RANGE}
      returnKeyType="done"
      style={[dataStyles.dataCell, dataStyles.dataText]}
      onKeyPress={(e) => {
        const keyPressed = e.nativeEvent.key;
        const digitPressed =
          keyPressed.match(SINGLE_DIGIT_REGEX)?.at(0) !== undefined;
        if (digitPressed) {
          digitsAsText.current = digitsAsText.current.slice(1) + keyPressed;
          const newTime = {
            minutes: Number(digitsAsText.current.slice(0, 2)),
            seconds: Number(digitsAsText.current.slice(2)),
          };
          setTime(newTime);
        } else if (keyPressed === "Backspace") {
          digitsAsText.current = "0" + digitsAsText.current.slice(0, -1);
          const newTime = {
            minutes: Number(digitsAsText.current.slice(0, 2)),
            seconds: Number(digitsAsText.current.slice(2)),
          };
          setTime(newTime);
        }
      }}
      onEndEditing={() => {
        // handle seconds overflow
        const minutes = Number(digitsAsText.current.slice(0, 2));
        const seconds = Number(digitsAsText.current.slice(2));
        onUpdate(minutes * 60 + seconds);
      }}
    />
  );
};

const REPS_REGEX = /^0*(\d+)/;
const RepsCellDisplay = ({
  reps,
  onUpdate,
}: {
  reps: number;
  onUpdate: (newReps: number) => void;
}) => {
  const [repsText, setRepsText] = useState(reps.toString());

  return (
    <ThemedTextInput
      numberOfLines={1}
      maxLength={3}
      selection={{ start: repsText.length, end: repsText.length }}
      inputMode="numeric"
      value={repsText}
      returnKeyType="done"
      style={[dataStyles.dataCell, dataStyles.dataText]}
      onChangeText={(text) => {
        const matchedText = text.match(REPS_REGEX)?.at(0) ?? "";
        setRepsText(matchedText);
      }}
      onEndEditing={() => {
        const parsedReps = Number(repsText); // Note, Number(<empty string>) = 0
        setRepsText(parsedReps.toString());
        onUpdate(parsedReps);
      }}
    />
  );
};

const WEIGHT_REGEX = /^\d*\.?\d+/;
const WeightCellDisplay = ({
  weight,
  onUpdate,
}: {
  weight: number;
  onUpdate: (newWeight: number) => void;
}) => {
  const [weightText, setWeightText] = useState(weight.toString());

  return (
    <ThemedTextInput
      numberOfLines={1}
      maxLength={6}
      selection={{ start: weightText.length, end: weightText.length }}
      inputMode="decimal"
      value={weightText}
      returnKeyType="done"
      style={[dataStyles.dataCell, dataStyles.dataText]}
      onChangeText={(text) => {
        setWeightText(text);
      }}
      onEndEditing={(e) => {
        const parsedWeight = Number(
          e.nativeEvent.text.match(WEIGHT_REGEX)?.at(0) ?? "0"
        );
        const truncatedWeight = Math.round(parsedWeight * 10) / 10;
        setWeightText(truncatedWeight.toString());
        onUpdate(truncatedWeight);
      }}
    />
  );
};

const LIST_CONTAINER_HORIZONTAL_MARGIN = 16;

const styles = StyleSheet.create({
  setContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    gap: LIST_CONTAINER_HORIZONTAL_MARGIN,
    marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
  },
  activeExerciseTitle: {
    fontSize: 24,
    color: colorBox.stoneGrey100,
    fontWeight: 600,
    marginHorizontal: LIST_CONTAINER_HORIZONTAL_MARGIN,
  },
});

const dataStyles = StyleSheet.create({
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
});

const exerciseHeaderStyles = StyleSheet.create({
  columnLabel: {
    flex: 1,
    color: colorBox.stoneGrey500,
    textAlign: "left",
    fontSize: 16,
    fontWeight: 500,
  },
});

export {
  ExerciseHeader,
  SetSwipeable,
  RestInputDisplay,
  RepsCellDisplay,
  WeightCellDisplay,
  dataStyles,
  exerciseHeaderStyles,
  LIST_CONTAINER_HORIZONTAL_MARGIN,
};
