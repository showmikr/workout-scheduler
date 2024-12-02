import { colorBox } from "@/constants/Colors";
import { Dimensions, StyleSheet } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";

const WINDOW_WIDTH = Dimensions.get("window").width;
const DELETE_BUTTON_WIDTH = Math.ceil(WINDOW_WIDTH / 4);

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

function DeleteUnderlay({
  drag,
  onPress,
}: {
  progress?: SharedValue<number>;
  drag: SharedValue<number>;
  swipeable?: SwipeableMethods;
  onPress?: () => void;
}) {
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            drag.value,
            [-DELETE_BUTTON_WIDTH, 0],
            [0, DELETE_BUTTON_WIDTH],
            Extrapolation.CLAMP
          ),
        },
        {
          scaleX: interpolate(
            drag.value,
            [-WINDOW_WIDTH, -DELETE_BUTTON_WIDTH, 0],
            [1.5, 1, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  return (
    <AnimatedRectButton
      activeOpacity={0.4}
      style={[styles.deleteAction, styleAnimation]}
      onPress={onPress}
    >
      <Animated.Text style={styles.deleteText}>Delete</Animated.Text>
    </AnimatedRectButton>
  );
}

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
  deleteAction: {
    backgroundColor: colorBox.red500,
    justifyContent: "center",
    alignItems: "center",
    width: DELETE_BUTTON_WIDTH,
  },
  deleteText: {
    alignSelf: "center",
    color: colorBox.red000,
    fontWeight: "600",
    fontSize: 16,
  },
});

export { DeleteUnderlay };
