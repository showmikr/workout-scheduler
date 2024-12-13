import { colorBox } from "@/constants/Colors";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ColorValue,
  PressableProps,
} from "react-native";
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const KeypadButton = ({
  children,
  backgroundColor,
  activeBackgroundColor,
  ...pressableProps
}: {
  backgroundColor?: ColorValue;
  activeBackgroundColor?: ColorValue;
} & PressableProps) => {
  const initialColor = backgroundColor ?? "#000000";
  const finalColor = activeBackgroundColor ?? "#404040"; // +25 lightness compared to #000000
  const pressProgress = useSharedValue(0);
  const { onPressIn, onPressOut, style, ...remainingProps } = pressableProps;
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(pressProgress.value, [0, 1], [
        initialColor,
        finalColor,
      ] as string[]),
    };
  });
  return (
    <AnimatedPressable
      onPressIn={(event) => {
        pressProgress.value = withTiming(1, {
          duration: 100,
          easing: Easing.ease,
        });
        if (onPressIn) onPressIn(event);
      }}
      onPressOut={(event) => {
        pressProgress.value = withTiming(0, {
          duration: 150,
          easing: Easing.out(Easing.ease),
        });
        if (onPressOut) onPressOut(event);
      }}
      style={[style, animatedStyle]}
      {...remainingProps}
    >
      {children}
    </AnimatedPressable>
  );
};

const KEYPAD_CHARS = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];
const KEYPAD_FONT_SIZE = 24;
const KEYPAD_TEXT_COLOR = colorBox.stoneGrey200;
const KEYPAD_ICON_SIZE = KEYPAD_FONT_SIZE;
const KEYPAD_TEXT_SIZE = KEYPAD_FONT_SIZE * (7 / 8);

const KEYPAD_LAST_ROW_CHARS = [
  () => <Text style={styles.keypadDigitText}>.</Text>,
  () => <Text style={styles.keypadDigitText}>0</Text>,
  () => (
    <FontAwesome6
      name="xmark"
      size={KEYPAD_ICON_SIZE}
      color={KEYPAD_TEXT_COLOR}
    />
  ),
];

const WeightAdjustView = ({ weight }: { weight: number }) => {
  return (
    <View style={styles.rootWrapper}>
      <View style={styles.weightWrapper}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flex: 3,
            gap: 4,
          }}
        >
          <FontAwesome6
            name="weight-hanging"
            size={32}
            color={colorBox.stoneGrey400}
          />
          <Text style={styles.weightText}>{weight}</Text>
        </View>
        <View style={styles.keypadButtonWrapper}>
          <Text style={styles.keypadDigitText}>KG</Text>
        </View>
      </View>
      <View style={styles.keypadWrapper}>
        <View style={styles.keypadDigitsWrapper}>
          {KEYPAD_CHARS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((char, colIndex) => (
                <KeypadButton
                  backgroundColor={colorBox.stoneGrey700}
                  activeBackgroundColor={"#868383"}
                  key={colIndex}
                  style={styles.keypadButtonWrapper}
                >
                  <Text style={styles.keypadDigitText}>{char}</Text>
                </KeypadButton>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            {KEYPAD_LAST_ROW_CHARS.map((rowItem, index) => (
              <KeypadButton
                key={index}
                backgroundColor={colorBox.stoneGrey700}
                activeBackgroundColor={"#868383"}
                style={styles.keypadButtonWrapper}
                onPress={() => {}}
              >
                {rowItem}
              </KeypadButton>
            ))}
          </View>
        </View>
        <View style={styles.keypadUtilitiesWrapper}>
          <KeypadButton
            backgroundColor={colorBox.orangeAccent400}
            activeBackgroundColor="#F69D18"
            style={styles.keypadPlusButton}
          >
            <FontAwesome6
              name="plus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton
            backgroundColor={colorBox.orangeAccent400}
            activeBackgroundColor="#F69D18"
            style={styles.keypadMinusButton}
          >
            <FontAwesome6
              name="minus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton
            backgroundColor={colorBox.orangeAccent900}
            activeBackgroundColor="#996200"
            style={styles.keypadPlatesButton}
          >
            <Text numberOfLines={1} style={styles.platesButtonText}>
              Plates
            </Text>
          </KeypadButton>
          <KeypadButton
            backgroundColor={colorBox.blue400}
            activeBackgroundColor="#68ACCF"
            style={styles.keypadDoneButton}
          >
            <Text numberOfLines={1} style={styles.doneButtonText}>
              Done
            </Text>
          </KeypadButton>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  rootWrapper: {
    padding: 16,
    borderRadius: 12,
    gap: 16,
    backgroundColor: colorBox.stoneGrey950,
    minWidth: 320,
    maxWidth: 480,
  },
  keypadWrapper: {
    flexDirection: "row",
    gap: 8,
    aspectRatio: 3 / 2,
  },
  keypadDigitsWrapper: {
    flex: 3,
    gap: 8,
  },
  keypadUtilitiesWrapper: {
    flex: 1,
    gap: 8,
  },
  weightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  weightText: {
    color: colorBox.stoneGrey200,
    fontSize: 44,
    fontWeight: 700,
    letterSpacing: -2,
  },
  unitsWrapper: {
    flex: 1,
    flexDirection: "column-reverse",
  },
  unitText: {
    color: colorBox.stoneGrey300,
    fontSize: KEYPAD_ICON_SIZE,
  },
  keypadRow: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
  },
  keypadButtonWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    backgroundColor: colorBox.stoneGrey700,
    borderRadius: 8,
  },
  keypadDigitText: {
    color: KEYPAD_TEXT_COLOR,
    fontSize: KEYPAD_FONT_SIZE,
    fontWeight: 500,
  },
  platesButtonText: {
    fontSize: KEYPAD_TEXT_SIZE,
    fontWeight: 700,
    color: colorBox.orangeAccent300,
  },
  doneButtonText: {
    fontSize: KEYPAD_TEXT_SIZE,
    fontWeight: 700,
    color: colorBox.blue900,
  },
  keypadMinusButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    backgroundColor: colorBox.orangeAccent400,
  },
  keypadPlusButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colorBox.orangeAccent400,
  },
  keypadPlatesButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colorBox.orangeAccent900,
  },
  keypadDoneButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colorBox.blue400,
  },
});

export default WeightAdjustView;
