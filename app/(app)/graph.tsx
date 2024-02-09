import { BarChart, LineChart, yAxisSides } from "react-native-gifted-charts";
import { View } from "../../components/Themed";
import { Text, Button, Pressable } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";

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
  const myDB = useSQLiteContext();
  
  
  const [workoutSessionData, setWorkoutSessionData] = useState<WorkoutSession[] | null>(null);
  const [buttonSelected, setButtonSelected] = useState("1M");
  const [graphType, setGraphType] = useState(true)
  const buttons = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];
  
  const DAY_MS = 93921426;
  const WEEK_MS = 657449982;
  const MONTH_MS = 2629799928;
  const YEAR_MS = 31557599136;


  // Returns a previous date (time) given # of weeks, months, years based on current time
  function getPriorTime(week: number, month: number, year: number) {
    return new Date(
      Date.now() - (WEEK_MS * week + MONTH_MS * month + YEAR_MS * year)
    );
  }
  function getFirstDayOfWeek(timeFrame: Date) {
    return new Date(
      timeFrame.setDate(timeFrame.getDate() - timeFrame.getDay())
    );

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
  function getDayOfWeekString(numberOfWeek: number) {
    switch (numberOfWeek) {
      case 0:
        return "Sunday";
      case 1:
        return "Monday";
      case 2:
        return "Tuesday";
      case 3:
        return "Wednesday";
      case 4:
        return "Thursday";
      case 5:
        return "Friday";
      case 6:
        return "Saturday";
      default:
        return "Error: Unsupported Type | getNumberToStringDayOfWeek()";
    }
  }
  // Averages data bases on the length of time given
  function averagePlotData(data: CalorieData[] | undefined) {
    // Looks messy, code clean up if possible
    let res = [];
    if (!data || data.length < 1) {
      console.log("Not enough data or data does not exist.");
      res = [
        {
          value: 404,
          date: new Date(new Date().getTime() - DAY_MS  * 2),
        },
        { value: 404, date: new Date(new Date().getTime() - DAY_MS) },
        { value: 404, date: new Date(new Date().getTime()) },
      ];
    } else if (
      YEAR_MS <
      data[data.length - 1].date.getTime() - data[0].date.getTime()
    ) {
      // Greater than 1 year -> average months
      console.log("Greater than 1 year");
      let curr = 0;
      let first = getFirstDayOfMonth(data[0].date);
      let last = getLastDayOfMonth(data[0].date);

      while (first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (curr < data.length && data[curr].date < last) {
          avg += data[curr].value!;
          (
            curr != 0 &&
            data[curr].date.toDateString() ===
              data[curr - 1].date.toDateString()
          ) ?
            amt
          : (amt += 1);
          curr += 1;
        }
        amt == 0 ?
          res.push({
            value: null,
            date: first,
          })
        : res.push({
            value: Math.round(avg / amt),
            date: first,
          });
        first = getFirstDayOfMonth(new Date(last.getTime() + 1));
        last = getLastDayOfMonth(first);
      }
    } else if (
      MONTH_MS * 3 <
      data[data.length - 1].date.getTime() - data[0].date.getTime()
    ) {
      // Greater than 6 months -> average weeks
      console.log("Greater than 3 months");
      let curr = 0;
      let first = getFirstDayOfWeek(data[0].date);
      let last = getLastDayOfWeek(data[0].date);
      while (curr < data.length && first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (curr < data.length && data[curr].date < last) {
          avg += data[curr].value!;
          (
            curr != 0 &&
            data[curr].date.toDateString() ===
              data[curr - 1].date.toDateString()
          ) ?
            amt
          : (amt += 1);
          curr += 1;
        }
        amt == 0 ?
          res.push({
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
    } else if (
      WEEK_MS <
      data[data.length - 1].date.getTime() - data[0].date.getTime()
    ) {
      // Greater than 1 week -> keep data as is (just calculate totals)
      console.log("Greater than 1 week");
      let curr = 0;
      let first = new Date(data[0].date);
      let last = new Date();
      while (first < last) {
        let total = 0;

        while (
          curr < data.length &&
          first.toDateString() === data[curr].date.toDateString()
        ) {
          total += data[curr].value!;
          curr += 1;
        }
        total === 0 ?
          res.push({
            value: null,
            date: first,
          })
        : res.push({
            value: Math.round(total),
            date: first,
          });
        first.setHours(0,0,0,0)
        first = new Date(first.getTime() + DAY_MS);
      }
    } else {
      // Data is equal (=) or less than (<) week -> Interpolate to correctly show day to day spacing for a week
      console.log("<= 1 week");
      let curr = 0;
      let first = new Date(getPriorTime(1, 0, 0).setHours(0, 0, 0, 0) + DAY_MS);
      let last = new Date();
      while (first <= last) {
        let total = 0;
        while (
          curr < data.length &&
          first.toDateString() === data[curr].date.toDateString()
        ) {
          total += data[curr].value!;
          curr += 1;
        }
        total == 0 ?
          res.push({
            value: 0,
            date: first,
            label: getDayOfWeekString(first.getDay()),
          })
        : res.push({
            value: Math.round(total),
            date: first,
            label: getDayOfWeekString(first.getDay()),
          });
        first = new Date(first.getTime() + DAY_MS);
      }
    }
    return res;
  }

  // 1) Load user data
  if (!workoutSessionData) {
    myDB
      .getAllAsync<any>("SELECT * FROM workout_session AS ws ORDER BY ws.date")
      .then((result) => {
        const workoutRows = result.map((row) => {
          const { app_user_id, title, date, calories, tied_to_workout } = row;
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
      })
      .catch((err) => {
        console.log("DB READ ERROR | " + err);
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
    (graphInput = averagePlotData(
      graphData?.filter((wk) => new Date(wk.date) > getPriorTime(1, 0, 0))
    )),
      (maxGraphValue = averagePlotData(graphInput)?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "1M") {
    (graphInput = averagePlotData(
      graphData?.filter((wk) => new Date(wk.date) > getPriorTime(0, 1, 0))
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "3M") {
    (graphInput = averagePlotData(
      graphData?.filter((wk) => new Date(wk.date) > getPriorTime(0, 3, 0))
    )),
      (maxGraphValue = graphInput?.reduce((p, c) =>
        p.value! > c.value! ? p : c
      ));
  } else if (buttonSelected === "6M") {
    (graphInput = averagePlotData(
      graphData?.filter((wk) => new Date(wk.date) > getPriorTime(0, 6, 0))
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
        backgroundColor: "#0D0D0D", //white
      }}
    >
      {/* Chart View */}
      {graphType ? <LineChart
        areaChart
        // Chart //
        isAnimated={true}
        animationDuration={1000}
        //animateOnDataChange={true}
        adjustToWidth={true}
        disableScroll={true}
        data={graphInput}
        //https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts/issues/149
        //xAxisLabelTextStyle // The key to making labels better?
        //labelTextStyle={} // The key to making labels better?
        rotateLabel
        width={345}
        overflowTop={70}
        // Data //
        onlyPositive={true}
        hideDataPoints={true}
        dataPointsColor="#A53535"
        // interpolateMissingValue={false}
        // focusEnabled={true}
        // showDataPointOnFocus={false}
        // showStripOnFocus={false}
        // stripOpacity={2}
        // Gradient //
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
        yAxisTextStyle={{ color: "gray" }}
        yAxisSide={yAxisSides.LEFT}
        xAxisColor="#575757"
        rulesColor="#252525"
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
      /> : <BarChart
      width={345}
      adjustToWidth={true}
      barWidth={5}
      overflowTop={70}
      frontColor="#A53535"
      noOfSections={4}
      maxValue={
        Math.ceil((maxGraphValue ? maxGraphValue?.value! : 400) / 100) * 100
      }
      spacing={2}
      initialSpacing={7.5}
      yAxisColor="#575757"
      yAxisThickness={0}
      yAxisTextStyle={{ color: "gray" }}
      yAxisSide={yAxisSides.LEFT}
      xAxisColor="#575757"
      rulesColor="#252525"
      data={graphInput}
      // pointerConfig={{
      //   pointerStripHeight: 250,
      //   pointerStripColor: "lightgray",
      //   pointerStripWidth: 2,
      //   pointerColor: "white",
      //   radius: 6,
      //   pointerLabelWidth: 100,
      //   pointerLabelHeight: 90,
      //   activatePointersOnLongPress: false,

      //   autoAdjustPointerLabelPosition: false,
      //   pointerLabelComponent: (
      //     items: {
      //       value: number;
      //       date: Date;
      //       label: string;
      //       labelTextStyle?: {
      //         color: string;
      //         width: number;
      //       };
      //     }[]
      //   ) => {
      //     return (
      //       <View
      //         style={{
      //           flex: 1,
      //           borderRadius: 16,
      //           justifyContent: "center",
      //           paddingVertical: 5,
      //           paddingHorizontal: 5,
      //           marginVertical: 20,
      //           marginHorizontal: -10,
      //           backgroundColor: "#0D0D0D",
      //         }}
      //       >
      //         <Text
      //           style={{
      //             color: "white",
      //             fontSize: 14,
      //             marginBottom: 6,
      //             textAlign: "center",
      //             fontWeight: "300",
      //           }}
      //         >
      //           {items[0].date
      //             .toDateString()
      //             .substring(4, items[0].date.toDateString().length)}
      //         </Text>
      //         <View
      //           style={{
      //             paddingHorizontal: 14,
      //             borderRadius: 16,
      //             backgroundColor: "white",
      //           }}
      //         >
      //           <Text
      //             style={{
      //               fontWeight: "bold",
      //               textAlign: "center",
      //               fontSize: 18,
      //             }}
      //           >
      //             {items[0].value + " Cal"}
      //           </Text>
      //         </View>
      //       </View>
      //     );
      //   },
      // }}
      />}


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
      <View
      style={{
        paddingVertical: 10,
        justifyContent: "center",
      alignItems: 'center'}}>
      <Pressable
              style={{
                backgroundColor:"#1C1C1C",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 4,
                paddingHorizontal: 4,
                borderRadius: 4,
                elevation: 3,
                width: 80,
                height: 30,
              }}
              onPress={() => {
                setGraphType(!graphType)
                console.log(graphType)
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "300",
                }}
              >
                {graphType ? "LineChart" :"BarChart"}
              </Text>
        </Pressable>
      </View>
    </View>
  );
}
