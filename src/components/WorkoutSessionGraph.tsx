import { ActivityIndicator, SafeAreaView, View } from "react-native";
import {
  CartesianChart,
  Line,
  Scatter,
  useChartTransformState,
} from "victory-native";
import {
  timeSpanLabels,
  useWorkoutSessionsByTimeSpan,
  WorkoutSessionsTimeSpan,
} from "@/hooks/workout-sessions";
import { useFont, DashPathEffect } from "@shopify/react-native-skia";
import React, { useState } from "react";
import SegmentedControl from "@react-native-segmented-control/segmented-control";

export default function GraphPage() {
  const font = useFont(require("src/assets/fonts/SpaceMono-Regular.ttf"), 12);
  const [timeSpan, setTimeSpan] = useState<WorkoutSessionsTimeSpan>("Y");
  const { data: workoutSessionList, isLoading } =
    useWorkoutSessionsByTimeSpan(timeSpan);
  const chartTransform = useChartTransformState();

  // TODO: handle UI when workoutSessionList is empty
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      {workoutSessionList ?
        <>
          <View
            style={{
              flex: 1,
              maxHeight: 256,
              marginHorizontal: 16,
            }}
          >
            <CartesianChart
              data={workoutSessionList!}
              domainPadding={8}
              xAxis={{
                font,
                lineColor: "grey",
                linePathEffect: <DashPathEffect intervals={[6, 6]} phase={0} />,
                labelColor: "white",
              }}
              yAxis={[
                {
                  font,
                  labelColor: "white",
                  lineColor: "grey",
                },
              ]}
              xKey={"id"}
              yKeys={["calories"]}
              transformState={chartTransform.state}
              viewport={{
                x: [
                  workoutSessionList[workoutSessionList.length - 1].id,
                  workoutSessionList[0].id,
                ],
              }}
            >
              {({ points, chartBounds, xScale, yScale, xTicks, yTicks }) => {
                return (
                  <>
                    <Line
                      points={points.calories}
                      color="red"
                      strokeWidth={1}
                    />
                    <Scatter points={points.calories} color="red" radius={5} />
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
              valueAtIndex && setTimeSpan(timeSpanLabels[index]);
            }}
          />
        </>
      : <ActivityIndicator />}
    </SafeAreaView>
  );
}
