import { BarChart, LineChart, yAxisSides } from "react-native-gifted-charts";
import { ThemedText, ThemedView } from "@/components/Themed";
import {
  Text,
  Pressable,
  StyleSheet,
  TextStyle,
  TextInput,
  View,
  SectionList,
} from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { useState } from "react";
import { ActivityCard } from "@/components/ActivityCard";
import { figmaColors } from "@/constants/Colors";
import { drizzle } from "drizzle-orm/expo-sqlite";
import GraphPage from "@/components/WorkoutSessionGraph";

type WorkoutSession = {
  id: number;
  title: string;
  calories: number;
  elapsedTime: number;
  date: Date;
};

type UserBodyWeight = {
  appUserId: bigint;
  weight: number;
  date: Date;
};

type SessionData = {
  value: number | null;
  timeEstimate?: number;
  date: Date;
  label?: string;
  labelTextStyle?: TextStyle;
};

type UserBodyWeightData = {
  value: number | null;
  date: Date;
  label?: string | null;
  labelTextStyle?: TextStyle;
};

type UserData = {
  calorieGoal: number | null;
  bodyWeightGoal: number | null;
  userHeight: number | null;
};

type PersonalRecord = {
  weight?: number; // { value: 400, reps: }
  reps?: number;
  distance?: number;
  time?: number;
  date: Date;
};

type PersonalRecordHistory = {
  exerciseClassName: string;
  exerciseType: 1 | 2;
  personalRecordList: PersonalRecord[];
};

type GraphData = {
  workoutSessionData: WorkoutSession[];
  bodyWeightData: UserBodyWeight[];
  userProfileData: UserData;
  personalRecordData: PersonalRecordHistory[];
};
/* 
Extracts out all sql data queries for the graph page into a single hook.
Basically, we can now guarantee that all data necessary for the graph page
will be NON-NULL - this means no more defensive 'data?.property' accesses from now on! 
*/
function useGraphData() {
  const myDB = useSQLiteContext();
  const drizzleDb = drizzle(myDB);
  const [graphData, setGraphData] = useState<GraphData | null>(null);

  // If our graph data is already loaded, let 'em have it.
  if (graphData) {
    return graphData;
  }

  // Otherwise, asynchronously load it all up
  Promise.all([
    getWorkoutSessions(drizzleDb),
    myDB.getAllAsync<any>(
      "SELECT * FROM user_bodyweight AS ubw ORDER BY ubw.date"
    ),
    myDB.getFirstAsync<any>(
      `
        SELECT au.avg_daily_calorie_goal as calorie_goal, au.bodyweight_goal, au.user_height
          FROM app_user AS au
          WHERE au.id = 1
      `
    ),
    myDB.getAllAsync<any>(
      `
      SELECT ec.exercise_type_id, ec.title, ph.exercise_class_id, ph.weight, ph.reps, ph.distance, ph.time, ph.date FROM exercise_class as ec
        INNER JOIN pr_history as ph ON ec.id = ph.exercise_class_id
      WHERE ec.app_user_id = 1 AND is_archived = 0
      ORDER BY ph.exercise_class_id ASC, ph.date ASC;
      `
    ),
  ])
    .then(([workoutSessionRows, bodyWeightRows, userProfile, prRows]) => {
      // Grab workout session calorie data
      const workoutSessions = workoutSessionRows.map((row) => {
        const { calories, startDate } = row;
        const readData: WorkoutSession = {
          ...row,
          calories: calories ?? 0,
          date: startDate,
        };
        return readData;
      });

      // Grab body weight results
      const bodyWeightResults = bodyWeightRows.map((row) => {
        const { app_user_id, weight, date } = row;
        const readData: UserBodyWeight = {
          appUserId: app_user_id,
          weight: weight,
          date: new Date(date),
        };
        return readData;
      });

      // Grab user profile results
      const { calorie_goal, bodyweight_goal, user_height } = userProfile;
      const userProfileResult: UserData = {
        calorieGoal: calorie_goal,
        bodyWeightGoal: bodyweight_goal,
        userHeight: user_height,
      };

      // grab pr history reults
      const prHistoryResults: PersonalRecordHistory[] = prRows
        .reduce((prev: any[], curr: any) => {
          const p = prev;
          if (
            p.length < 1 ||
            p.at(-1)!.at(-1).exercise_class_id !== curr.exercise_class_id
          ) {
            p.push([curr]);
          } else {
            p.at(-1)!.push(curr);
          }
          return p;
        }, [])
        .map((group: any[]) => ({
          exerciseClassName: group[0].title,
          exerciseType: group[0].exercise_type_id,
          personalRecordList: group.map((pr) => ({
            weight: pr.weight,
            reps: pr.reps,
            time: pr.time,
            distance: pr.distance,
            date: new Date(pr.date),
          })),
        }));

      // Set all state in one go
      setGraphData({
        workoutSessionData: workoutSessions,
        bodyWeightData: bodyWeightResults,
        userProfileData: userProfileResult,
        personalRecordData: prHistoryResults,
      });
    })
    .catch((err) => {
      console.log(err);
      console.log(
        "Couldn't properly load in graph related data from sqlite db"
      );
    });

  return graphData;
}

