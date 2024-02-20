import {
  BarChart,
  LineChart,
  yAxisSides,
  ruleTypes,
} from "react-native-gifted-charts";
import { View } from "../../components/Themed";
import { Text, Pressable, StyleSheet, TextStyle } from "react-native";
import { useSQLiteContext } from "expo-sqlite/next";
import { useState } from "react";

type WorkoutSession = {
  appUserId: bigint;
  title: string;
  date: Date;
  calories: number;
  tiedToWorkout: boolean;
};

type UserBodyWeight = {
  appUserId: bigint;
  weight: number;
  date: Date;
};

type CalorieData = {
  value: number | null;
  date: Date;
  label?: string | null;
  labelTextStyle?: TextStyle;
};

type UserBodyWeightData = {
  value: number | null;
  date: Date;
  label?: string | null;
  labelTextStyle?: TextStyle;
};

// type DataBaseQueryTest = {
//   id: number;
//   title: string;
//   calories: number;
//   elapsedTime: number;
//   date: Date;
//   majorityCategory: string;
// };

export default function Graph() {
  const myDB = useSQLiteContext();

  const [workoutSessionData, setWorkoutSessionData] = useState<
    WorkoutSession[] | null
  >(null);
  const [bodyWeightData, setBodyWeightData] = useState<UserBodyWeight[] | null>(
    null
  );
  const [graphRange, setGraphRange] = useState("1M");
  const graphRangeButtons = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];
  const [graphDataType, setGraphDataType] = useState("calorie"); // 0: calories, 1: body-weight, 2: personal-records
  const graphDataTypeButtons = ["calorie", "bodyweight"];
  const [graphType, setGraphType] = useState(true); // true -> LineChart; false -> BarChart

  const DAY_MS = 93921426;
  const WEEK_MS = 657449982;
  const MONTH_MS = 2629799928;
  const YEAR_MS = 31557599136;

  let rawInputLength: number | undefined = 0;
  let rawInputCalories: number = 0;

  // Returns a previous date (time) given # of weeks, months, years based on current time
  function getPriorTime(week: number, month: number, year: number) {
    return new Date(
      Date.now() - (WEEK_MS * week + MONTH_MS * month + YEAR_MS * year)
    );
  }
  function getFirstDayOfWeek(timeFrame: Date) {
    let copyDate = new Date(timeFrame);
    return new Date(
      new Date(
        copyDate.setDate(copyDate.getDate() - copyDate.getDay())
      ).setHours(0, 0, 0, 0)
    );
  }
  function getLastDayOfWeek(timeFrame: Date) {
    let copyDate = new Date(timeFrame);
    return new Date(
      copyDate.setDate(copyDate.getDate() - copyDate.getDay() + 6) +
        (24 - copyDate.getHours()) * 3600000 -
        copyDate.getMinutes() * 60000 -
        copyDate.getSeconds() * 1000 -
        copyDate.getMilliseconds() -
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
  function averagePlotData(
    data: CalorieData[] | UserBodyWeightData[] | undefined
  ) {
    // Looks messy, code clean up if possible
    // going to change logic to be more "functional" in the future...
    rawInputLength = data?.length;
    rawInputCalories = 0;
    data?.forEach((obj) => {
      rawInputCalories += obj.value ? obj.value : 0;
    });
    let res: CalorieData[] = [];
    if (!data || data.length < 1) {
      console.log("Not enough data or data does not exist.");
      res = [
        {
          value: 404,
          date: new Date(new Date().getTime() - DAY_MS * 2),
        },
        { value: 404, date: new Date(new Date().getTime() - DAY_MS) },
        { value: 404, date: new Date(new Date().getTime()) },
      ];
    } else if (MONTH_MS * 6 < Date.now() - data[0].date.getTime()) {
      // Greater than 1 year -> average months
      console.log("1 year view");
      let idx = 0;
      let first = getFirstDayOfMonth(data[0].date);
      let last = getLastDayOfMonth(data[0].date);
      while (first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (idx < data.length && data[idx].date < last) {
          avg += data[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            amt === 0 ?
              idx === data.length ?
                0
              : null
            : Math.round(avg / amt),
          date: first,
          label:
            graphRange === "ALL" ?
              first.getMonth() === 1 ?
                first.toDateString().substring(11)
              : null
            : first.toDateString().substring(4, 7),
          labelTextStyle:
            graphRange === "ALL" ? graphStyle.allLabel : graphStyle.yearLabel,
        });

        first = getFirstDayOfMonth(new Date(last.getTime() + 1));
        last = getLastDayOfMonth(new Date(first));
      }
    } else if (MONTH_MS < Date.now() - data[0].date.getTime()) {
      console.log("3-6 month view");
      let idx = 0;
      let first = getFirstDayOfWeek(data[0].date);
      let last = getLastDayOfWeek(data[0].date);
      let currMonth = getFirstDayOfMonth(
        new Date(data[0].date.getTime() + (graphRange === "YTD" ? 0 : MONTH_MS))
      );
      while (idx < data.length && first < data[data.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (
          idx < data.length &&
          getFirstDayOfWeek(data[idx].date).toDateString() ===
            getFirstDayOfWeek(first).toDateString()
        ) {
          avg += data[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            amt === 0 ?
              idx === data.length ?
                0
              : null
            : Math.round(avg / amt),
          date: first,
          label:
            first > currMonth ? currMonth.toDateString().substring(4, 8) : null,
          labelTextStyle: graphStyle.weekLabel,
        });
        if (first > currMonth) {
          currMonth = new Date(
            getLastDayOfMonth(new Date(currMonth)).getTime() + 1
          );
        }

        first = getFirstDayOfWeek(new Date(last.getTime() + 1));
        last = getLastDayOfWeek(new Date(first));
      }
    } else if (WEEK_MS < Date.now() - data[0].date.getTime()) {
      // Greater than 1 month -> keep data as is (just calculate totals)
      console.log("1 month view");
      let idx = 0;
      let first = new Date(data[0].date);
      let last = new Date();
      while (first < last) {
        let total = 0;
        let amt = 0;
        while (
          idx < data.length &&
          first.toDateString() === data[idx].date.toDateString()
        ) {
          total += data[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            total === 0 ?
              idx === data.length ?
                0
              : null
            : Math.round(graphDataType === "calorie" ? total : total / amt),
          date: first,
          label:
            first.toDateString() === getFirstDayOfWeek(first).toDateString() ?
              first.toDateString().substring(4, 10)
            : null,
          labelTextStyle: graphStyle.weekLabel,
        });

        first.setHours(0, 0, 0, 0);
        first = new Date(first.getTime() + DAY_MS);
      }
    } else {
      // Data is equal (=) or less than (<) week -> Interpolate to correctly show day to day spacing for a week
      console.log("1 week view");
      let idx = 0;
      let first = new Date(getPriorTime(1, 0, 0).setHours(0, 0, 0, 0) + DAY_MS);
      const last = new Date();
      while (first <= last) {
        let total = 0;
        while (
          idx < data.length &&
          first.toDateString() === data[idx].date.toDateString()
        ) {
          total += data[idx].value!;
          idx += 1;
        }

        res.push({
          value: total && Math.round(total),
          date: first,
          label: getDayOfWeekString(first.getDay()).substring(0, 3),
          labelTextStyle: graphStyle.dailyLabel,
        });

        first.setHours(0, 0, 0, 0);
        first = new Date(first.getTime() + DAY_MS);
      }
    }
    return res;
  }
  // Returns data based selected data type from buttons selection
  function getSelectedData(selectedData: string) {
    switch (selectedData) {
      case "calorie":
        return graphCalorieData;
      case "bodyweight":
        return graphBodyWeightData;
      default:
        return graphCalorieData;
    }
  }
  // 1) Load calorie data
  if (!workoutSessionData) {
    myDB
      .getAllAsync<any>("SELECT * FROM workout_session AS ws ORDER BY ws.date")
      .then((result) => {
        const queryRows = result.map((row) => {
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

        setWorkoutSessionData(queryRows);
      })
      .catch((err) => {
        console.log("DB READ ERROR | " + err);
      });
  }
  // 2) Extract calorie data
  const graphCalorieData: CalorieData[] | undefined = workoutSessionData?.map(
    (ws) => {
      return {
        value: ws.calories,
        date: ws.date,
      };
    }
  );

  // 1) Load body-weight data
  if (!bodyWeightData) {
    myDB
      .getAllAsync<any>(
        "SELECT * FROM user_bodyweight AS ubw ORDER BY ubw.date"
      )
      .then((result) => {
        const queryRows = result.map((row) => {
          const { app_user_id, weight, date } = row;
          const readData: UserBodyWeight = {
            appUserId: app_user_id,
            weight: weight,
            date: new Date(date),
          };
          return readData;
        });

        setBodyWeightData(queryRows);
      })
      .catch((err) => {
        console.log("DB READ ERROR | " + err);
      });
  }
  // 2) Extract body-weight data
  const graphBodyWeightData: UserBodyWeightData[] | undefined =
    bodyWeightData?.map((ubw) => {
      return {
        value: ubw.weight,
        date: ubw.date,
      };
    });

  // // TESTING DB QUERY
  // console.log("Attempting DB Test Query");
  // myDB
  //   .getAllAsync<any>(
  //     `
  //       SELECT wks.id, wks.title, wks.calories, wks.sum AS elapsed_time, wks.date, et.title AS majority_category
  //       FROM (SELECT ws.id, ws.title, ws.calories, SUM(elapsed_time), ws.date,
  //       mode() WITHIN GROUP (ORDER BY exercise_type_id) AS modal_value
  //       FROM workout_session AS ws
  //       LEFT JOIN exercise_session AS es ON ws.id = es.workout_session_id
  //       LEFT JOIN exercise_set_session AS ess ON es.id = ess.exercise_session_id
  //       WHERE ws.app_user_id = 1
  //       GROUP BY ws.id) AS wks
  //       LEFT JOIN exercise_type AS et ON et.id = modal_value;
  //       `
  //   )
  //   .then((result) => {
  //     const queryRows = result.map((row) => {
  //       const { id, title, calories, elapsed_time, date, majority_category } =
  //         row;
  //       const readData: DataBaseQueryTest = {
  //         id: id,
  //         title: title,
  //         calories: calories,
  //         elapsedTime: elapsed_time,
  //         date: new Date(date),
  //         majorityCategory: majority_category,
  //       };
  //       return readData;
  //     });
  //   })
  //   .catch((err) => {
  //     console.log("DB READ ERROR | " + err);
  //   });
  // console.log("Finishing DB Test Query");

  // Button range logic
  let maxGraphValue = getSelectedData(graphDataType)?.reduce((p, c) =>
    p.value! > c.value! ? p : c
  );
  let graphInput = getSelectedData(graphDataType);
  if (graphRange === "1W") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) =>
          new Date(obj.date) >
          new Date(getPriorTime(1, 0, 0).setHours(0, 0, 0, 0) + DAY_MS)
      )
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else if (graphRange === "1M") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) =>
          new Date(obj.date) >
          new Date(getPriorTime(0, 1, 0).setHours(0, 0, 0, 0))
      )
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else if (graphRange === "3M") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) =>
          new Date(obj.date) >
          new Date(getPriorTime(0, 3, 0).setHours(0, 0, 0, 0))
      )
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else if (graphRange === "6M") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) =>
          new Date(obj.date) >
          new Date(getPriorTime(0, 6, 0).setHours(0, 0, 0, 0))
      )
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else if (graphRange === "YTD") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) => new Date(obj.date) > new Date(new Date().getFullYear(), 0, 1)
      )!
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else if (graphRange === "1Y") {
    graphInput = averagePlotData(
      getSelectedData(graphDataType)?.filter(
        (obj) =>
          new Date(obj.date) >
          new Date(
            getLastDayOfMonth(
              new Date(getPriorTime(0, 0, 1).getTime() + 1)
            ).setHours(0, 0, 0, 0)
          )
      )!
    );
    maxGraphValue = graphInput?.reduce((p, c) => (p.value! > c.value! ? p : c));
  } else {
    graphInput = averagePlotData(getSelectedData(graphDataType)!);
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        paddingVertical: 134,
        paddingLeft: 0,
        backgroundColor: "#0D0D0D", //white
      }}
    >
      {/* Chart View */}
      {graphType ?
        <LineChart
          areaChart
          // Chart //
          isAnimated={true}
          //rotateLabel={WEEK_MS < Date.now() - graphInput[0].date.getTime()}
          animationDuration={1000}
          //animateOnDataChange={true}
          adjustToWidth={true}
          disableScroll={true}
          data={graphInput}
          width={347}
          overflowTop={70}
          // Data //
          onlyPositive={true}
          hideDataPoints={true}
          dataPointsColor="#A53535"
          interpolateMissingValues={true}
          leftShiftForTooltip={400}
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
          rulesType="solid"
          rulesColor="#202020"
          pointerConfig={{
            //pointerStripUptoDataPoint: true,
            pointerStripHeight: 235,
            pointerStripColor: "lightgray",
            pointerStripWidth: 2,
            pointerColor: "white",
            //showPointerStrip: false,
            radius: 6,
            pointerLabelWidth: 110,
            pointerLabelHeight: 90,
            //activatePointersOnLongPress: false,
            //autoAdjustPointerLabelPosition: true,
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
                    position: "absolute",
                    width: 110,
                    left: -30,
                    borderRadius: 16,
                    justifyContent: "center",
                    paddingVertical: 5,
                    paddingHorizontal: 5,
                    marginVertical: 20,
                    marginHorizontal: -10,
                    backgroundColor: "#0D0D0D",
                    // borderWidth: 1,
                    // borderColor: "white",
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
                    {graphRange === "ALL" || graphRange === "1Y" ?
                      items[0].date.toDateString().substring(4, 7) +
                      items[0].date.toDateString().substring(10)
                    : items[0].date
                        .toDateString()
                        .substring(4, items[0].date.toDateString().length)
                    }
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
                      {Math.round(items[0].value) +
                        (graphDataType === "calorie" ? " Cal" : " Lbs")}
                    </Text>
                  </View>
                </View>
              );
            },
          }}
        />
      : <BarChart
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
        />
      }

      {/* Chart Range Buttons */}
      <View
        className="flex flex-row"
        style={{
          backgroundColor: "#0D0D0D",
          justifyContent: "space-evenly",
          marginTop: 10,
        }}
      >
        {graphRangeButtons.map((title) => {
          return (
            <Pressable
              style={{
                backgroundColor: graphRange === title ? "#343434" : "#1C1C1C",
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
                setGraphRange(title);
              }}
              key={title}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: graphRange === title ? "bold" : "300",
                }}
              >
                {title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Graph Type + Data Buttons*/}
      <View
        className="flex flex-row"
        style={{
          backgroundColor: "#0D0D0D",
          justifyContent: "space-evenly",
        }}
      >
        {/* Graph Data Buttons */}
        <View
          className="flex flex-row "
          style={{
            backgroundColor: "#0D0D0D",
            justifyContent: "space-evenly",
            marginTop: 20,
          }}
        >
          {graphDataTypeButtons.map((title) => {
            return (
              <Pressable
                style={{
                  backgroundColor:
                    graphDataType === title ? "#343434" : "#1C1C1C",
                  alignItems: "center",
                  justifyContent: "center",
                  paddingVertical: 4,
                  paddingHorizontal: 4,
                  marginLeft: 7,
                  borderRadius: 4,
                  elevation: 3,
                  width: 120,
                  height: 30,
                }}
                onPress={() => {
                  setGraphDataType(title);
                }}
                key={title}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: graphDataType === title ? "bold" : "300",
                  }}
                >
                  {title}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Graph Type Button */}
        <View
          style={{
            paddingVertical: 20,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#0D0D0D",
          }}
        >
          <Pressable
            style={{
              marginHorizontal: 5,
              backgroundColor: "#1C1C1C",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 4,
              paddingHorizontal: 4,
              borderRadius: 4,
              elevation: 3,
              width: 120,
              height: 30,
            }}
            onPress={() => {
              setGraphType(!graphType);
            }}
          >
            <Text
              style={{
                color: "white",
                fontWeight: "300",
              }}
            >
              {graphType ? "BarChart" : "LineChart"}
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Workout Summary View */}
      <View
        style={{
          justifyContent: "center",
          backgroundColor: "#0D0D0D",
          marginLeft: 10,
          marginTop: 0,
        }}
      >
        <Text style={[summaryGrid.mainTitle]}>Workout Summary</Text>
        <View className="flex flex-row" style={[summaryGrid.viewRows]}>
          <Text style={[summaryGrid.text, { color: "grey" }]}></Text>
          <Text style={[summaryGrid.text, { color: "grey" }]}>Total</Text>
          <Text style={[summaryGrid.text, { color: "grey" }]}>Average</Text>
        </View>
        <View className="flex flex-row " style={summaryGrid.viewRows}>
          <Text style={summaryGrid.text}>Workouts</Text>
          <Text style={[summaryGrid.text, { color: "grey" }]}>
            {rawInputLength}
          </Text>
          <Text style={summaryGrid.text}></Text>
        </View>
        <View className="flex flex-row " style={summaryGrid.viewRows}>
          <Text style={summaryGrid.text}>Time</Text>
          <Text style={[summaryGrid.text, { color: "#AD760A" }]}>
            -- : -- : --
          </Text>
          <Text style={[summaryGrid.text, { color: "#AD760A" }]}>
            -- : -- : --
          </Text>
        </View>
        <View className="flex flex-row " style={summaryGrid.viewRows}>
          <Text style={summaryGrid.text}>Calories</Text>
          <Text style={[summaryGrid.text, { color: "#A53535" }]}>
            {rawInputCalories.toLocaleString()} CAL
          </Text>
          <Text style={[summaryGrid.text, { color: "#A53535" }]}>
            {Math.round(rawInputCalories / rawInputLength)} CAL
          </Text>
        </View>
      </View>
    </View>
  );
}

