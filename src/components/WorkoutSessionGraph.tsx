import { ActivityIndicator, SafeAreaView, View } from "react-native";
import { ThemedText } from "./Themed";
import { figmaColors } from "@/constants/Colors";
import { CartesianChart, Line, Bar, Scatter } from "victory-native";
import { useWorkoutSessions } from "@/hooks/workout-sessions";
import { useFont } from "@shopify/react-native-skia";

const stuff = [{ x: 0, y: 0 }].concat(
  Array.from({ length: 9 }, (_, i) => ({
    x: i + 1,
    y: Math.random() * 20,
  }))
);

export default function GraphPage() {
  const { data: workoutSessionList, isLoading } = useWorkoutSessions();
  if (isLoading) {
    <ActivityIndicator />;
  }
  // TODO: handle UI when workoutSessionList is empty
  if (!workoutSessionList) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          marginHorizontal: 24,
        }}
      >
        <ThemedText style={{ color: figmaColors.primaryWhite, fontSize: 24 }}>
          🚧{" "}
        </ThemedText>
        <ThemedText style={{ color: figmaColors.primaryWhite, fontSize: 24 }}>
          Couldn't load workout sessions...
        </ThemedText>
      </SafeAreaView>
    );
  }
  const font = useFont(require("src/assets/fonts/SpaceMono-Regular.ttf"), 12);
  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          flex: 1,
          maxHeight: 256,
          marginHorizontal: 16,
        }}
      >
        <CartesianChart
          data={workoutSessionList}
          domainPadding={8}
          xAxis={{
            font,
            lineColor: "grey",
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
        >
          {({ points, chartBounds, xScale, yScale, xTicks, yTicks }) => {
            return (
              <>
                <Line points={points.calories} color="red" strokeWidth={1} />
                <Scatter points={points.calories} color="red" radius={5} />
              </>
            );
          }}
        </CartesianChart>
      </View>
    </SafeAreaView>
  );
}
