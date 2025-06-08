import { ActivityIndicator, Button, SafeAreaView, View } from "react-native";
import {
  CartesianChart,
  ChartBounds,
  getTransformComponents,
  Line,
  Scatter,
  setTranslate,
  useChartPressState,
  useChartTransformState,
} from "victory-native";
import {
  findCutoffIndices,
  timeSpanLabels,
  useOneYearWorkoutSessions,
  WorkoutSessionsTimeSpan,
} from "@/hooks/workout-sessions";
import {
  useFont,
  DashPathEffect,
  Circle,
  Matrix4,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import SegmentedControl from "@react-native-segmented-control/segmented-control";
import Animated, {
  clamp,
  Easing,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { last } from "node_modules/colorjs.io/types/src/util";

const screenX = (scaleX: number, offset: number) => (x: number) =>
  x * scaleX + offset;
const screenY = (scaleY: number, offset: number) => (y: number) =>
  -y * scaleY + offset;

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

const useChartBounds = (initialChartBounds?: ChartBounds) => {
  const bounds = initialChartBounds ?? {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };
  return useState(bounds);
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

  const { state } = useChartTransformState();

  const [timeSpan, setTimeSpan] = useState<WorkoutSessionsTimeSpan>("Y");
  const viewPortRange: [number, number] =
    timeSpan === "Y" ? [0, 30]
    : timeSpan === "6M" ? [0, 15]
    : timeSpan === "M" ? [0, 7]
    : [0, 4];

  const lastPanX = useSharedValue(0);
  const scrollOffX = useSharedValue(0);

  const [chartBounds, setChartBounds] = useChartBounds();
  const scaleX = useMemo(
    () =>
      (chartBounds.right - chartBounds.left) /
      (viewPortRange[1] - viewPortRange[0]),
    [chartBounds, viewPortRange]
  );
  const scaleY = useMemo(
    () =>
      (chartBounds.bottom - chartBounds.top) / (dataStats[1] - dataStats[0]),
    [chartBounds, viewPortRange]
  );
  const getScreenX = useCallback(screenX(scaleX, chartBounds.left), [
    scaleX,
    chartBounds.left,
  ]);
  const getScreenY = useCallback(screenY(scaleY, chartBounds.bottom), [
    scaleY,
    chartBounds.bottom,
  ]);

  useEffect(() => {
    state.matrix.value = setTranslate(state.matrix.value, 0, 0);
    lastPanX.value = 0;
    scrollOffX.value = 0;
  }, [timeSpan]);

  const chartOpacity = useSharedValue(0.0);

  useEffect(() => {
    console.log("transform state changed");
  }, [state]);

  useAnimatedReaction(
    () => scrollOffX.value,
    (prepared, previous) => {
      state.matrix.value = setTranslate(state.matrix.value, prepared, 0);
    }
  );

  useEffect(() => {
    chartOpacity.value = withSequence(
      withTiming(0, { duration: 10, easing: Easing.in(Easing.ease) }),
      withTiming(1, { duration: 350, easing: Easing.out(Easing.ease) })
    );
  }, [timeSpan]);

  const prevBoxPos = useSharedValue(0);
  const boxPos = useSharedValue(0);
  const boxStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: boxPos.value }],
  }));
  const boxGesture = Gesture.Pan()
    .onStart((event) => {
      prevBoxPos.value = boxPos.value;
    })
    .onUpdate((event) => {
      console.log(event.translationX);
      boxPos.value = clamp(prevBoxPos.value + event.translationX, 0, 325);
    })
    .onEnd((event) => {
      boxPos.value = withDecay({
        velocity: event.velocityX,
        deceleration: 0.98,
        clamp: [0, 325],
      });
    });

  const gesture = Gesture.Pan()
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
    });

  return (
    <>
      <View style={{ flex: 1, maxHeight: 512, paddingHorizontal: 16 }}>
        <CartesianChart
          data={DATA}
          xAxis={{
            font,
            lineColor: "grey",
            linePathEffect: <DashPathEffect intervals={[6, 6]} />,
            labelPosition: "outset",
            labelColor: "white",
          }}
          yAxis={[
            {
              font,
              labelColor: "white",
              lineColor: "grey",
              domain: dataStats as [number, number],
            },
          ]}
          xKey={"day"}
          yKeys={["highTmp"]}
          transformState={state}
          transformConfig={{
            pinch: { enabled: false },
            pan: { enabled: false },
          }}
          onChartBoundsChange={(bounds) => {
            setChartBounds(bounds);
          }}
          customGestures={Gesture.Race(gesture)}
          viewport={{
            x: viewPortRange,
            y: dataStats as [number, number],
          }}
        >
          {({ points }) => {
            return (
              <>
                <Line
                  points={points.highTmp}
                  color="red"
                  opacity={chartOpacity}
                  strokeWidth={1}
                />
                <Scatter
                  points={points.highTmp}
                  color="red"
                  opacity={chartOpacity}
                  radius={3}
                />
                <Circle
                  cx={getScreenX(3)}
                  cy={getScreenY(45)}
                  color={"blue"}
                  r={12}
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
          state.matrix.value = [
            ...state.matrix.value.slice(0, 3),
            0,
            ...state.matrix.value.slice(4),
          ] as unknown as Matrix4;
        }}
      />
      <View style={{ flex: 1 }}>
        <GestureDetector gesture={boxGesture}>
          <Animated.View
            style={[
              {
                aspectRatio: 1,
                height: 64,
                backgroundColor: "cyan",
                borderRadius: 16,
              },
              boxStyle,
            ]}
          />
        </GestureDetector>
      </View>
    </>
  );
};

