import { ActivityIndicator, Button, SafeAreaView, View } from "react-native";
import {
  CartesianChart,
  ChartBounds,
  Line,
  Scatter,
  setTranslate,
  useChartTransformState,
} from "victory-native";
import {
  findCutoffIndices,
  timeSpanLabels,
  useOneYearWorkoutSessions,
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
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Gesture } from "react-native-gesture-handler";
import { WorkoutSessionDisplayCard } from "./WorkoutSessionCard";
import { useDrizzleTestDb } from "@/db/drizzle-test-db";
import { seedData } from "@/db/drizzle-seed-data";

export default function GraphPage() {
  const { data: sessions, isLoading } = useOneYearWorkoutSessions();

  // TODO: handle UI when workoutSessionList is empty
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      {sessions ?
        <Graph sessions={sessions} isLoading={isLoading} />
      : <ActivityIndicator />}
    </SafeAreaView>
  );
}

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
  const testDb = useDrizzleTestDb();
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
    <>
      <View
        style={{
          flex: 1,
          maxHeight: 300,
          paddingHorizontal: 16,
        }}
      >
        <CartesianChart
          data={sessions}
          domainPadding={{ left: 8, right: 8, top: 32, bottom: 32 }}
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
            pan: { enabled: false },
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
        style={{ width: "100%" }}
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
      <WorkoutSessionDisplayCard
        title={"Leg Day Workout"}
        calories={330}
        dateDisplay={"May 24"}
      />
      <View style={{ marginTop: 32 }}>
        <Button
          title="Read Test DB"
          onPress={() => {
            seedData
              .read(testDb)
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
    </>
  );
};
