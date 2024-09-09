import { ThemedText } from "@/components/Themed";
import { figmaColors } from "@/constants/Colors";
import {
  ActiveSet,
  useActiveWorkoutExercise,
  useActiveWorkoutSetEntities,
} from "@/context/active-workout-provider";
import { FontAwesome6 } from "@expo/vector-icons";
import { useMemo } from "react";
import { View, StyleSheet } from "react-native";

export default function ActiveExerciseCard({
  exerciseId,
}: {
  exerciseId: number;
}) {
  console.log(`${exerciseId} rendered`);
  const { exerciseClassId, setIds } = useActiveWorkoutExercise(exerciseId);
  const allSets = useActiveWorkoutSetEntities();
  const activeSets = useMemo(
    () => setIds.map((setId) => allSets[setId]),
    [setIds]
  );
  return (
    <View style={styles.cardContainer}>
      <ThemedText style={{ fontSize: 24 }}>Id: {exerciseId}</ThemedText>
      <ThemedText style={{ fontSize: 24 }}>
        ExerciseClassId: {exerciseClassId}
      </ThemedText>
      <ActiveSetHeader />
      {activeSets.map((set) => (
        <ActiveSetItem key={set.id} set={set} />
      ))}
    </View>
  );
}

const ActiveSetHeader = () => {
  return (
    <View style={styles.setsHeaderContainer}>
      <ThemedText style={styles.headerText}>Reps</ThemedText>
      <ThemedText style={styles.headerText}>kg</ThemedText>
      <ThemedText style={styles.headerText}>Rest</ThemedText>
      <View style={styles.headerCheckBox}>
        <FontAwesome6
          name="check"
          size={CHECK_ICON_SIZE}
          color={figmaColors.greyDarkBorder}
        />
      </View>
    </View>
  );
};

const ActiveSetItem = ({ set }: { set: ActiveSet }) => {
  return (
    <View style={styles.setContainer}>
      <View style={styles.dataCell}>
        <ThemedText style={styles.dataText}>{set.reps}</ThemedText>
      </View>
      <View style={styles.dataCell}>
        <ThemedText style={styles.dataText}>{set.weight}</ThemedText>
      </View>
      <View style={styles.dataCell}>
        <ThemedText style={styles.dataText}>{set.targetRest}</ThemedText>
      </View>
      <View
        style={[
          styles.checkBox,
          {
            backgroundColor:
              set.isCompleted ?
                figmaColors.orangeAccent
              : figmaColors.lighterPrimaryBlack,
          },
        ]}
      >
        <FontAwesome6
          name="check"
          size={CHECK_ICON_SIZE}
          color={figmaColors.greyDarkBorder}
        />
      </View>
    </View>
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
    marginVertical: 12,
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
    borderWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#1D1D1D",
    borderBottomColor: figmaColors.greyDarkBorder,
  },
});