function groupActivityCards(list: WorkoutSession[]) {
  let res: { title: string; data: WorkoutSession[] }[] = [];
  let ind = 0;

  list.forEach((card) => {
    if (res.length === 0) {
      res.push({
        title:
          card.date.toLocaleString("default", { month: "long" }) +
          ", " +
          card.date.getFullYear(),
        data: [card],
      });
    } else if (
      res[ind].title !==
      card.date.toLocaleString("default", { month: "long" }) +
        ", " +
        card.date.getFullYear()
    ) {
      ind += 1;
      res.push({
        title:
          card.date.toLocaleString("default", { month: "long" }) +
          ", " +
          card.date.getFullYear(),
        data: [card],
      });
    } else {
      res[ind].data.push(card);
    }
  });

  return res;
}

export default function SummaryPage() {
  return <GraphPage />;
  const graphData = useGraphData();

  const personalRecordOptions = ["Bench Press", "Squat", "Deadlift"]; // replace with dynamic type after querying (bench, squat, etc)
  const [personalRecordExercise, setPersonalRecordExercise] = useState(
    personalRecordOptions[0]
  );

  const [graphRange, setGraphRange] = useState("ALL");

  const [graphDataType, setGraphDataType] = useState("calorie");
  const graphDataTypeButtons = ["calorie", "body weight", "personal record"];

  const [graphType, setGraphType] = useState(true); // true -> LineChart; false -> BarChart

  // If all the graph data isn't fully loaded, display a loading screen
  if (!graphData) {
    return (
      <ThemedView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={stats.viewTitle}>Loading...</Text>
      </ThemedView>
    );
  }

  // Beyond this point, we have a guarantee that all graph related data is NON-NULL
  const {
    workoutSessionData,
    bodyWeightData,
    userProfileData,
    personalRecordData,
  } = graphData;

  const DAY_MS = 93921426;
  const WEEK_MS = 657449982;
  const MONTH_MS = 2629799928;
  const YEAR_MS = 31557599136;

  let rawInputLength = 0;
  let rawInputValue = 0;
  let rawInputTime = 0;
  let rawInputTimeNum = 0;
  let rawInputFirstIdx = 0;
  let rawInputLastIdx = 0;
  let PrFirstVal = 0;
  let PrLastVal = 0;
  let selectedTimeRange = workoutSessionData[0].date;

  // returns a previous date (time) given # of weeks, months, years based on current time
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
  // averages data bases on the length of time given
  function averagePlotData(
    data: SessionData[] | UserBodyWeightData[]
  ): SessionData[] {
    // Looks messy, code clean up if possible
    // going to change logic to be more "functional" in the future...

    let transformData = data as SessionData[] | UserBodyWeightData[];

    // used to calculate values for summary
    rawInputLength = transformData.length;
    rawInputValue = 0;
    rawInputFirstIdx = transformData.length > 0 ? transformData[0].value! : 0;
    rawInputLastIdx =
      transformData.length > 0 ?
        transformData[transformData.length - 1].value!
      : 0;

    transformData.forEach((obj) => {
      rawInputValue += obj.value ? obj.value : 0;
      if ("timeEstimate" in obj && typeof obj.timeEstimate === "number") {
        rawInputTime += obj.timeEstimate;
        rawInputTimeNum += 1;
      }
    });

    let res: SessionData[] = [];
    if (
      !transformData ||
      transformData.length < 1 ||
      graphDataType === "personal record"
    ) {
      console.log("Not enough data or data does not exist.");
      res = [
        {
          value: 1,
          date: new Date(new Date().getTime() - DAY_MS * 2),
        },
        { value: 1, date: new Date(new Date().getTime() - DAY_MS) },
        { value: 1, date: new Date(new Date().getTime()) },
      ];
    } else if (
      transformData.length > 0 &&
      MONTH_MS * 6 < Date.now() - transformData[0].date.getTime()
    ) {
      // Greater than 1 year -> average months
      let idx = 0;
      let first = getFirstDayOfMonth(transformData[0].date);
      let last = getLastDayOfMonth(transformData[0].date);
      while (first < transformData[transformData.length - 1].date) {
        let amt = 0;
        let avg = 0;
        while (idx < transformData.length && transformData[idx].date < last) {
          avg += transformData[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            amt === 0 ?
              idx === transformData.length ?
                0
              : null
            : avg / amt,
          date: first,
          label:
            graphRange === "ALL" ?
              first.getMonth() === 1 ?
                first.toDateString().substring(11)
              : undefined
            : first.toDateString().substring(4, 7),
          labelTextStyle:
            graphRange === "ALL" ? graphStyle.allLabel : graphStyle.yearLabel,
        });

        first = getFirstDayOfMonth(new Date(last.getTime() + 1));
        last = getLastDayOfMonth(new Date(first));
      }
    } else if (
      transformData.length > 0 &&
      MONTH_MS < Date.now() - transformData[0].date.getTime()
    ) {
      let idx = 0;
      let first = getFirstDayOfWeek(transformData[0].date);
      let last = getLastDayOfWeek(transformData[0].date);
      let currMonth = getFirstDayOfMonth(
        new Date(
          transformData[0].date.getTime() +
            (graphRange === "YTD" ? 0 : MONTH_MS)
        )
      );
      while (
        idx < transformData.length &&
        first < transformData[transformData.length - 1].date
      ) {
        let amt = 0;
        let avg = 0;
        while (
          idx < transformData.length &&
          getFirstDayOfWeek(transformData[idx].date).toDateString() ===
            getFirstDayOfWeek(first).toDateString()
        ) {
          avg += transformData[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            amt === 0 ?
              idx === transformData.length ?
                0
              : null
            : avg / amt,
          date: first,
          label:
            first > currMonth ?
              currMonth.toDateString().substring(4, 8)
            : undefined,
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
    } else if (
      transformData.length > 0 &&
      WEEK_MS < Date.now() - transformData[0].date.getTime()
    ) {
      // Greater than 1 month -> keep data as is (just calculate totals)
      let idx = 0;
      let first = new Date(transformData[0].date);
      let last = new Date();
      while (first < last) {
        let total = 0;
        let amt = 0;
        while (
          idx < transformData.length &&
          first.toDateString() === transformData[idx].date.toDateString()
        ) {
          total += transformData[idx].value!;
          amt += 1;
          idx += 1;
        }

        res.push({
          value:
            total === 0 ?
              idx === transformData.length ?
                0
              : null
            : graphDataType === "calorie" ? total
            : total / amt,
          date: first,
          label:
            first.toDateString() === getFirstDayOfWeek(first).toDateString() ?
              first.toDateString().substring(4, 10)
            : undefined,
          labelTextStyle: graphStyle.weekLabel,
        });

        first.setHours(0, 0, 0, 0);
        first = new Date(first.getTime() + DAY_MS);
      }
    } else {
      // Data is equal (=) or less than (<) week -> Interpolate to correctly show day to day spacing for a week
      let idx = 0;
      let first = new Date(getPriorTime(1, 0, 0).setHours(0, 0, 0, 0) + DAY_MS);
      const last = new Date();
      while (first <= last) {
        let total = 0;
        while (
          idx < transformData.length &&
          first.toDateString() === transformData[idx].date.toDateString()
        ) {
          total += transformData[idx].value!;
          idx += 1;
        }
        res.push({
          value: total,
          date: first,
          label: getDayOfWeekString(first.getDay()).substring(0, 3),
          labelTextStyle: graphStyle.dailyLabel,
        });

        first.setHours(0, 0, 0, 0);
        first = new Date(first.getTime() + DAY_MS);
      }
    }

    return res as SessionData[];
  }

  // Extract body-weight data
  const graphBodyWeightData: UserBodyWeightData[] = bodyWeightData.map(
    (ubw) => {
      return {
        value: ubw.weight,
        date: ubw.date,
      };
    }
  );

  // returns data based selected data type from buttons selection
  function getSelectedData(
    selectedData: string
  ): SessionData[] | UserBodyWeightData[] | PersonalRecordHistory[] {
    switch (selectedData) {
      case "calorie":
        return graphCalorieData;
      case "body weight":
        return graphBodyWeightData;
      case "personal record":
        return personalRecordData;
      default:
        return graphCalorieData;
    }
  }

  function normalizePrData(data: PersonalRecordHistory[]): SessionData[] {
    let filterRes = (data as PersonalRecordHistory[]).find(
      (obj) => obj.exerciseClassName === personalRecordExercise
    )!;

    // When filterRes finds no matches relating to the exercise for pr's, we return []
    if (!filterRes) {
      return [];
    }

    let mappedRes = filterRes.personalRecordList.map((record) => ({
      value: record.weight,
      date: record.date,
    })) as SessionData[];

    if (mappedRes && mappedRes?.length > 1) {
      rawInputLength = mappedRes?.length;
      PrFirstVal = mappedRes[0].value!;
      PrLastVal = mappedRes[mappedRes.length - 1].value!;
    }

    return mappedRes;
  }

  // extract calorie data
  const graphCalorieData: SessionData[] = workoutSessionData.map((ws) => {
    return {
      value: ws.calories,
      timeEstimate: ws.elapsedTime,
      date: ws.date,
    };
  });

  // grabs correct array
  let graphInput = getSelectedData(graphDataType) as any;

  // button range logic
  if (graphRange === "1W") {
    selectedTimeRange = new Date(
      getPriorTime(1, 0, 0).setHours(0, 0, 0, 0) + DAY_MS
    );
  } else if (graphRange === "1M") {
    selectedTimeRange = new Date(getPriorTime(0, 1, 0).setHours(0, 0, 0, 0));
  } else if (graphRange === "3M") {
    selectedTimeRange = new Date(getPriorTime(0, 3, 0).setHours(0, 0, 0, 0));
  } else if (graphRange === "6M") {
    selectedTimeRange = new Date(getPriorTime(0, 6, 0).setHours(0, 0, 0, 0));
  } else if (graphRange === "YTD") {
    selectedTimeRange = new Date(new Date().getFullYear(), 0, 1);
  } else if (graphRange === "1Y") {
    selectedTimeRange = new Date(
      getLastDayOfMonth(new Date(getPriorTime(0, 0, 1).getTime() + 1)).setHours(
        0,
        0,
        0,
        0
      )
    );
  } else {
    selectedTimeRange = workoutSessionData[0].date;
  }

  if (graphDataType !== "personal record") {
    graphInput = averagePlotData(
      graphInput.filter((obj: any) => new Date(obj.date) > selectedTimeRange)
    ) as SessionData[] | null;
  } else {
    graphInput = normalizePrData(graphInput);
  }

  let maxGraphValue = graphInput.reduce((p: any, c: any) =>
    p.value > c.value ? p : c
  );
  // Rounds maxGraphValue up to the nearest 100s place
  maxGraphValue =
    Math.ceil((maxGraphValue ? maxGraphValue?.value! : 400) / 100) * 100;

  // creating goal line
  let goalLine: { value: number | null }[] = [];
  if (graphDataType === "calorie") {
    for (let i = 0; i < graphInput.length; i++) {
      goalLine.push({ value: userProfileData.calorieGoal });
    }
  } else if (graphDataType === "body weight") {
    for (let i = 0; i < graphInput.length; i++) {
      goalLine.push({ value: userProfileData.bodyWeightGoal });
    }
  } else {
    goalLine = [];
  }

  let previousCard: WorkoutSession | null = null;

  return (
    <SectionList
      initialNumToRender={4}
      /* TODO
      sections at the moment display ALL workout sessions,
      but we'll ultimately want to modify this to show workouts
      from JUST the last month, the last week, and so on. We want to
      select a specific time range behind the present.
      */
      sections={groupActivityCards(workoutSessionData)}
      renderItem={({ item }) => (
        <ActivityCard
          title={item.title}
          calories={item.calories}
          date={item.date}
        />
      )}
      renderSectionHeader={({ section: { title } }) => (
        <ThemedView style={stats.viewStyle}>
          <Text style={stats.viewTitle}>{title}</Text>
        </ThemedView>
      )}
      keyExtractor={(item) => item.id.toString()}
      // ListHeaderComponent={
      //   <Graph
      //     graphType
      //     graphInput={graphInput}
      //     graphDataType={graphDataType}
      //     setGraphType={setGraphType}
      //     goalLine={goalLine}
      //     maxGraphValue={maxGraphValue}
      //     personalRecordOptions={personalRecordOptions}
      //     personalRecordExercise={personalRecordExercise}
      //     setPersonalRecordExercise={setPersonalRecordExercise}
      //     graphDataTypeButtons={graphDataTypeButtons}
      //     setGraphDataType={setGraphDataType}
      //     rawInputLength={rawInputLength}
      //     rawInputTime={rawInputTime}
      //     rawInputTimeNum={rawInputTimeNum}
      //     rawInputValue={rawInputValue}
      //     rawInputLastIdx={rawInputLastIdx}
      //     userProfileData={userProfileData}
      //     rawInputFirstIdx={rawInputFirstIdx}
      //     PrLastVal={PrLastVal}
      //     PrFirstVal={PrFirstVal}
      //     bodyWeightData={bodyWeightData}
      //     graphRange={graphRange}
      //     setGraphRange={setGraphRange}
      //   />
      // }
      ListHeaderComponent={() => (
        <View
          style={{
            marginHorizontal: 8,
            marginVertical: 44,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ThemedText style={{ color: figmaColors.primaryWhite, fontSize: 24 }}>
            🚧{" "}
          </ThemedText>
          <ThemedText style={{ color: figmaColors.primaryWhite, fontSize: 24 }}>
            Graph is under construction...
          </ThemedText>
        </View>
      )}
    />
  );
}

function Goals({
  calorieGoal,
  weightGoal,
}: {
  calorieGoal: number;
  weightGoal: number;
}) {
  const [calorie, setCalorie] = useState(calorieGoal);
  const [weight, setWeight] = useState(weightGoal);

  return (
    <ThemedView style={[stats.viewStyle]}>
      <Text style={[stats.viewTitle]}>Goals</Text>

      {/* Calorie Goal */}
      <ThemedView style={stats.viewRows}>
        <Text style={stats.rowText}>Calories</Text>
        <ThemedView
          style={{
            flex: 1,
            flexDirection: "row",
            width: 120,
            backgroundColor: "#0D0D0D",
          }}
        >
          <TextInput
            keyboardType="number-pad"
            style={[
              stats.rowText,
              {
                backgroundColor: "#1C1C1C",
                width: 50,
                borderRadius: 5,
                fontWeight: "400",
                textAlign: "center",
              },
            ]}
            placeholder="0"
            onBlur={(e) => {
              if (calorie === Number(e.nativeEvent.text)) {
                console.log("Calorie Goal Change");
              }
            }}
            maxLength={3}
            onChangeText={(text) => setCalorie(parseInt(text))}
            value={calorie ? calorie.toString() : ""}
          />
          <Text
            style={{
              color: "grey",
              top: 2,
              left: 2,
            }}
          >
            {/* Placeholder in case we place label here */}
          </Text>
        </ThemedView>

        <Text style={stats.rowText}></Text>
      </ThemedView>

      {/* Body Weight Goal */}
      <ThemedView style={stats.viewRows}>
        <Text style={stats.rowText}>Body Weight</Text>
        <ThemedView
          style={{
            flex: 1,
            flexDirection: "row",
            width: 120,
            backgroundColor: "#0D0D0D",
          }}
        >
          <TextInput
            keyboardType="number-pad"
            style={[
              stats.rowText,
              {
                backgroundColor: "#1C1C1C",
                width: 50,
                borderRadius: 5,
                fontWeight: "400",
                textAlign: "center",
              },
            ]}
            placeholder="0"
            onBlur={(e) => {
              if (weight === Number(e.nativeEvent.text)) {
                console.log("Weight Goal Change");
              }
            }}
            maxLength={3}
            onChangeText={(text) => setWeight(parseInt(text.toString()))}
            value={weight ? Math.round(weight).toString() : ""}
          />
          <Text
            style={{
              color: "grey",
              top: 2,
              left: 2,
            }}
          >
            kg
          </Text>
        </ThemedView>
        <Text style={stats.rowText}></Text>
      </ThemedView>
    </ThemedView>
  );
}

function Summary({
  graphDataType,
  rawInputLength,
  rawInputTime,
  rawInputTimeNum,
  rawInputValue,
  rawInputLastIdx,
  userProfileData,
  rawInputFirstIdx,
  PrLastVal,
  PrFirstVal,
  bodyWeightData,
}: {
  graphDataType: string;
  rawInputLength: number;
  rawInputTime: number;
  rawInputTimeNum: number;
  rawInputValue: number;
  rawInputLastIdx: number;
  userProfileData: UserData;
  rawInputFirstIdx: number;
  PrLastVal: number;
  PrFirstVal: number;
  bodyWeightData: UserBodyWeight[];
}) {
  return (
    <ThemedView style={[stats.viewStyle]}>
      <Text style={[stats.viewTitle]}>Summary</Text>

      {
        // please refactor me (uses anonymous function)
        (() => {
          switch (graphDataType) {
            case "calorie":
              return (
                <>
                  <ThemedView style={[stats.viewRows, { marginTop: 0 }]}>
                    <Text style={[stats.rowText, { color: "grey" }]}></Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Total
                    </Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Average
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Workouts</Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      {rawInputLength}
                    </Text>
                    <Text style={stats.rowText}></Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Time</Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {("00" + Math.floor(rawInputTime / 3600)).slice(-2)}:
                      {("00" + Math.floor((rawInputTime % 3600) / 60)).slice(
                        -2
                      )}
                      :{("00" + ((rawInputTime % 3600) % 60)).slice(-2)}
                    </Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {rawInputTime === 0 ?
                        "00:00:00"
                      : (
                          "00" +
                          Math.floor(
                            rawInputLength ?
                              rawInputTime / rawInputTimeNum / 3600
                            : 0
                          )
                        ).slice(-2) +
                        ":" +
                        (
                          "00" +
                          Math.floor(
                            rawInputLength ?
                              ((rawInputTime / rawInputTimeNum) % 3600) / 60
                            : 0
                          )
                        ).slice(-2) +
                        ":" +
                        (
                          "00" +
                          Math.floor(
                            rawInputLength ?
                              ((rawInputTime / rawInputTimeNum) % 3600) % 60
                            : 0
                          )
                        ).slice(-2)
                      }
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Calories</Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}>
                      {rawInputValue.toLocaleString()} cal
                    </Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}>
                      {Math.round(rawInputValue / rawInputLength)} cal
                    </Text>
                  </ThemedView>
                </>
              );
              break;
            case "body weight":
              return (
                <>
                  <ThemedView style={[stats.viewRows, { marginTop: 0 }]}>
                    <Text style={[stats.rowText, { color: "grey" }]}></Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Trend
                    </Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Current
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>B.M.I</Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      {(
                        rawInputLastIdx /
                          Math.pow(userProfileData.userHeight ?? 0, 2) -
                          rawInputFirstIdx /
                            Math.pow(userProfileData.userHeight ?? 0, 2) >
                        0
                      ) ?
                        "+" +
                        (
                          rawInputLastIdx /
                            Math.pow(userProfileData.userHeight ?? 0, 2) -
                          rawInputFirstIdx /
                            Math.pow(userProfileData.userHeight ?? 0, 2)
                        ).toFixed(2)
                      : (
                          rawInputLastIdx /
                            Math.pow(userProfileData.userHeight ?? 0, 2) -
                          rawInputFirstIdx /
                            Math.pow(userProfileData.userHeight ?? 0, 2)
                        ).toFixed(2)
                      }{" "}
                    </Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      {(
                        rawInputLastIdx /
                        Math.pow(userProfileData.userHeight ?? 0, 2)
                      ).toFixed(2)}
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Goal</Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {userProfileData.bodyWeightGoal ?
                        (
                          (rawInputLastIdx + rawInputFirstIdx) / 2 -
                          userProfileData.bodyWeightGoal
                        ).toFixed(2) + " kg"
                      : "-"}
                    </Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {userProfileData.bodyWeightGoal ?
                        userProfileData.bodyWeightGoal.toFixed(2)
                      : 0}{" "}
                      {" kg"}
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Weight</Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}>
                      {(rawInputLastIdx - rawInputFirstIdx > 0 ? "+" : "") +
                        (rawInputLastIdx - rawInputFirstIdx).toFixed(2) +
                        " kg"}
                    </Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}>
                      {rawInputLastIdx.toFixed(2) + " kg"}
                    </Text>
                  </ThemedView>
                </>
              );
              break;
            case "personal record":
              return (
                <>
                  <ThemedView style={[stats.viewRows, { marginTop: 0 }]}>
                    <Text style={[stats.rowText, { color: "grey" }]}></Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Trend
                    </Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      Current
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Resistance</Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      {
                        // Ugly but this determines the sign
                        Math.round(PrLastVal - PrFirstVal) > 0 ?
                          "+"
                        : Math.round(PrLastVal - PrFirstVal) < 0 ?
                          "-"
                        : ""
                      }
                      {Math.round(PrLastVal - PrFirstVal)}
                      {" kg"}
                    </Text>
                    <Text style={[stats.rowText, { color: "grey" }]}>
                      {PrLastVal.toFixed(2)}
                      {" kg"}
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>Body %</Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {(
                        PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight -
                          PrFirstVal /
                            bodyWeightData[bodyWeightData.length - 1].weight >
                        0
                      ) ?
                        "+"
                      : (
                        PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight -
                          PrFirstVal /
                            bodyWeightData[bodyWeightData.length - 1].weight <
                        0
                      ) ?
                        "-"
                      : ""}
                      {(
                        PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight -
                        PrFirstVal /
                          bodyWeightData[bodyWeightData.length - 1].weight
                      ).toFixed(2)}
                      {"%"}
                    </Text>
                    <Text style={[stats.rowText, { color: "#AD760A" }]}>
                      {(
                        ((PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight) *
                          100) %
                          100 >
                        0
                      ) ?
                        "+"
                      : (
                        ((PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight) *
                          100) %
                          100 <
                        0
                      ) ?
                        "-"
                      : ""}
                      {(
                        ((PrLastVal /
                          bodyWeightData[bodyWeightData.length - 1].weight) *
                          100) %
                        100
                      ).toFixed(1)}
                      {"%"}
                    </Text>
                  </ThemedView>
                  <ThemedView style={stats.viewRows}>
                    <Text style={stats.rowText}>
                      {
                        "" /* vs Average [hidden until futher implementation and discussion]*/
                      }
                    </Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}></Text>
                    <Text style={[stats.rowText, { color: "#A53535" }]}></Text>
                  </ThemedView>
                </>
              );
          }
        })()
      }
    </ThemedView>
  );
}

