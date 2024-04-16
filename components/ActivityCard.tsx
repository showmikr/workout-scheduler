import { View, Text, StyleSheet } from "react-native";
import ResistanceIcon from "../assets/icons/resistance_icon_grey.svg";

export function ActivityCard(props: {
  title: string;
  calories: number;
  date: Date;
}) {
  return (
    <View style={[activityStyles.outerView, { left: 10 }]}>
      <ResistanceIcon width={45} height={45} left={5} />
      <View style={activityStyles.titleView}>
        <Text
          style={{
            color: "#BDBDBD",
            fontSize: 16,
          }}
        >
          {props.title}
        </Text>
        <View style={activityStyles.rowView}>
          <Text
            style={{
              color: "#A53535",
              fontSize: 22,
              textAlign: "left",
            }}
          >
            {props.calories}
          </Text>
          <Text
            style={{
              color: "#A53535",
              fontSize: 17,
              textAlign: "left",
            }}
          >
            {"CAL"}
          </Text>

          <Text
            style={{
              color: "gray",
              fontSize: 14,
              flex: 1,
              textAlign: "right",
            }}
          >
            {props.date.toDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const activityStyles = StyleSheet.create({
  outerView: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    width: 370,
    borderRadius: 5,
    marginTop: 10,
    padding: 5,
  },
  titleView: {
    backgroundColor: "#1C1C1C",
    justifyContent: "space-evenly",
    left: 15,
  },
  rowView: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#1C1C1C",
    width: 300,
    alignItems: "baseline",
  },
});
