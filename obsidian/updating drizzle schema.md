# Updating Drizzle Schema

When you update the drizzle `schema.ts` file, you'll need to follow these steps to ensure the app db gets updated:

1. run `node update-schema.mjs` on your terminal. This will execute a script I wrote that will delete the existing `drizzle` folder and create a new one with the updated schema.

- Might have to make a `package.json` script for this in the future.
- or even a git hook that runs this script automatically when you commit changes to `schema.ts`.

2. Run the app with `npx expo start -c` to clear the cache and ensure the new schema is loaded.
