# Plan

# A few days earlier than 6/1/2025

Work more on the graph
How?
I'd like to make the time span sliders work.
Make it so that when you press on a timespan on the segment slider, you get the desired timespan of workout sessions shown on the graph.
I'd also like it so that I can cache the filtered results (as I'm storing ALL the workout sessions across time, so I might as well take slices of the sessions from cache)

What costs do we HAVE to eat:

- binary search cost of finding the cutoff dates for each timespan
  We can eat this cost on first load, we can capture the
- cost of copying a slice from beginning to cutoff index for each timespan

# 6/1/2025

I thought using the viewport bounds would work for limiting the area of the graph shown to the user, but it didn't work the way I intended

- The viewport correctly limits the domain range (i.e it can be used to give the last 6 months of data or last year's of data correctly), but it's massive flaw is anything outisde of that domain or viewport area doesn't register any gestures like panning. You can't pan the graph left/right when you tap outside of the designated viewport area. I can get any effective panning this way when I want to let users scroll through their history.

## Problems

1. Adjust the view and visible domain to match the range of data we want to show (i.e Y, 6M, M, etc.)

   1. This really means that we need to:

      1. zoom the x-axis to match the desired x-axis range
      2. Pitfall Discovered: Zooming in causes everything to look "thicker" than normal. Points are larger and the lines are thicker.
      3. Actual desire is to zoom in the view, but not scale the actual graphics. I can't see any option besides modifying the viewport range to display ranges of sessions.

      4. Panning can still be done with a simple translation

2. What do we want to do at a high level:

3. On pan-end, we want to record how many units we've moved in the x-axis.

- How do we record that?

  1. Shift the viewport range ahead/behind by the units moved
  2. Can we animate this motion? 3. We probably can by doing the graphical movement first, then setting the viewport after the animation finishes
  3. We can use the `withCallback` function from `react-native-reanimated` to run our panning animation when we click on a different time-range and then run the callback to set the viewport x-axis range. We'll want to make sure we call this callback with `runOnJS` so that we can run the callback on the JS thread when dealing with data not associated with `reanimated`

# 6/5/2025

# Goal

- Want to implement scrollOff feature where letting go of a swipe gesture causes the graph to keep scrolling a little bit after

## Big Note about how to translate chart X,Y coordinate to actual canvas pixel position

the x and y axis labels are APART of the chartBounds! That means that if the chart has y-axis labels on the left side that take up 10 pixels of width, and x-axis labels on the bottom side that take up 12 pixels of heigth, then the pixel position of the origin of that chart is actually `{xPosition: 12 + chartBounds.bottom, yPosition: 10 + chartBounds.left}`. If you think about it, this makes sense because the labels take up some of the chart's occupied space. The chart's bounds tell us how much of this space is used in values like `chartBounds.left` and `chartBounds.bottom`: they tell us where the bounds of the visible graph actually begin compared to the bounds of the Skia Canvas that holds both the chart and the labels combined.