function Graph({
  graphType,
  graphInput,
  graphDataType,
  setGraphType,
  goalLine,
  maxGraphValue,
  personalRecordOptions,
  personalRecordExercise,
  setPersonalRecordExercise,
  graphDataTypeButtons,
  setGraphDataType,
  rawInputLength,
  rawInputTime,
  rawInputTimeNum,
  rawInputValue,
  rawInputLastIdx,
  userProfileData,
  rawInputFirstIdx,
  PrLastVal,
  PrFirstVal,
  bodyWeightData,
  graphRange,
  setGraphRange,
}: {
  graphType: boolean;
  graphInput: any;
  graphDataType: string;
  setGraphType: React.Dispatch<boolean>;
  goalLine: { value: number | null }[];
  maxGraphValue: number;
  personalRecordOptions: string[];
  personalRecordExercise: string;
  setPersonalRecordExercise: React.Dispatch<string>;
  graphDataTypeButtons: string[];
  setGraphDataType: React.Dispatch<string>;
  rawInputLength: number;
  rawInputTime: number;
  rawInputTimeNum: number;
  rawInputValue: number;
  rawInputLastIdx: number;
  userProfileData: UserData;
  rawInputFirstIdx: number;
  PrLastVal: number;
  PrFirstVal: number;
  bodyWeightData: UserBodyWeight[];
  graphRange: string;
  setGraphRange: React.Dispatch<string>;
}) {
  const graphRangeButtons = ["1W", "1M", "3M", "6M", "YTD", "1Y", "ALL"];

  return (
    <ThemedView>
      {/* graph type button */}
      <ThemedView
        style={{
          paddingVertical: 10,
          paddingEnd: 10,
          flexDirection: "row",
          justifyContent: "flex-end",
          alignItems: "center",
          backgroundColor: "#0D0D0D", // #0D0D0D
        }}
      >
        <Pressable
          style={{
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
      </ThemedView>
      <ThemedView
        style={{
          flex: 1,
          justifyContent: "center",
          paddingTop: 60,
          paddingLeft: 0,
          backgroundColor: "#0D0D0D", //#0D0D0D
        }}
      >
        {/* chart view */}
        {graphType ?
          <LineChart
            areaChart
            // Chart //
            isAnimated={true}
            // curved={true} // Interesting style
            animationDuration={1000}
            //animateOnDataChange={true}
            adjustToWidth={true}
            disableScroll={true}
            data={graphInput}
            data2={goalLine as { value: number }[]}
            showDataPointOnFocus={false}
            showDataPointOnFocus2={false}
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
            color2="#AD760A" //#AD760A
            thickness={2}
            startFillColor="rgba(165,53,53,1)"
            endFillColor="rgba(165,53,53,1)"
            startFillColor2="rgba(173, 118, 10, 0)"
            endFillColor2="rgba(173, 118, 10, 0)"
            startOpacity={0.6}
            endOpacity={0.1}
            startOpacity2={0.15}
            endOpacity2={0}
            initialSpacing={7.5}
            noOfSections={4}
            maxValue={maxGraphValue}
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
              hidePointer2: true,
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
                  <ThemedView
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
                    <ThemedView
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
                          (graphDataType === "calorie" ? " cal" : " kg")}
                      </Text>
                    </ThemedView>
                  </ThemedView>
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
            maxValue={maxGraphValue}
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

        {/* chart range buttons */}
        {graphDataType === "personal record" ?
          <ThemedView
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: "#0D0D0D",
              justifyContent: "space-evenly",
              marginTop: 10,
            }}
          >
            {personalRecordOptions.map((title) => {
              return (
                <Pressable
                  style={{
                    backgroundColor:
                      personalRecordExercise === title ? "#343434" : "#1C1C1C",
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
                    setPersonalRecordExercise(title);
                  }}
                  key={title}
                >
                  <Text
                    style={{
                      color: "white",
                      fontWeight:
                        personalRecordExercise === title ? "bold" : "300",
                    }}
                  >
                    {title}
                  </Text>
                </Pressable>
              );
            })}
          </ThemedView>
        : <ThemedView
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: "#0D0D0D",
              justifyContent: "space-evenly",
              marginTop: 10,
            }}
          >
            {graphRangeButtons.map((title) => {
              return (
                <Pressable
                  style={{
                    backgroundColor:
                      graphRange === title ? "#343434" : "#1C1C1C",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 4,
                    paddingHorizontal: 4,
                    borderRadius: 4,
                    elevation: 3,
                    width: 36,
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
          </ThemedView>
        }

        {/* data type buttons*/}
        <ThemedView
          style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: "#0D0D0D",
            justifyContent: "space-evenly",
            marginTop: 10,
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
        </ThemedView>

        <Summary
          graphDataType={graphDataType}
          rawInputLength={rawInputLength}
          rawInputTime={rawInputTime}
          rawInputTimeNum={rawInputTimeNum}
          rawInputValue={rawInputValue}
          rawInputLastIdx={rawInputLastIdx}
          userProfileData={userProfileData}
          rawInputFirstIdx={rawInputFirstIdx}
          PrLastVal={PrLastVal}
          PrFirstVal={PrFirstVal}
          bodyWeightData={bodyWeightData}
        />

        <Goals
          calorieGoal={userProfileData.calorieGoal}
          weightGoal={userProfileData.bodyWeightGoal}
        />

        {/* activity view */}
        <ThemedView style={[stats.viewStyle]}>
          <Text style={[stats.viewTitle]}>Activity</Text>
        </ThemedView>
      </ThemedView>
    </ThemedView>
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

const stats = StyleSheet.create({
  viewRows: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "#0D0D0D",
    marginTop: 10,
  },
  viewTitle: {
    color: "#BDBDBD",
    fontWeight: "bold",
    fontSize: 22,
  },
  rowText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#BDBDBD",
    // borderWidth: 1,
    // borderColor: "white",
    width: 360 / 3,
  },
  viewStyle: {
    justifyContent: "center",
    backgroundColor: "#0D0D0D",
    marginLeft: 10,
    marginTop: 25,
  },
});

/* Summary Page Tasks - Priority is functionality

DB consideration - * user wants to record time taken without using app to workout with
                 - * user wants to have goals for running (runs per week/ distance+pace+time per run, etc.)

Completed = ✔️
Current Task = 🔨
Next Tasks = ⚠️
Needs Consideration = ❗

Priority:
1) Goal line reflects goal hook
2) Add Month and year to seperate cards
3) Modify Activity Card to display only a certain amount of cards ❗

Other
- consider using memorization for queried lists and data
- refactor code to reduce repeated code [averaging function for example]
- pretty up "figmatize" page
- GitHub project board
- Readme update
- fix BarChart button


Graph Section
- create personal record summary view [vs Average row] ❗ (many different exercises have different standards, only support the popular exercise?https://strengthlevel.com/strength-standards/bench-press/lb)
- discuss whether to keep tooltip or replace in favor of static info bubble area
    * consider wasted space with tooltip and ui element placement (refer to figma)
    * consider user experience and expectation (look into the goods as reference) 
- revisit weight summary metrics to confirm stats
- change trend formula to indicate a linear regression
- fixed up BarChart to better reflex linechart style 
- allow graph x-axis start to be more dynamic (not always 0)

- tooltip modification (not priority)
    * center tooltip from focused datapoint vertical line 
    * prevent tooltip from reaching out of bounds
    * prevent data bubble to appear when hovering over goal line
*/
