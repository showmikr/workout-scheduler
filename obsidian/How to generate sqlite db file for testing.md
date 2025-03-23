## Manual Steps

1. Make sure you have `sqlite3` installed on your terminal (this isn't an npm package, dummy, it's an actual command line application).
2. Run `sqlite3 :memory:`
3. Then run `.read my-schema.sql` (replace `my-schema` with whatever path you have to your sql schema file)
4. Lastly run `.backup my-output.db` - This is will save your schema to an actual sqlite db file (if you had any `INSERT` statements the db file will hold those rows you've inserted as well, otherwise it'll just be a db with empty tables)

## Single Command Steps

Just run `npm run pull-schema`

- It's a custom command script I wrote up in the `package.json` scripts section that generates a sample db, let's drizzle introspect it to generate the drizzle schema types, and run automatic cleanup of the db file.

## Most Recent Use Case

I needed to supply `npx drizzle-kit pull`, a command for introspecting databases for their schema definitions, a sqlite database file (not a .sql text file, but an actual sqlite file), so I used the steps outlined above to make myself a db file and here I am. I now have a typescript schema definition made for the Drizzle framework to be able to Drizzle based queries. If you've forgotten Drizzle is an ORM that allows us to make type-safe queries to our database (with autocomplete for column names and everything!). Unlike other ORMs however, Drizzle lets us keep using our familiar SQL query constructs without screwing us on performance due to crazy ORM abstractions. I'm ultimately planning on trying to use Drizzle for querying the database from now on instead of writing plain SQL (although, it'll be pretty darn close to it)
