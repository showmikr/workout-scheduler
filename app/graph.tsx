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

  // let w = 0;
  // let m = 0;
  // let y = 1;
  // console.log(
  //   "W:" + w + ", M: " + m + ", Y: " + y + " | " + getPriorTime(w, m, y)
  // );

  function getPriorTime(week: number, month: number, year: number) {
    return new Date(
      Date.now() - (657449982 * week + 2629799928 * month + 31557599136 * year)
    ).toDateString();
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

  // workoutSessionData?.sort(function (a, b) {
  //   return a.date.getTime() - b.date.getTime();
  // });

  console.log(
    workoutSessionData?.map((ws) => {
      return { value: ws.calories, date: ws.date.toDateString() };
    })
  );

  // 2) Insert data into graph
  const graphData = workoutSessionData?.map((ws) => {
    return {
      value: ws.calories,
      date: ws.date.toDateString().substring(3, ws.date.toDateString().length),
    };
  });

  return (
    <View
      style={{
        //flex: 1,
        //alignItems: 'center',
        //justifyContent: 'center',
        paddingVertical: 100,
        paddingLeft: 0,
        backgroundColor: "#1C1C1C",
      }}
    >
      <LineChart
        // Chart
        areaChart
        data={graphData}
        rotateLabel
        width={350}
        overflowTop={0}
        hideDataPoints
        spacing={19}
        // Gradient
        color="#A53535"
        thickness={2}
        startFillColor="rgba(165,53,53,1)"
        endFillColor="rgba(165,53,53,1)"
        startOpacity={0.6}
        endOpacity={0.1}
        initialSpacing={10}
        noOfSections={4}
        maxValue={400}
        yAxisColor="white"
        yAxisThickness={0}
        rulesColor="#252525"
        yAxisTextStyle={{ color: "gray" }}
        xAxisColor="#575757"
        yAxisSide={yAxisSides.LEFT}
        pointerConfig={{
          pointerStripHeight: 160,
          pointerStripColor: "lightgray",
          pointerStripWidth: 2,
          pointerColor: "white",
          radius: 6,
          pointerLabelWidth: 100,
          pointerLabelHeight: 90,
          activatePointersOnLongPress: true,
          autoAdjustPointerLabelPosition: false,
          pointerLabelComponent: (
            items: {
              value: number;
              date: string;
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
                  backgroundColor: "#1C1C1C",
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontSize: 14,
                    marginBottom: 6,
                    textAlign: "center",
                  }}
                >
                  {items[0].date}
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
        style={{ backgroundColor: "#1C1C1C", justifyContent: "space-evenly" }}
      >
        <Pressable
          style={{
            backgroundColor: "#343434",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>1W</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>1M</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>3M</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>6M</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 35,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>YTD</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>1Y</Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor: "#1C1C1C",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 4,
            paddingHorizontal: 4,
            borderRadius: 4,
            elevation: 3,
            width: 30,
            height: 30,
          }}
        >
          <Text style={{ color: "white" }}>2Y</Text>
        </Pressable>
      </View>
    </View>
  );
}
