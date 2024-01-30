import { LineChart, yAxisSides } from "react-native-gifted-charts";
import { View } from "../components/Themed";
import { Text, Button, Pressable } from "react-native";
import { openDB } from "../db-utils";
import { useState } from "react";

// Issue: Interpolating a null data point regardless of configuration will show an average value of previous and future data point values

type WorkoutSession = {
  appUserId: bigint;
  title: string;
  date: Date;
  calories: number;
  tiedToWorkout: boolean;
};

type CalorieData = {
  value: number | null;
  date: Date;
};

export default function Graph() {
  const [workoutSessionData, setWorkoutSessionData] = useState<
    WorkoutSession[] | null
  >(null);
  const [buttonSelected, setButtonSelected] = useState("1M");
  const buttons = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];

  // Returns a previous date (time) given # of weeks, months, years based on current time
  function getPriorTime(week: number, month: number, year: number) {
    return new Date(
      Date.now() - (657449982 * week + 2629799928 * month + 31557599136 * year)
    );
  }
  function getFirstDayOfWeek(timeFrame: Date) {
    return new Date(
      timeFrame.setDate(timeFrame.getDate() - timeFrame.getDay())
    );

    /*
    
    -
        timeFrame.getHours() * 3600000 -
        timeFrame.getMinutes() * 60000 -
        timeFrame.getSeconds() * 1000 -
        timeFrame.getMilliseconds()
    
    */
  }
  function getLastDayOfWeek(timeFrame: Date) {
    return new Date(
      timeFrame.setDate(timeFrame.getDate() - timeFrame.getDay() + 6) +
        (24 - timeFrame.getHours()) * 3600000 -
        timeFrame.getMinutes() * 60000 -
        timeFrame.getSeconds() * 1000 -
        timeFrame.getMilliseconds() -
        1
    );
  }
  function getFirstDayOfMonth(timeFrame: Date) {
    return new Date(timeFrame.getFullYear(), timeFrame.getMonth(), 1);
  }
  function getLastDayOfMonth(timeFrame: Date) {
    return new Date(
      new Date(timeFrame.getFullYear(), timeFrame.getMonth() + 1, 1).getTime() -
        1
    );
  }

  // Averages data bases on the length of time given
  function averagePlotData(data: CalorieData[] | null) {
    // Looks messy, code clean up if possible
    let res = [];
    if (!data || data.length < 1) {
      return [
        { value: 404, date: new Date(Date.now()) },
        { value: 404, date: new Date(Date.now()) },
      ];
    } else if (
      31557599136 <
      data[data.length - 1].date.getTime() - data[0].date.getTime()
    ) {
      // 1 year -> average months
      let curr = 0;
      let first = getFirstDayOfMonth(data[0].date);
      let last = getLastDayOfMonth(data[0].date);

      while (first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (curr < data.length && data[curr].date < last) {
          avg += data[curr].value!;
          amt += 1;
          curr += 1;
        }
        amt == 0
          ? res.push({
              value: null,
              date: first,
            })
          : res.push({ value: Math.round(avg / amt), date: first });
        first = getFirstDayOfMonth(new Date(last.getTime() + 1));
        last = getLastDayOfMonth(first);
      }
    } else {
      // 6 months -> average weeks
      let curr = 0;
      let first = getFirstDayOfWeek(data[0].date);
      let last = getLastDayOfWeek(data[0].date);
      while (first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (curr < data.length && data[curr].date < last) {
          avg += data[curr].value!;
          amt += 1;
          curr += 1;
        }
        amt == 0
          ? res.push({
              value: null,
              date: first,
            })
          : res.push({
              value: Math.round(avg / amt),
              date: first,
            });
        first = getFirstDayOfWeek(new Date(last.getTime() + 1));
        last = getLastDayOfWeek(first);
      }
    }
    return res;
  }

  // 1) Load user data
  if (!workoutSessionData) {
    openDB().then((db) => {
      //console.log("Reading from DB");
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

  // 2) Extract user calorie data
  const graphData: CalorieData[] | undefined = workoutSessionData?.map((ws) => {
    return {
      value: ws.calories,
      date: ws.date,
    };
  });

  // Button range logic
  let maxGraphValue = graphData?.reduce((p, c) =>
    p.value! > c.value! ? p : c
  );
  let graphInput = graphData;
  if (buttonSelected === "1W") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(1, 0, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "1M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 1, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "3M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 3, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "6M") {
    (graphInput = graphData?.filter(
      (wk) => new Date(wk.date) > getPriorTime(0, 6, 0)
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "YTD") {
    (graphInput = averagePlotData(
      graphData?.filter(
        (wk) => new Date(wk.date) > new Date(new Date().getFullYear(), 0, 1)
      )!
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "1Y") {
    (graphInput = averagePlotData(
      graphData?.filter((wk) => new Date(wk.date) > getPriorTime(0, 0, 1))!
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else {
    graphInput = averagePlotData(graphData!);
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
      {/* Chart View */}
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
        //interpolateMissingValue={false}
        width={345}
        overflowTop={70}
        //DataPoints
        hideDataPoints={true}
        dataPointsColor="#A53535"
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
          Math.ceil((maxGraphValue ? maxGraphValue?.value! : 400) / 100) * 100
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
      {/* Button View */}
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
