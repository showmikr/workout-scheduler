# Handling the "server"

- Selected Set Id
- Selected Set Parameter
```typescript
type selectedSetToEdit = {
	setId: number;
	param: "reps" | "weight" | "rest"
} | null
```
*Above handles the parent level state management*
*As in, we know which set item needs to be edited (which thing to hook up to our bottom sheet)*

# Handling the "client"

Need to check per set param: *am I the selected set?*
- Criteria?
	- setId match?
	- param match?
pass criteria as `selected` boolean prop to "dumb" set param component

# Handling Bottom Sheet View

Need to know which set id and param are selected.
Know that info, know what to render:
- Param == "reps"? Then render Reps View inside
