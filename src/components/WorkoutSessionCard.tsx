import { Pressable, StyleSheet, View } from "react-native";
import { ThemedText } from "./Themed";
import ResistanceIcon from "@/assets/icons/resistance_icon_grey.svg";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { colorBox } from "@/constants/Colors";

type WorkoutSessionDisplayCardProps = {
  title: string;
  calories: number;
  dateDisplay: string;
  onPress?: () => void;
};

const WorkoutSessionDisplayCard = ({
  title,
  calories,
  dateDisplay,
  onPress,
}: WorkoutSessionDisplayCardProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <ResistanceIcon
        style={styles.resistanceIcon}
        fill={"blue"}
        height={36}
        width={36}
      />
      <View style={styles.mainContent}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <View style={styles.bottomContent}>
          <View style={styles.calorieContainer}>
            <FontAwesome6
              name="fire-flame-curved"
              color={styles.calories.color}
              style={{
                fontSize: styles.calories.fontSize * 0.725,
              }}
            />
            <ThemedText style={styles.calories}>{calories} CAL</ThemedText>
          </View>
          <ThemedText style={styles.date}>{dateDisplay}</ThemedText>
        </View>
      </View>
      <View style={styles.chevron}>
        <FontAwesome6
          name="chevron-right"
          size={20}
          color={colorBox.stoneGrey500}
        />
      </View>
    </Pressable>
  );
};

const globalFontSize = 16;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 12,
    borderRadius: 12,
    backgroundColor: colorBox.stoneGrey850,
    borderTopColor: colorBox.stoneGrey800,
    borderTopWidth: 1,
    borderBottomColor: colorBox.stoneGrey900,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: globalFontSize,
    color: colorBox.stoneGrey100,
  },
  calories: {
    fontSize: globalFontSize,
    color: colorBox.red300,
  },
  date: {
    fontSize: globalFontSize,
    color: colorBox.stoneGrey400,
  },
  bottomContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  calorieContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mainContent: {
    flex: 1,
    rowGap: 4,
  },
  resistanceIcon: {
    alignSelf: "center",
  },
  chevron: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
});

export { WorkoutSessionDisplayCard };
