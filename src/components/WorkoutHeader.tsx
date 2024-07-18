import { twColors } from "@/constants/Colors";
import { ThemedView, ThemedText } from "@/components/Themed";

function WorkoutHeader({ title }: { title: string }) {
  return (
    <ThemedView
      style={{
        alignItems: "center",
        paddingBottom: 1.5 * 14,
        paddingTop: 1.5 * 14,
      }}
    >
      <ThemedText style={{ fontSize: 1.875 * 14, lineHeight: 2.25 * 14 }}>
        {title}
      </ThemedText>
      <ThemedView
        style={{
          marginTop: 16,
          width: "90%",
          borderBottomWidth: 1,
          borderColor: twColors.neutral700,
          justifyContent: "flex-end",
        }}
      />
    </ThemedView>
  );
}

export default WorkoutHeader;