const DATA = [
  { day: 0, highTmp: 59.30624201725173 },
  { day: 1, highTmp: 44.25635578608018 },
  { day: 2, highTmp: 68.19738539273173 },
  { day: 3, highTmp: 47.62255457719107 },
  { day: 4, highTmp: 69.36936311145384 },
  { day: 5, highTmp: 50.341333269749946 },
  { day: 6, highTmp: 54.73478765663331 },
  { day: 7, highTmp: 59.65742044241456 },
  { day: 8, highTmp: 48.221495620289595 },
  { day: 9, highTmp: 58.65209092238778 },
  { day: 10, highTmp: 41.03429979716762 },
  { day: 11, highTmp: 41.10630442396717 },
  { day: 12, highTmp: 45.47205847354351 },
  { day: 13, highTmp: 57.634709409230446 },
  { day: 14, highTmp: 65.87827901279721 },
  { day: 15, highTmp: 47.99811346139486 },
  { day: 16, highTmp: 43.29378262397241 },
  { day: 17, highTmp: 65.0593421561084 },
  { day: 18, highTmp: 56.312569508928775 },
  { day: 19, highTmp: 67.7442403533759 },
  { day: 20, highTmp: 62.84831567105093 },
  { day: 21, highTmp: 53.629213794422405 },
  { day: 22, highTmp: 45.06696838558802 },
  { day: 23, highTmp: 47.95068037187096 },
  { day: 24, highTmp: 45.93743256152696 },
  { day: 25, highTmp: 54.075911101211815 },
  { day: 26, highTmp: 43.777537229307036 },
  { day: 27, highTmp: 49.19553019689158 },
  { day: 28, highTmp: 46.771688955924674 },
  { day: 29, highTmp: 47.74835132388989 },
  { day: 30, highTmp: 40.1617262863485 },
];

const dataStats = [
  DATA.reduce(
    (acc, curr) => Math.min(acc, curr.highTmp),
    Number.MAX_SAFE_INTEGER
  ),
  DATA.reduce(
    (acc, curr) => Math.max(acc, curr.highTmp),
    Number.MIN_SAFE_INTEGER
  ),
];
