import { colorBox } from "@/constants/Colors";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { RectButton } from "react-native-gesture-handler";
import { SwipeableMethods } from "react-native-gesture-handler/lib/typescript/components/ReanimatedSwipeable";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import PlateIcon from "./PlateIcon";

const WINDOW_WIDTH = Dimensions.get("window").width;
const DELETE_BUTTON_WIDTH = Math.ceil(WINDOW_WIDTH / 4);

const AnimatedRectButton = Animated.createAnimatedComponent(RectButton);

const MAX_PLATE_HEIGHT = 48;
const MINE_PLATE_HEIGHT = MAX_PLATE_HEIGHT / 2;

type PlateConfig = { weight: number; quantity: number; uiHeight: number };

/**
 * Calculates how many of each plate is necessary per-side of a barbell
 *
 * @param weight total weight of lift
 * @param inventory list of the kinds of plates available (i.e 45, 35, 25, 10, 5, 2.5).
 * 2 core assumptions about inventory:
 * - 1: we have an infinite number of each kind of plate
 * - 2: the list is already sorted from heaviest to lightest plates
 * @returns an array of objects representing how many of each plate is needed per side of the barbell
 */
const calculatePlates = (weight: number, inventory: Array<number>) => {
  const minWeight = inventory[inventory.length - 1];
  const maxWeight = inventory[0];
  const plates: Array<PlateConfig> = [];
  let remainder = weight / 2;
  for (let i = 0; i < inventory.length && remainder > 0; i++) {
    const plateWeight = inventory[i];
    const quantity = Math.floor(remainder / plateWeight);
    if (quantity > 0) {
      const plateHeight =
        ((MAX_PLATE_HEIGHT - MINE_PLATE_HEIGHT) * (plateWeight - maxWeight)) /
          (maxWeight - minWeight) +
        MAX_PLATE_HEIGHT;
      plates.push({ weight: plateWeight, quantity, uiHeight: plateHeight });
    }
    remainder = remainder - plateWeight * quantity;
  }
  return plates;
};

const PlateView = ({ plate }: { plate: PlateConfig }) => {
  return (
    <Animated.View
      style={{
        alignItems: "center",
        gap: 4,
      }}
    >
      <PlateIcon
        height={plate.uiHeight}
        innerColor={colorBox.stoneGrey700}
        outerColor={colorBox.stoneGrey800}
      />
      <Text
        style={{
          color: colorBox.stoneGrey200,
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {plate.weight}x{plate.quantity}
      </Text>
    </Animated.View>
  );
};

function PlatesUnderlay({
  drag,
  plates,
  onPress,
}: {
  progress?: SharedValue<number>;
  drag: SharedValue<number>;
  swipeable?: SwipeableMethods;
  plates: Array<PlateConfig>;
  onPress?: () => void;
}) {
  plates.forEach((plate) =>
    console.log("plate: %s, height: %s", plate.weight, plate.uiHeight)
  );
  const styleAnimation = useAnimatedStyle(() => {
    console.log("drag: %d", drag.value);
    return {
      transform: [
        {
          translateX: interpolate(
            drag.value,
            [0, WINDOW_WIDTH],
            [-WINDOW_WIDTH, 0],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });
  return (
    <Animated.View style={[styles.plateUnderlay, styleAnimation]}>
      {plates.map((plate, index) => (
        <View key={index}>
          <PlateView plate={plate} />
        </View>
      ))}
      <Text
        style={{
          alignSelf: "flex-start",
          right: 24,
          top: 12,
          position: "absolute",
          color: colorBox.stoneGrey300,
          fontWeight: 600,
        }}
      >
        Plates Per Side
      </Text>
    </Animated.View>
  );
}

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
  plateUnderlay: {
    backgroundColor: colorBox.stoneGrey950,
    flexDirection: "row",
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: 16,
    paddingHorizontal: 16,
  },
});

export { DeleteUnderlay, PlatesUnderlay, calculatePlates };
