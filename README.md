# kysely-libsql

A [Kysely][kysely] dialect for [libsql/sqld][sqld], using the [Hrana][hrana-client-ts] protocol over a WebSocket.

[kysely]: https://github.com/koskimas/kysely
[sqld]: https://github.com/libsql/sqld
[hrana-client-ts]: https://github.com/libsql/hrana-client-ts

## Usage

Pass a `LibsqlDialect` instance as the `dialect` when creating the `Kysely` object:

```typescript
import { Kysely } from "kysely";
import { LibsqlDialect } from "@libsql/kysely-libsql";

interface Database {
    ...
}

const db = new Kysely<Database>({
    dialect: new LibsqlDialect({
        url: "ws://localhost:2023",
        jwt: "<jwt>", // optional
    }),
});
```

Instead of a `url`, you can also pass an instance of `Client` from [`@libsql/hrana-client`][hrana-client-ts] as `client`:

```typescript
import * as hrana from "@libsql/hrana-client";
// Alternatively, the `kysely-libsql` package reexports the `hrana-client`
//import { hrana } from "@libsql/kysely-libsql";

const client = hrana.open("ws://localhost:2023");

const db = new Kysely<Database>({
    dialect: new LibsqlDialect({ client }),
});

// after you are done with the `db`, you must close the `client`:
client.close();
```
