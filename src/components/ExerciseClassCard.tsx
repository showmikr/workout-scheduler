import { figmaColors } from "@/constants/Colors";
import BarbellIcon from "@/assets/icons/exercise-equipment/barbell_icon_16.svg";
import DumbbellIcon from "@/assets/icons/exercise-equipment/dumbbell_icon_16.svg";
import MachineIcon from "@/assets/icons/exercise-equipment/machine_icon_16.svg";
import BodyIcon from "@/assets/icons/exercise-equipment/bodyweight_icon_16.svg";
import { View, StyleSheet, Pressable } from "react-native";
import { ThemedText } from "./Themed";
import { FontAwesome6 } from "@expo/vector-icons";

const iconMap: Record<number, React.JSX.Element> = {
  1: <BarbellIcon width={48} height={48} fill={figmaColors.greyLighter} />,
  2: <DumbbellIcon width={48} height={48} fill={figmaColors.greyLighter} />,
  3: <MachineIcon width={48} height={48} fill={figmaColors.greyLighter} />,
  4: <BodyIcon width={48} height={48} fill={figmaColors.greyLighter} />,
};

const ExerciseClassCard = ({
  title,
  equipmentId,
  onPress,
}: {
  title: string;
  equipmentId: number;
  onPress: () => void;
}) => {
  return (
    <Pressable style={styles.cardContainer} onPress={onPress}>
      {iconMap[equipmentId] ?? (
        <FontAwesome6
          name="question-circle"
          size={46}
          color={figmaColors.greyLighter}
        />
      )}
      <View style={styles.mainContent}>
        <ThemedText style={styles.title} numberOfLines={2} ellipsizeMode="tail">
          {title}
        </ThemedText>
        {/* Placeholder for muscle groups. TODO: implement in a future commit */}
        <ThemedText
          style={styles.muscles}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Chest, Biceps, Shoulders
        </ThemedText>
      </View>
      <FontAwesome6 name="add" size={18} color={figmaColors.addGreen} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: figmaColors.greyDark,
    borderTopColor: figmaColors.greyDarkBorder,
    paddingHorizontal: 1 * 14,
    paddingVertical: 7,
    columnGap: 7,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    borderTopWidth: 1,
    borderTopEndRadius: 10,
    marginHorizontal: 1 * 14,
  },
  mainContent: {
    flexGrow: 1,
    flexShrink: 1,
    rowGap: 4,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  title: {
    color: figmaColors.primaryWhite,
    fontSize: 18,
  },
  muscles: {
    color: figmaColors.orangeAccent,
    fontSize: 14,
  },
});

export default ExerciseClassCard;
