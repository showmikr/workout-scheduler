import { ThemedTextInput } from "@/components/Themed";
import { figmaColors } from "@/constants/Colors";
import { Text, View, StyleSheet, Pressable } from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useState } from "react";

export default function CustomExerciseClassCard({
  onCreateExercise,
}: {
  onCreateExercise?: () => void;
}) {
  const [bodyPart, setBodyPart] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string | null>(null);
  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardHeader}>Custom Exercise</Text>
      <View style={styles.inputContainer}>
        <ThemedTextInput
          returnKeyType="done"
          placeholderTextColor={figmaColors.greyLight}
          style={styles.inputText}
          placeholder="Name"
        />
        <FontAwesome6 name="pencil" size={16} color={figmaColors.greyLight} />
      </View>
      <View style={styles.dropdownInput}>
        <Text style={styles.inputHeader}>Body Part</Text>
        <Pressable
          style={styles.inputContainer}
          onPress={() => console.log("Pressed")}
        >
          <Text style={styles.placeHolderText}>None</Text>
          <FontAwesome6
            name="angle-down"
            size={16}
            color={figmaColors.greyLight}
          />
        </Pressable>
      </View>
      <View style={styles.dropdownInput}>
        <Text style={styles.inputHeader}>Equipment</Text>
        <Pressable style={styles.inputContainer}>
          <Text style={styles.placeHolderText}>None</Text>
          <FontAwesome6
            name="angle-down"
            size={16}
            color={figmaColors.greyLight}
          />
        </Pressable>
      </View>
      <Pressable onPress={onCreateExercise}>
        <Text style={[styles.cardHeader, { color: figmaColors.addGreen }]}>
          Create Exercise
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    fontSize: 20,
    color: "#D7D7D7",
    textAlign: "center",
  },
  inputText: {
    fontSize: 20,
    flex: 1,
    color: figmaColors.primaryWhite,
  },
  placeHolderText: {
    fontSize: 20,
    flex: 1,
    color: figmaColors.greyLight,
  },
  inputHeader: {
    fontSize: 16,
    color: figmaColors.greyLighter,
  },
  inputContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: figmaColors.primaryBlack,
    padding: 8,
    borderBottomWidth: 1,
    borderRadius: 8,
    borderBottomColor: figmaColors.greyDarkBorder,
  },
  dropdownInput: {
    rowGap: 8,
  },
  cardContainer: {
    flex: 1,
    alignItems: "stretch",
    // flexBasis: 240,
    maxWidth: 360,
    marginHorizontal: 16,
    rowGap: 64,
    borderRadius: 12,
    backgroundColor: figmaColors.greyDark,
    paddingHorizontal: 16,
    paddingVertical: 44,
  },
});
