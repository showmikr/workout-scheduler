import { twColors } from "@/constants/Colors";
import { View, Text } from "@/components/Themed";

function WorkoutHeader({ title }: { title: string }) {
  return (
    <View
      style={{
        alignItems: "center",
        paddingBottom: 1.5 * 14,
        paddingTop: 1.5 * 14,
      }}
    >
      <Text style={{ fontSize: 1.875 * 14, lineHeight: 2.25 * 14 }}>
        {title}
      </Text>
      <View
        style={{
          marginTop: 16,
          width: "90%",
          borderBottomWidth: 1,
          borderColor: twColors.neutral700,
          justifyContent: "flex-end",
        }}
      />
    </View>
  );
}

export default WorkoutHeader;
