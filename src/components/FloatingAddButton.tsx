import { twColors } from "@/constants/Colors";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable } from "react-native";

const FloatingAddButton = ({ onPress }: { onPress: () => void }) => {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: "row",
        position: "absolute",
        right: 3 * 14,
        bottom: 2 * 14,
        alignItems: "center",
        justifyContent: "center",
        height: 4 * 14,
        width: 4 * 14,
        borderRadius: 3 * 14 * 0.8,
        borderWidth: 1,
        borderColor: twColors.neutral800,
        opacity: pressed ? 0.7 : 1,
        backgroundColor: twColors.neutral400,
      })}
      onPress={onPress}
    >
      <MaterialIcons
        style={{ fontSize: 3 * 14 }}
        color={twColors.neutral700}
        name="add"
      />
    </Pressable>
  );
};

export default FloatingAddButton;
