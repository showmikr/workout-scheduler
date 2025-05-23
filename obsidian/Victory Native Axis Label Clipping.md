# Victory Native Axis Label Clipping Issue

## Problem

When using Victory Native's `CartesianChart` component, there's an issue with axis label rendering where the `xAxis` labels get clipped/cropped from the bottom if:

- You only configure the `xAxis` with font properties
- You don't also configure the `yAxis` with font properties

## Example of the Issue

```tsx
// This will cause clipping
const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 16);
<CartesianChart data={DATA} xKey="day" yKeys={["highTmp"]} xAxis={{ font }}>
  {({ points }) => <Line points={myData} color="red" strokeWidth={2} />}
</CartesianChart>;
```

## Workaround

To fix this issue, ensure that you either:

1. Configure both axes with font properties, even if you don't need labels on the y-axis

2. Or use the deprecated `axisOptions` prop and set your font there, but that will enable labels on both the x-axis and y-axis as far as I know.

```tsx
// This will cause clipping
const font = useFont(require("@/assets/fonts/SpaceMono-Regular.ttf"), 16);
<CartesianChart
  data={DATA}
  xKey="day"
  yKeys={["highTmp"]}
  xAxis={{ font }}
  yAxis={{ font }} // Added this!
>
  {({ points }) => <Line points={myData} color="red" strokeWidth={2} />}
</CartesianChart>;
```

## Date Documented

May 25, 2025
