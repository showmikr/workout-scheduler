import { colorBox } from "@/constants/Colors";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ColorValue,
  PressableProps,
  ViewStyle,
} from "react-native";
import Animated from "react-native-reanimated";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRef } from "react";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const KeypadButton = ({
  children,
  ...pressableProps
}: {
  backgroundColor?: ColorValue;
  activeBackgroundColor?: ColorValue;
} & PressableProps) => {
  return <AnimatedPressable {...pressableProps}>{children}</AnimatedPressable>;
};

const keypadChars = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
];
const KEYPAD_FONT_SIZE = 24;
const KEYPAD_TEXT_COLOR = colorBox.stoneGrey200;
const KEYPAD_ICON_SIZE = KEYPAD_FONT_SIZE;
const KEYPAD_TEXT_SIZE = KEYPAD_FONT_SIZE * (7 / 8);

const WeightAdjustView = ({ weight }: { weight: number }) => {
  const keypadHeight = useRef(0);
  return (
    <View style={baseStyles.rootWrapper}>
      <View style={baseStyles.weightWrapper}>
        <Text style={baseStyles.weightText}>{weight}</Text>
        <View style={baseStyles.unitsWrapper}>
          <Text style={baseStyles.unitText}>kg</Text>
          <Text style={baseStyles.unitText}>lbs</Text>
        </View>
      </View>
      <View style={baseStyles.keypadWrapper}>
        <View style={baseStyles.keypadDigitsWrapper}>
          {keypadChars.map((row, rowIndex) => (
            <View key={rowIndex} style={baseStyles.keypadRow}>
              {row.map((char, colIndex) => (
                <KeypadButton
                  key={colIndex}
                  style={baseStyles.keypadButtonWrapper}
                >
                  <Text style={baseStyles.keypadDigitText}>{char}</Text>
                </KeypadButton>
              ))}
            </View>
          ))}
          <View style={baseStyles.keypadRow}>
            <KeypadButton
              style={baseStyles.keypadButtonWrapper}
              onPress={() => {}}
            >
              <Text style={baseStyles.keypadDigitText}>.</Text>
            </KeypadButton>
            <KeypadButton
              style={baseStyles.keypadButtonWrapper}
              onPress={() => {}}
            >
              <Text style={baseStyles.keypadDigitText}>0</Text>
            </KeypadButton>
            <KeypadButton
              style={baseStyles.keypadButtonWrapper}
              onPress={() => {}}
            >
              <FontAwesome6
                name="xmark"
                size={KEYPAD_ICON_SIZE}
                color={KEYPAD_TEXT_COLOR}
              />
            </KeypadButton>
          </View>
        </View>
        <View style={baseStyles.keypadUtilitiesWrapper}>
          <KeypadButton style={styles.keypadPlusButton}>
            <FontAwesome6
              name="plus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton style={styles.keypadMinusButton}>
            <FontAwesome6
              name="minus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton style={styles.keypadPlatesButton}>
            <Text style={baseStyles.platesButtonText}>Plates</Text>
          </KeypadButton>
          <KeypadButton style={styles.keypadDoneButton}>
            <Text style={baseStyles.doneButtonText}>Done</Text>
          </KeypadButton>
        </View>
      </View>
    </View>
  );
};

const baseStyles = StyleSheet.create({
  rootWrapper: {
    padding: 24,
    borderRadius: 12,
    gap: 16,
    backgroundColor: colorBox.stoneGrey950,
  },
  keypadWrapper: {
    flexDirection: "row",
    flex: 1,
    gap: 8,
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
    alignItems: "baseline",
    gap: 12,
  },
  weightText: {
    flexDirection: "row",
    flex: 1,
    color: colorBox.stoneGrey200,
    fontSize: 32,
    fontWeight: 600,
  },
  unitsWrapper: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  unitText: {
    color: colorBox.stoneGrey300,
    fontSize: 24,
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
    backgroundColor: colorBox.stoneGrey800,
    borderRadius: 8,
    minWidth: 64,
    // minHeight: 48,
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
});

const styles = {
  keypadMinusButton: StyleSheet.compose(baseStyles.keypadButtonWrapper, {
    backgroundColor: colorBox.orangeAccent400,
    padding: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  }) as ViewStyle,
  keypadPlusButton: StyleSheet.compose(baseStyles.keypadButtonWrapper, {
    backgroundColor: colorBox.orangeAccent400,
    padding: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  }) as ViewStyle,
  keypadPlatesButton: StyleSheet.compose(baseStyles.keypadButtonWrapper, {
    backgroundColor: colorBox.orangeAccent900,
    padding: 0,
  }) as ViewStyle,
  keypadDoneButton: StyleSheet.compose(baseStyles.keypadButtonWrapper, {
    backgroundColor: colorBox.blue400,
    padding: 0,
  }) as ViewStyle,
};

export default WeightAdjustView;
