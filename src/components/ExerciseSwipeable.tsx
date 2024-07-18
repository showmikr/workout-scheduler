import { StyleSheet, Text, View, Animated } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

type ExerciseSwipeableProps = {
  onDelete?: () => void;
  children: React.ReactElement;
};

const ExerciseSwipeable: React.FC<ExerciseSwipeableProps> = ({
  onDelete,
  children,
}) => {
  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    const trans = dragX.interpolate({
      inputRange: [-100, 0],
      outputRange: [1, 0],
      extrapolate: "clamp",
    });

    return (
      <View style={styles.rightActionsContainer}>
        <Animated.View
          style={[styles.deleteAction, { transform: [{ translateX: trans }] }]}
        >
          <RectButton style={styles.deleteButton} onPress={onDelete}>
            <Text style={styles.deleteText}>Delete</Text>
          </RectButton>
        </Animated.View>
      </View>
    );
  };

  return (
    <Swipeable renderRightActions={renderRightActions}>{children}</Swipeable>
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
    width: 100,
    flexDirection: "row",
  },
  deleteAction: {
    flex: 1,
    backgroundColor: "red",
    justifyContent: "center",
  },
  deleteButton: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteText: {
    color: "white",
    fontWeight: "600",
  },
});

export default ExerciseSwipeable;
