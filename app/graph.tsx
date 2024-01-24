import { LineChart, yAxisSides } from "react-native-gifted-charts";
import { View } from "../components/Themed";
import { Text, Button, Pressable } from "react-native";
import { openDB } from "../db-utils";
import { useState } from "react";

type WorkoutSession = {
  appUserId: bigint;
  title: string;
  date: Date;
  calories: number;
  tiedToWorkout: boolean;
};

export default function Graph() {
  const [workoutSessionData, setWorkoutSessionData] = useState(
    null as WorkoutSession[] | null
  );
  const [buttonSelected, setButtonSelected] = useState("1M");
  const buttons = ["1W", "1M", "3M", "6M", "YTD", "1Y", "2Y", "ALL"];

  function getPriorTime(week: number, month: number, year: number) {
    return new Date(
      Date.now() - (657449982 * week + 2629799928 * month + 31557599136 * year)
    );
  }

  // 1) Load Calories + Dates
  if (!workoutSessionData) {
    openDB().then((db) => {
      console.log("Reading from DB");
      db.transaction(
        (transaction) => {
          transaction.executeSql(
            "select * from workout_session as ws order by ws.date",
            undefined,
            (_trx, resultSet) => {
              const rawData = resultSet.rows._array;

              const workoutRows = rawData.map((row) => {
                const { app_user_id, title, date, calories, tied_to_workout } =
                  row;
                const readData: WorkoutSession = {
                  appUserId: app_user_id,
                  title: title,
                  date: new Date(date),
                  calories: calories,
                  tiedToWorkout: tied_to_workout,
                };
                return readData;
              });

              setWorkoutSessionData(workoutRows);
            }
          );
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  // 2) Insert data into graph
  const graphData = workoutSessionData?.map((ws) => {
    return {
      value: ws.calories,
      date: ws.date,
    };
  });

  let maxGraphValue = graphData?.reduce((p, c) => (p.value > c.value ? p : c));
  let graphInput = graphData;
  if (buttonSelected === "1W") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(1, 0, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "1M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 1, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "3M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 3, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "6M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 6, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "YTD") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > new Date(new Date().getFullYear(), 0, 1)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "1Y") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 0, 1)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else if (buttonSelected === "2Y") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 0, 2)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value > c.value ? p : c
      ));
  } else {
    graphInput = graphData;
  }

  return (
    <View
      style={{
        flex: 1,
        //alignItems: 'center',
        justifyContent: "center",
        paddingVertical: 134,
        paddingLeft: 0,
        backgroundColor: "#0D0D0D",
      }}
    >
      <LineChart
        // Chart
        isAnimated={true}
        animationDuration={1000}
        //animateOnDataChange={true}
        adjustToWidth={true}
        disableScroll={true}
        areaChart
        data={graphInput}
        rotateLabel
        width={345}
        overflowTop={70}
        hideDataPoints
        // Gradient
        color="#A53535"
        thickness={2}
        startFillColor="rgba(165,53,53,1)"
        endFillColor="rgba(165,53,53,1)"
        startOpacity={0.6}
        endOpacity={0.1}
        initialSpacing={7.5}
        noOfSections={4}
        maxValue={
          Math.ceil((maxGraphValue ? maxGraphValue?.value : 400) / 100) * 100
        }
        yAxisColor="#575757"
        yAxisThickness={0}
        rulesColor="#252525"
        yAxisTextStyle={{ color: "gray" }}
        xAxisColor="#575757"
        yAxisSide={yAxisSides.LEFT}
        pointerConfig={{
          pointerStripHeight: 250,
          pointerStripColor: "lightgray",
          pointerStripWidth: 2,
          pointerColor: "white",
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: false,

          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (
            items: {
              value: number;
              date: Date;
              label: string;
              labelTextStyle?: {
                color: string;
                width: number;
              };
            }[]
          ) => {
            return (
              <View
                style={{
                  flex: 1,
                  borderRadius: 16,
                  justifyContent: "center",
                  paddingVertical: 5,
                  paddingHorizontal: 5,
                  marginVertical: 20,
                  marginHorizontal: -10,
                  backgroundColor: "#0D0D0D",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    marginBottom: 6,
                    textAlign: "center",
                    fontWeight: "300",
                  }}
                >
                  {items[0].date
                    .toDateString()
                    .substring(4, items[0].date.toDateString().length)}
                </Text>

                <View
                  style={{
                    paddingHorizontal: 14,
                    borderRadius: 16,
                    backgroundColor: "white",
                  }}
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      textAlign: "center",
                      fontSize: 18,
                    }}
                  >
                    {items[0].value + " Cal"}
                  </Text>
                </View>
              </View>
            );
          },
        }}
      />
      <View
        className="flex flex-row "
        style={{ backgroundColor: "#0D0D0D", justifyContent: "space-evenly" }}
      >
        {buttons.map((title) => {
          return (
            <Pressable
              style={{
                backgroundColor:
                  buttonSelected === title ? "#343434" : "#1C1C1C",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
                paddingHorizontal: 4,
                borderRadius: 4,
                elevation: 3,
                width: title === "YTD" ? 36 : 30,
                height: 30,
              }}
              onPress={() => {
                setButtonSelected(title);
              }}
              key={title}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: buttonSelected === title ? "bold" : "300",
                }}
              >
                {title}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
