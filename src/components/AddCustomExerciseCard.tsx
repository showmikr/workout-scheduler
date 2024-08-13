import { ThemedText, ThemedTextInput } from "@/components/Themed";
import { figmaColors } from "@/constants/Colors";
import {
  Text,
  View,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  Animated,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Dropdown } from "react-native-element-dropdown";
import {
  bodyPartEnums,
  equipmentEnums,
  exerciseEnums,
} from "@/utils/exercise-types";
import { useAddExerciseClass } from "@/hooks/exercises/exercise-classes";

const bodyParts = Object.entries(bodyPartEnums).map(([key, value]) => ({
  label: key[0].toUpperCase() + key.slice(1),
  value,
}));

const equipment = Object.entries(equipmentEnums).map(([key, value]) => ({
  label: key[0].toUpperCase() + key.slice(1),
  value,
}));

const DropdownIcon = () => {
  return (
    <FontAwesome6 name="angle-down" size={16} color={figmaColors.greyLight} />
  );
};

/**
 * Renders the form for adding a new custom exercise
 *
 * @param modalCallback - A function to update the visibility of the modal.
 * @returns A React component that renders a card for adding a new exercise class.
 */
export default function AddCustomExerciseCard({
  dismissModal,
  addExerciseClass,
}: {
  addExerciseClass: ReturnType<typeof useAddExerciseClass>["mutate"];
  dismissModal: () => void;
}) {
  const titleRef = useRef<string>("");
  const [bodyPartId, setBodyPart] = useState<number | null>(null);
  const [equipmentId, setEquipment] = useState<number | null>(null);
  const [equipmentInvalid, setEquipmentInvalid] = useState<boolean>(false);
  const [titleInvalid, setTitleInvalid] = useState<boolean>(false);

  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{ flexDirection: "row" }}
      onPress={(e) => {
        e.preventDefault();
        Keyboard.dismiss();
      }}
    >
      <View style={styles.cardRoot}>
        <TouchableOpacity
          onPress={() => dismissModal()}
          style={{
            alignSelf: "flex-end",
            paddingTop: 12,
          }}
        >
          <ThemedText
            style={[
              {
                fontSize: 16,
                color: figmaColors.greyLighter,
              },
            ]}
          >
            Cancel
          </ThemedText>
        </TouchableOpacity>
        <View style={styles.formView}>
          <View style={styles.inputContainer}>
            <ThemedTextInput
              returnKeyType="done"
              placeholderTextColor={
                !titleInvalid ? figmaColors.greyLight : figmaColors.redAccent
              }
              style={styles.inputText}
              placeholder={!titleInvalid ? "Name" : "Required"}
              onFocus={() => {
                setTitleInvalid(false);
              }}
              onChangeText={(text) => {
                titleRef.current = text;
              }}
            />
            <FontAwesome6
              name="pencil"
              size={16}
              color={figmaColors.greyLight}
            />
          </View>
          <View style={styles.dropdownSection}>
            <Text style={styles.inputHeader}>Body Part</Text>
            <Animated.View>
              <Dropdown
                onFocus={() => {
                  if (Keyboard.isVisible()) {
                    Keyboard.dismiss();
                  }
                }}
                style={styles.dropdown}
                placeholderStyle={styles.placeHolderText}
                placeholder="None"
                containerStyle={styles.dropdownContainer}
                activeColor={figmaColors.lighterPrimaryBlack}
                itemTextStyle={styles.inputText}
                selectedTextStyle={styles.inputText}
                renderRightIcon={DropdownIcon}
                data={bodyParts}
                labelField="label"
                valueField="value"
                onChange={({ value }) => setBodyPart(value)}
              />
            </Animated.View>
          </View>
          <View style={styles.dropdownSection}>
            <View>
              <Text style={styles.inputHeader}>Equipment</Text>
            </View>
            <Dropdown
              onFocus={() => {
                setEquipmentInvalid(false);
                Keyboard.dismiss();
              }}
              style={styles.dropdown}
              placeholderStyle={
                !equipmentInvalid ? styles.placeHolderText : styles.errorText
              }
              containerStyle={[styles.dropdownContainer]}
              activeColor={figmaColors.lighterPrimaryBlack}
              placeholder={!equipmentInvalid ? "None" : "Required"}
              itemTextStyle={styles.inputText}
              selectedTextStyle={styles.inputText}
              renderRightIcon={DropdownIcon}
              data={equipment}
              labelField="label"
              valueField="value"
              onChange={({ value }) => setEquipment(value)}
            />
          </View>
          <TouchableOpacity
            onPress={() => {
              const isTitleInvalid = titleRef.current.length === 0;
              const isEquipmentInvalid = equipmentId === null;
              if (isTitleInvalid) {
                setTitleInvalid(true);
              } else {
                setTitleInvalid(false);
              }
              if (isEquipmentInvalid) {
                setEquipmentInvalid(true);
              } else {
                setEquipmentInvalid(false);
              }
              if (isTitleInvalid || isEquipmentInvalid) {
                return;
              }
              addExerciseClass({
                exerciseTypeId: exerciseEnums.RESISTANCE_ENUM,
                equipmentId,
                bodyPartId,
                title: titleRef.current,
              });
              dismissModal();
            }}
            style={{ alignItems: "center", marginTop: 16 }}
          >
            <Text style={styles.createExerciseText}>Create Exercise</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    fontSize: 24,
    color: figmaColors.primaryWhite,
    textAlign: "center",
    marginBottom: 8,
  },
  createExerciseText: {
    fontSize: 25,
    color: figmaColors.addGreen,
  },
  inputText: {
    flex: 1,
    fontSize: 20,
    color: figmaColors.primaryWhite,
  },
  placeHolderText: {
    fontSize: 20,
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
    borderWidth: 1,
    borderRadius: 8,
    borderBottomColor: figmaColors.greyDarkBorder,
  },
  dropdown: {
    backgroundColor: figmaColors.primaryBlack,
    padding: 8,
    borderRadius: 8,
  },
  dropdownSection: {
    rowGap: 8,
  },
  dropdownContainer: {
    marginTop: -8,
    paddingTop: 8,
    backgroundColor: figmaColors.primaryBlack,
    borderColor: figmaColors.primaryBlack,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 3,
  },
  errorText: {
    fontSize: 20,
    color: figmaColors.redAccent,
  },
  cardRoot: {
    flex: 1,
    maxWidth: 360,
    marginHorizontal: 16,
    borderRadius: 12,
    backgroundColor: figmaColors.greyDark,
    borderTopWidth: 1,
    borderTopColor: figmaColors.greyDarkBorder,
    paddingHorizontal: 16,
  },

  formView: {
    paddingVertical: 44,
    rowGap: 64,
  },
});
