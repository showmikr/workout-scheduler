import { colorBox } from "@/constants/Colors";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ViewStyle,
  PressableProps,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";

const KeypadButton = ({
  children,
  activeOpacity = 0.7,
  underlayColor = "white",
  style,
  contentContainerStyle, // styling for inner view
  ...remainingProps
}: {
  contentContainerStyle?: ViewStyle;
  activeOpacity?: number;
  underlayColor?: string;
  children?: React.ReactElement;
} & Omit<PressableProps, "children">) => {
  return (
    // The Pressable acts as the underlay
    <Pressable
      style={({ pressed, hovered }) => [
        typeof style === "function" ? style({ pressed, hovered }) : style,
        { backgroundColor: pressed ? underlayColor : "transparent" },
      ]}
      {...remainingProps}
    >
      {({ pressed }) => (
        // The View acts as the overlay, it becomes more transparent, revealing the underlay
        <View
          style={[
            contentContainerStyle,
            { opacity: pressed ? activeOpacity : 1 },
          ]}
        >
          {children}
        </View>
      )}
    </Pressable>
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
        <KeypadButton
          style={styles.keypadButtonWrapper}
          contentContainerStyle={styles.keypadButtonContent}
        >
          <Text style={styles.keypadDigitText}>KG</Text>
        </KeypadButton>
      </View>
      <View style={styles.keypadWrapper}>
        <View style={styles.keypadDigitsWrapper}>
          {KEYPAD_CHARS.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.keypadRow}>
              {row.map((char, colIndex) => (
                <KeypadButton
                  key={colIndex}
                  style={styles.keypadButtonWrapper}
                  contentContainerStyle={styles.keypadButtonContent}
                >
                  <Text style={styles.keypadDigitText}>{char}</Text>
                </KeypadButton>
              ))}
            </View>
          ))}
          <View style={styles.keypadRow}>
            {KEYPAD_LAST_ROW_CHARS.map((RowItem, index) => (
              <KeypadButton
                key={index}
                style={styles.keypadButtonWrapper}
                contentContainerStyle={styles.keypadButtonContent}
              >
                <RowItem />
              </KeypadButton>
            ))}
          </View>
        </View>
        <View style={styles.keypadUtilitiesWrapper}>
          <KeypadButton
            style={styles.keypadPlusButtonWrapper}
            contentContainerStyle={styles.keypadPlussButtonContent}
          >
            <FontAwesome6
              name="plus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton
            style={styles.keypadMinusButtonWrapper}
            contentContainerStyle={styles.keypadMinusButtonContent}
          >
            <FontAwesome6
              name="minus"
              color={colorBox.orangeAccent900}
              size={KEYPAD_ICON_SIZE}
            />
          </KeypadButton>
          <KeypadButton
            style={styles.keypadPlatesButtonWrapper}
            contentContainerStyle={styles.keypadPlatesButtonContet}
          >
            <Text numberOfLines={1} style={styles.platesButtonText}>
              Plates
            </Text>
          </KeypadButton>
          <KeypadButton
            style={styles.keypadDoneButtonWrapper}
            contentContainerStyle={styles.keypadDoneButtonContent}
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
    marginBottom: 68,
  },
  keypadWrapper: {
    flexDirection: "row",
    gap: 8,
    aspectRatio: 13 / 8,
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
    borderRadius: 8,
  },
  keypadButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colorBox.stoneGrey700,
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
  keypadMinusButtonWrapper: {
    flex: 1,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
  },
  keypadMinusButtonContent: {
    flex: 1,
    borderBottomRightRadius: 8,
    borderBottomLeftRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colorBox.orangeAccent400,
  },
  keypadPlusButtonWrapper: {
    flex: 1,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  keypadPlussButtonContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colorBox.orangeAccent400,
  },
  keypadPlatesButtonWrapper: {
    flex: 1,
    borderRadius: 8,
  },
  keypadPlatesButtonContet: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colorBox.orangeAccent900,
  },
  keypadDoneButtonWrapper: {
    flex: 1,
    borderRadius: 8,
  },
  keypadDoneButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: colorBox.blue400,
  },
});

export default WeightAdjustView;