const graphStyle = StyleSheet.create({
  dailyLabel: {
    color: "gray",
    width: 28,
    fontSize: 13,
    marginLeft: 20,
    justifyContent: "center",
  },
  weekLabel: {
    color: "gray",
    fontSize: 13,
    width: 50,
    marginLeft: -14,
  },
  yearLabel: {
    color: "gray",
    fontSize: 13,
    width: 50,
    marginLeft: -5,
  },
  allLabel: {
    color: "gray",
    fontSize: 13,
    width: 50,
    marginLeft: -26,
  },
  toolTip: {},
});

const summaryGrid = StyleSheet.create({
  viewRows: {
    justifyContent: "space-evenly",
    backgroundColor: "#0D0D0D",
    marginTop: 10,
  },
  mainTitle: {
    color: "#BDBDBD",
    fontWeight: "bold",
    fontSize: 22,
  },
  text: {
    fontSize: 16,
    fontWeight: "300",
    color: "#BDBDBD",
    // borderWidth: 1,
    // borderColor: "white",
    width: 360 / 3,
  },
});

/* Summary Page Tasks - Priority is functionality

Other
- create workout summary view; based on range selection
    * # of workouts row (done)
    * time row
    * calories row (done)
- add goals button
- display activity cards
- refactor code to reduce repeated code [averaging function for example]
- pretty up "figmatize" page

Graph Section
- display weight on graph (done)
- add goal line across graph
- fix maxGraphValue to display proper max after filtering
- display personal record lines
- fixed up BarChart to better reflex linechart style
- tooltip modification (not priority)
    * Center tooltip from focused datapoint vertical line 
    * Prevent tooltip from reaching out of bounds
    * Round interpolated values (done)
*/
