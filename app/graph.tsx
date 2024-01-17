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

  // Load Calories + Dates
  if (!workoutSessionData) {
    openDB().then((db) => {
      console.log("Reading from DB");
      db.transaction(
        (transaction) => {
          transaction.executeSql(
            "select * from workout_session",
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

  const ptData = workoutSessionData?.map((ws) => {
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
        paddingLeft: 20,
        backgroundColor: "#1C1C1C",
      }}
    >
      <LineChart
        // Chart
        areaChart
        data={ptData}
        rotateLabel
        width={300}
        overflowTop={0}
        hideDataPoints
        spacing={22}
        // Gradient
        color="#A53535"
        thickness={2}
        startFillColor="rgba(165,53,53,1)"
        endFillColor="rgba(165,53,53,1)"
        startOpacity={0.6}
        endOpacity={0.1}
        initialSpacing={20}
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
    </View>
  );
}
