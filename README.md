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
        url: "libsql://localhost:8080?tls=0",
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

The library accepts the [same URL schemas][supported-urls] as [`@libsql/client`][libsql-client-ts] except `file:`:

- `http://` and `https://` connect to a libsql server over HTTP,
- `ws://` and `wss://` connect to the server over WebSockets,
- `libsql://` connects to the server using the default protocol (which is now HTTP). `libsql://` URLs use TLS by default, but you can use `?tls=0` to disable TLS (e.g. when you run your own instance of the server locally).

Connecting to a local SQLite file using `file:` URL is not supported; we suggest that you use the native Kysely dialect for SQLite.

[libsql-client-ts]: https://github.com/libsql/libsql-client-ts
[supported-urls]: https://github.com/libsql/libsql-client-ts#supported-urls

## License

This project is licensed under the MIT license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in `@libsql/kysely-libsql` by you, shall be licensed as MIT, without any additional terms or conditions.
