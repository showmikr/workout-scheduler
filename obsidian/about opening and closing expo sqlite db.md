# About opening and closing expo sqlite db

Every time you call `openDatabaseAsync` it creates a new database connection in a pool. This means that if you call it twice in a row, you'll get two different connections. And if you try to call `deleteDatabaseAsync("test.db")`, you'll get an error because ALL connections in the pool must be closed before you can delete the database. However, you don't have to necessary track all references for each connection in the pool - you can just call `closeAsync()` on any one reference for however many connections in the pool there are and it will close each connection in the pool one at a time.

For example, if you do this in your app everything works:

```ts
const firstDbConnection = await openDatabaseAsync("test.db");
const secondDbConnection = await openDatabaseAsync("test.db");
await firstDbConnection.closeAsync(); // closes the first connection in the pool
await firstDbConnection.closeAsync(); // THIS WORKS! Even if you use the same connection twice in a row, it'll continue to close an existing connection in the pool
await deleteDatabaseAsync("test.db"); // Since both connections are closed, this will delete the database
```

Notice how the second call to `closeAsync()` works even though you're calling `closeAsync()` on the same connection twice in a row. This is proof that we don't need to keep track of all references to connections in the pool. If you have a single reference to the database connection, you can close it over and over until all connections in the pool are closed. Only once all connections are closed can you delete the database with `deleteDatabaseAsync()` without getting an error.

However, if you do this:

```ts
const firstDbConnection = await openDatabaseAsync("test.db");
const secondDbConnection = await openDatabaseAsync("test.db");
await firstDbConnection.closeAsync(); // closes the first connection in the pool, but remember the reference doesn't matter as all references point to the same connection pool and will close a connection in the pool
await deleteDatabaseAsync("test.db"); // THIS THROWS AN ERROR because there were 2 connections in the pool, and you can't delete the database if there is still one other connection still open
```
