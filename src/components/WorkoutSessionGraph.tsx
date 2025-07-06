import {
  ActivityIndicator,
  Button,
  SafeAreaView,
  ScrollView,
  View,
  StyleSheet,
} from "react-native";
import {
  CartesianChart,
  Line,
  Scatter,
  setTranslate,
  useChartTransformState,
} from "victory-native";
import {
  findCutoffIndices,
  timeSpanLabels,
  useOneYearWorkoutSessions,
  useWorkoutSessionsByTimeSpan,
  WorkoutSessionsTimeSpan,
} from "@/hooks/workout-sessions";
import { useFont, DashPathEffect, Circle } from "@shopify/react-native-skia";
import React, { useEffect, useMemo, useState } from "react";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import {
  Easing,
  useAnimatedReaction,
  useSharedValue,
  withDecay,
  withTiming,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { WorkoutSessionDisplayCard } from "./WorkoutSessionCard";
import { readSeedData } from "@/db/drizzle-seed-data";
import { useDrizzle } from "@/db/drizzle-context";
import { ThemedText } from "./Themed";

const MARGIN_HORIZONTAL = 16;

const dayIndexToLabel = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export default function GraphPage() {
  const db = useDrizzle();
  const { data: sessions, isLoading } = useOneYearWorkoutSessions();

  // TODO: handle UI when workoutSessionList is empty
  return (
    <SafeAreaView style={styles.safeAreaView}>
      {sessions ?
        <ScrollView style={{ flex: 1, paddingTop: MARGIN_HORIZONTAL }}>
          <Graph sessions={sessions} isLoading={isLoading} />
          <WorkoutSessionMonthSection />
          <View style={{ marginTop: 32 }}>
            <Button
              title="Read DB"
              onPress={() => {
                readSeedData(db)
                  .then((res) => {
                    res.forEach((row) => {
                      console.log(row);
                    });
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }}
            />
          </View>
        </ScrollView>
      : <ActivityIndicator />}
    </SafeAreaView>
  );
}

const WorkoutSessionMonthSection = () => {
  const now = new Date();
  const oneWeekAgo = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 6, // 7 days back inclusive
    0,
    0,
    0,
    0
  );
  const { data: sessions, isLoading } = useWorkoutSessionsByTimeSpan("M");
  return (
    <View style={styles.sessionsContainer}>
      <ThemedText style={styles.sectionHeaderTitle}>Last 30 Days</ThemedText>
      {isLoading ?
        <ActivityIndicator style={{ alignSelf: "center" }} />
      : <View style={styles.sessionsListContainer}>
          {sessions &&
            sessions.map((session) => {
              return (
                <WorkoutSessionDisplayCard
                  key={session.id}
                  title={session.title}
                  calories={session.calories}
                  dateDisplay={
                    oneWeekAgo.toISOString() <= session.startDate ?
                      dayIndexToLabel[new Date(session.startDate).getDay()]
                    : new Date(session.startDate).toLocaleDateString()
                  }
                />
              );
            })}
        </View>
      }
    </View>
  );
};

const Graph = ({
  sessions,
  isLoading,
}: {
  sessions: Exclude<
    Awaited<ReturnType<typeof useOneYearWorkoutSessions>>["data"],
    undefined
  >;
  isLoading: boolean;
}) => {
  const font = useFont(require("src/assets/fonts/SpaceMono-Regular.ttf"), 12);

  const timeSpanCutoffIndices = useMemo(
    () => findCutoffIndices(sessions ?? []),
    [sessions]
  );
  const [timeSpan, setTimeSpan] = useState<WorkoutSessionsTimeSpan>("Y");
  const viewportDomain: [number, number] = [0, timeSpanCutoffIndices[timeSpan]];

  const { state } = useChartTransformState();

  const lastPanX = useSharedValue(0);
  const scrollOffX = useSharedValue(0);

  const caloriesRange = useMemo(
    () =>
      [
        Math.min(...sessions.map((s) => s.calories)),
        Math.max(...sessions.map((s) => s.calories)),
      ] satisfies [number, number],
    [sessions]
  );

  useEffect(() => {
    chartOpacity.value = 0;
    chartOpacity.value = withTiming(1, {
      duration: 350,
      easing: Easing.out(Easing.ease),
    });
    state.matrix.value = setTranslate(state.matrix.value, 0, 0);
    lastPanX.value = 0;
    scrollOffX.value = 0;
  }, [timeSpan]);

  const chartOpacity = useSharedValue(0.0);

  useAnimatedReaction(
    () => scrollOffX.value,
    (prepared, _previous) => {
      state.matrix.value = setTranslate(state.matrix.value, prepared, 0);
    }
  );

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onStart(() => {
          lastPanX.value = scrollOffX.value;
        })
        .onUpdate((event) => {
          state.matrix.value = setTranslate(
            state.matrix.value,
            event.translationX + lastPanX.value,
            0
          );
        })
        .onEnd((event) => {
          lastPanX.value += event.translationX;
          scrollOffX.value = lastPanX.value;
          scrollOffX.value = withDecay({
            velocity: event.velocityX,
            deceleration: 0.97,
          });
        }),
    [lastPanX, scrollOffX, state]
  );

  return (
    <View style={{ flex: 1, marginHorizontal: MARGIN_HORIZONTAL }}>
      <ThemedText style={styles.graphHeaderTitle}>Calories</ThemedText>
      <View
        style={{
          minHeight: 240,
        }}
      >
        <CartesianChart
          data={sessions}
          domainPadding={{ left: 8, right: 8 }}
          xAxis={{
            font,
            lineColor: "grey",
            linePathEffect: <DashPathEffect intervals={[6, 6]} />,
            labelPosition: "outset",
            labelColor: "white",
            labelRotate: 20,
          }}
          yAxis={[
            {
              font,
              labelColor: "white",
              lineColor: "grey",
              domain: caloriesRange,
            },
          ]}
          xKey={"id"}
          yKeys={["calories"]}
          transformState={state}
          transformConfig={{
            pinch: { enabled: false },
            pan: { enabled: false }, // we handle pan with gesture handler
          }}
          customGestures={Gesture.Race(gesture)}
          viewport={{
            x: viewportDomain[1] > 0 ? viewportDomain : [0, 0.001], // prevents issues with collapsed graph view
            y: caloriesRange,
          }}
        >
          {({ points, xScale, yScale }) => {
            return (
              <>
                <Line
                  points={points.calories}
                  color="red"
                  opacity={chartOpacity}
                  strokeWidth={1}
                />
                <Scatter
                  points={points.calories}
                  color="red"
                  opacity={chartOpacity}
                  radius={3}
                />
                {/** `Circle` is testing if  we can convert (x,y) coordinates to (x,y) pixel positions on canvas */}
                <Circle
                  cx={xScale(100)}
                  cy={yScale(200)}
                  color={"cyan"}
                  r={3}
                />
              </>
            );
          }}
        </CartesianChart>
      </View>
      <SegmentedControl
        enabled={!isLoading}
        style={{
          marginTop: MARGIN_HORIZONTAL,
        }}
        selectedIndex={timeSpanLabels.indexOf(timeSpan)}
        values={timeSpanLabels}
        onChange={(event) => {
          const index = event.nativeEvent.selectedSegmentIndex;
          const valueAtIndex = timeSpanLabels.at(index);
          if (valueAtIndex) {
            setTimeSpan(timeSpanLabels[index]);
          }
        }}
      />
      <Button
        title="Reset"
        onPress={() => {
          state.matrix.value = setTranslate(state.matrix.value, 0, 0);
          lastPanX.value = 0;
          scrollOffX.value = 0;
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    justifyContent: "center",
  },
  sessionsContainer: {
    marginTop: 16,
    flex: 1,
    marginHorizontal: MARGIN_HORIZONTAL,
  },
  sessionsListContainer: {
    rowGap: 8,
    alignItems: "stretch",
  },
  graphHeaderTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: MARGIN_HORIZONTAL * 1.5,
  },
  sectionHeaderTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: MARGIN_HORIZONTAL,
  },
});
