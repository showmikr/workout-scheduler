import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Workout } from "@/utils/query-workouts";
import { ThemedText } from "@/components/Themed";
import ResistanceIcon from "@/assets/icons/resistance_icon_grey.svg";
import { FontAwesome6 } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { CardOptionsUnderlay } from "./ExerciseSwipeable";
type WorkoutCardProps = { workout: Workout; tags: string[] };

export default function WorkoutCard(props: WorkoutCardProps) {
  const { id, title } = props.workout;
  return (
    <Swipeable
      renderRightActions={(_progress, dragX) => (
        <CardOptionsUnderlay
          dragX={dragX}
          onPress={() => {
            console.log("TODO Implement Delete Workout");
          }}
        />
      )}
      friction={1.8}
      rightThreshold={20}
      dragOffsetFromLeftEdge={30}
    >
      <Pressable
        onPress={() => {
          router.push({
            pathname: "/workouts/[workoutId]",
            params: { workoutId: id, workoutTitle: title },
          });
        }}
        style={styles.cardContainer}
      >
        <ResistanceIcon width={36} height={36} />
        <View style={styles.mainContent}>
          <ThemedText
            style={[styles.titleStyle]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {title}
          </ThemedText>
        </View>
        <Pressable
          style={styles.optionsIcon}
          hitSlop={10}
          onPress={() => {
            console.log("ellipsis pressed");
          }}
        >
          <FontAwesome6 name="ellipsis" size={20} color="#575757" />
        </Pressable>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  titleStyle: {
    fontSize: 20,
  },
  cardContainer: {
    justifyContent: "flex-start",
    alignItems: "center",
    flexDirection: "row",
    gap: 1 * 14,
    paddingVertical: 2 * 14,
    marginHorizontal: 1 * 14,
    paddingHorizontal: 1 * 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#3D3D3D",
  },
  mainContent: {
    flexShrink: 1, // Allow the text to shrink if it doesn't fit
  },
  optionsIcon: {
    marginLeft: "auto",
  },
});
