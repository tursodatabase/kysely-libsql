# kysely-libsql

A [Kysely][kysely] dialect for [libSQL][libsql], compatible with [@libsql/client][libsql-client-ts].

[kysely]: https://github.com/koskimas/kysely
[libsql]: https://github.com/tursodatabase/libsql

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

Instead of a `url`, you can also pass an existing `Client` from [`@libsql/client`][libsql-client-ts]:

```typescript
import { createClient } from "@libsql/client";

const client = createClient({
    url: "libsql://localhost:8080",
});

const db = new Kysely<Database>({
    dialect: new LibsqlDialect({ client }),
});

// after you are done with the `db`, you must close the `client`:
client.close();
```

## Supported Configuration Options

The library accepts the exact same [options][client-options] as [`@libsql/client`][libsql-client-ts].

[libsql-client-ts]: https://github.com/tursodatabase/libsql-client-ts
[client-options]: https://docs.turso.tech/sdk/ts/reference#initializing

## License

This project is licensed under the MIT license.

### Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in `@libsql/kysely-libsql` by you, shall be licensed as MIT, without any additional terms or conditions.
