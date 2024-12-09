# Concerns
- Plating is no good, too cramped inside row view
	- Doesn't clearly show plates are for 1 side of the bar, not both
	- Doesn't account for weight of bar

# Fixes
- Put the plates view in a separate view menu
- Hybrid approach:
	- Use both the swipe view and a menu
		- Swipe view is there, but
		- There's also a menu view
- Keep the swipe-view, just increase the view height as you swipe
- What will the menu view look like?
	- The menu view will be a horizontal FlatList that shows the user it can be scrolled in the case there are more plates.
		- There should be a visible horizontal scroll bar on the list if there are more plates than fit on the screen
		- Plates will be stacked if there are multiples of any given weight
	- 