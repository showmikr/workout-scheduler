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

# 6/9/2025

- Learn a bit more about `xScale` and `yScale` on the `onScaleChange` prop for `CartesianChart` in `victory-native`
- `xScale` & `yScale` refer to a D3 Linear Scale (D3 is a JS graphing library that `victory-native` depends on)
- A linear scale in D3 refers to a continuous linear mapping (i.e y = mx + b) of a domain to a range (i.e 1 to 100 mapped to 300 to 900)

## What I learned

- `xScale` and `yScale` are also available in the render function for the points in the graph. Look it up in the [docs](https://nearform.com/open-source/victory-native/docs/cartesian/cartesian-chart/#xscale). `xScale` and `yScale` are the mapping functions used to go from an (x,y) coordinate to an actual position on the canvas. For example, if you had coordinates (20, 30) on your graph, you could make a Skia Circle at (20,30) by writing this:

```tsx
<CartesianChart>
  {({ points, xScale, yScale }) => {
    //...Skip irrelevant props
    return (
      <>
        <Line
          points={points.calories}
          color="red"
          opacity={chartOpacity}
          strokeWidth={1}
        />
        {/** This allows us to see the (20,30) coordinate in the screen position on the graph */}
        <Circle cx={xScale(20)} cy={yScale(30)} color={"cyan"} r={3} />
      </>
    );
  }}
</CartesianChart>
```

# 6/11/2025

- Work on workout session card UI (copy from figma design)

# 6/15/2025

I have to create all the tables in the test database manually for the test drizzle db b/c it's not running the migrations of the
main db. Hence, the need for the manual creaion of tables in the test db.

# 6/17/2025

- Need to figure out why `deleteDatabaseAsync` isn't working on the test db. According to the error message, it's because the db is still open. It might have to do with the fact that the db reference I'm passing to `deleteDatabaseAsync` function isn't the same as the one I'm using in the `useDrizzleTestDb` hook. I'll have to investigate this further.

# 6/18/2025

The reason for teh errors for `deleteDatabaseAsync` is because I made more than one call to `openDatabaseAsync` in the code (like useEffect calling it twice or the page loading twice). Multiple calls to `openDatabaseAsync` will create multiple connections in the pool and the `deleteDatabaseAsync` function will only delete the database without error once you've called `closeAsync` (on any one of the connections) for as many times as there are connections in the pool.

# 6/19/2025

- I'm going to make it so that we can properly open and close the test db without errors/warnings. Everytime we open the db, we'll need to make sure we close it (that means we return a cleanup function from the useEffect hook).

# 6/21/2025

I want to genereate the seed data for the test db using drizzle-seed.

1. We'll need to generate arrays of the constants (like exercises, exercise classes, etc.)
2. We'll plug in those arrays to the seed data generator function to randomly select from the arrays

# 6/22/2025

Finish up seeding all the data for test db

- This means inserting all workouts, associated exercises, exercise sets and...
- reading out the workout and exercise data

# 6/23/2025

- Make a function that can make random seed exercise with sets. The weight of each set should follow an upward trend.
- Need to test if I'm properly adding the exercise sessions and set sessions now that I've written the code for it.
  - Above is done and looks to be working. I can see the data in the test db and it looks correct.

# 7/3/2025

- Replaced all seed data (originally using manually written SQL script) with new seed data generating function using drizzle.
- Noticed a visual bug where deleting sets in workout template page causes next set rendered to also display swiped-left state showing the delete button. I have a hunch this has to do with us querying the data in each set individually versus normally querying the whole list of sets and then rendering them. This _may_ be because the Tanstack Query's `useMutation` hook is not properly updating the state of the set when we delete it, so the next set rendered is still in the "swiped-left" state. Will need to investigate this further.
- it's the `SetSwipeable` component that is not properly resetting its state when the set is deleted. I think that it either is memoized or it needs a key prop to reset its state when the set is deleted. I will try adding a key prop to the `SetSwipeable` component that is based on the set's id and see if that fixes the issue.
- DISREGARD ABOVE VISUAL GLITCH!: I just fixed the visual bug! It had to do with the section list in the `[workoutId]/index.tsx` not using a `keyExtractor` prop. I added a `keyExtractor` prop to the section list that uses the set's id as the key and now the visual bug is gone! The next set rendered no longer shows the swiped-left state when a set is deleted.
