import {
  calculatePlates,
  DeleteUnderlay,
  PlatesUnderlay,
} from "@/components/CardUnderlay";
import { ThemedText } from "@/components/Themed";
import { colorBox } from "@/constants/Colors";
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
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  LayoutAnimationConfig,
} from "react-native";
import Animated, {
  useSharedValue,
  Easing,
  withTiming,
} from "react-native-reanimated";
import CustomAnimatedButton from "../CustomAnimatedButton";
import React from "react";
import {
  ExerciseHeader,
  LIST_CONTAINER_HORIZONTAL_MARGIN,
  RepsCellDisplay,
  RestInputDisplay,
  SetSwipeable,
  WeightCellDisplay,
  dataStyles,
  exerciseHeaderStyles,
} from "./SharedUI";

const ActiveExerciseHeader = ({ exerciseId }: { exerciseId: number }) => {
  const { id: exerciseClassId, title } =
    useActiveWorkoutExerciseClass(exerciseId);
  return (
    <ExerciseHeader title={title}>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Rest</ThemedText>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Kg</ThemedText>
      <ThemedText style={exerciseHeaderStyles.columnLabel}>Reps</ThemedText>
      <View style={styles.headerCheckBox}>
        <FontAwesome6
          name="check"
          size={CHECKMARK_ICON_SIZE}
          color={colorBox.stoneGrey500}
        />
      </View>
    </ExerciseHeader>
  );
};

const listUpdateAnimationConfig: LayoutAnimationConfig = {
  duration: 400, // default fallback duration. shouldn't be used
  delete: {
    type: LayoutAnimation.Types.spring,
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
  const minPlateWeight = useMemo(
    () => plates[plates.length - 1].weight,
    [plates]
  );
  const maxPlateWeight = useMemo(() => plates[0].weight, [plates]);
  const debouncedDelete = useCallback(
    immediateDebounce(() => {
      LayoutAnimation.configureNext(listUpdateAnimationConfig);
      deleteSet(exerciseId, setId);
    }, 200),
    [exerciseId, setId]
  );
  console.log(`ActiveSetItem rendered, setId: ${setId}`);
  return (
    <SetSwipeable
      renderRightActions={(_progress, drag) => (
        <DeleteUnderlay drag={drag} onPress={debouncedDelete} />
      )}
    >
      <RestCell setId={setId} />
      <WeightCell setId={setId} />
      <RepsCell setId={setId} />
      <CheckboxCell setId={setId} />
    </SetSwipeable>
  );
};

const MemoizedActiveSetItem = React.memo(ActiveSetItem);

const WeightCell = ({ setId }: { setId: number }) => {
  const { changeWeight } = useActiveWorkoutActions();
  const weight = useActiveWorkoutSetWeight(setId);
  const onUpdate = useCallback(
    (newWeight: number) => {
      changeWeight(setId, newWeight);
    },
    [setId]
  );
  return <WeightCellDisplay weight={weight} onUpdate={onUpdate} />;
};

const RepsCell = ({ setId }: { setId: number }) => {
  const { changeReps } = useActiveWorkoutActions();
  const reps = useActiveWorkoutSetReps(setId);
  const onUpdate = useCallback(
    (newReps: number) => {
      changeReps(setId, newReps);
    },
    [setId]
  );
  return <RepsCellDisplay reps={reps} onUpdate={onUpdate} />;
};

const RestCell = ({ setId }: { setId: number }) => {
  const restingSetId = useActiveWorkoutRestingSetId();

  return (
    <MaskedView
      style={{
        flex: 1,
        flexDirection: "row",
      }}
      maskElement={<View style={dataStyles.dataCell} />}
    >
      {restingSetId === setId ?
        <RestCountdown setId={setId} />
      : <RestInput setId={setId} />}
    </MaskedView>
  );
};

const RestInput = ({ setId }: { setId: number }) => {
  const rest = useActiveWorkoutSetTargetRest(setId);
  const { changeRest } = useActiveWorkoutActions();
  const onUpdate = useCallback(
    (totalSeconds: number) => {
      changeRest(setId, totalSeconds);
    },
    [setId]
  );
  return <RestInputDisplay totalSeconds={rest} onUpdate={onUpdate} />;
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
      style={[dataStyles.dataCell]}
    >
      <ThemedText style={[dataStyles.dataText, { zIndex: 1 }]}>
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

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: "flex-start",
  },
  columnLabelsContainer: {
    flex: 1,
    flexDirection: "row",
    marginTop: 12,
    marginBottom: -10,
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
  MemoizedActiveSetItem as ActiveSetItem,
  ActiveExerciseHeader as ActiveSetHeader,
  AddSetButton,
};
