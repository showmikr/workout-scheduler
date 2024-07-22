import { StyleSheet, View, Animated } from "react-native";
import { RectButton } from "react-native-gesture-handler";

type RightSideUnderlayProps = {
  onPress: () => void;
  progress?: Animated.AnimatedInterpolation<number>;
  dragX: Animated.AnimatedInterpolation<number>;
};

const ExerciseCardUnderlay = ({
  progress,
  dragX,
  onPress,
}: RightSideUnderlayProps) => {
  const textDrag = dragX.interpolate({
    inputRange: [-88, 0],
    outputRange: [0, 100],
    extrapolate: "clamp",
  });

  const underlayStretch = dragX.interpolate({
    inputRange: [-88, 0],
    outputRange: [1, 0],
    extrapolate: "extend",
  });

  return (
    <View style={styles.rightActionsContainer}>
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [{ translateX: textDrag }, { scaleX: underlayStretch }],
          },
        ]}
      >
        <RectButton
          activeOpacity={0.4}
          style={styles.deleteButton}
          onPress={onPress}
        ></RectButton>
      </Animated.View>
      <Animated.Text
        style={[styles.deleteText, { transform: [{ translateX: textDrag }] }]}
        // @ts-expect-error
        pointerEvents="none" // pass through presess events to the swipeable
      >
        Delete
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    backgroundColor: "white",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  itemText: {
    fontSize: 16,
  },
  rightActionsContainer: {
    maxWidth: 88,
    justifyContent: "center",
    flexGrow: 1,
    flexBasis: 0,
    flexDirection: "row",
  },
  deleteAction: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
  },
  deleteButton: {
    flex: 1,
  },
  deleteText: {
    position: "absolute",
    alignSelf: "center",
    color: "white",
    fontWeight: "600",
  },
});

export { ExerciseCardUnderlay };
