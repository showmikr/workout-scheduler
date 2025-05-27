# Plan

Work more on the graph
How?
I'd like to make the time span sliders work.
Make it so that when you press on a timespan on the segment slider, you get the desired timespan of workout sessions shown on the graph.
I'd also like it so that I can cache the filtered results (as I'm storing ALL the workout sessions across time, so I might as well take slices of the sessions from cache)

What costs do we HAVE to eat:

- binary search cost of finding the cutoff dates for each timespan
  We can eat this cost on first load, we can capture the
- cost of copying a slice from beginning to cutoff index for each timespan
