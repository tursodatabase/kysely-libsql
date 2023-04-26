# kysely-libsql

A [Kysely][kysely] dialect for [libSQL/sqld][sqld], using the [Hrana][hrana-client-ts] protocol over a WebSocket.

[kysely]: https://github.com/koskimas/kysely
[sqld]: https://github.com/libsql/sqld
[hrana-client-ts]: https://github.com/libsql/hrana-client-ts

## Installation

```shell
npm install @libsql/kysely-libsql
```

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
        url: "ws://localhost:8080",
        authToken: "<token>", // optional
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

## Supported URLs

This library is based directly on the WebSocket client, so it only supports [`ws:`, `wss:` and `libsql:` URLs][supported-urls]. Connecting to a local SQLite file is not supported; we suggest that you use the native Kysely dialect for SQLite.

[supported-urls]: https://github.com/libsql/libsql-client-ts#supported-urls

## License

This project is licensed under the MIT license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in `@libsql/kysely-libsql` by you, shall be licensed as MIT, without any additional terms or conditions.
