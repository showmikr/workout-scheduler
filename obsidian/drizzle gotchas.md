## Boolean Don't Get Interpretted Correctly

So, part of the reason I chose to use drizzle is because it allows you to generate typescript types by introspecting your database. The problem is that columns labeled as `boolean` types simply get parsed as `numeric` types by drizzle. I have a few `boolean` columns in my tables, so that's a huge problem. The only fix right now is that once you generate a `schema.ts` file, go into it and manually change any `numeric` columns that were supposed to be booleans into `integer` types with a `{ mode: "boolean" }` config.
