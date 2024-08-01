import * as libsql from "@libsql/client";
import * as kysely from "kysely";

export type LibsqlDialectConfig =
    | {
            client: libsql.Client;
        }
    | libsql.Config;

export class LibsqlDialect implements kysely.Dialect {
    #config: LibsqlDialectConfig;

    constructor(config: LibsqlDialectConfig) {
        this.#config = config;
    }

    createAdapter(): kysely.DialectAdapter {
        return new kysely.SqliteAdapter();
    }

    createDriver(): kysely.Driver {
        let client: libsql.Client;
        let closeClient: boolean;
        if ("client" in this.#config) {
            client = this.#config.client;
            closeClient = false;
        } else if (this.#config.url !== undefined) {
            client = libsql.createClient(this.#config);
            closeClient = true;
        } else {
            throw new Error(
                "Please specify either `client` or `url` in the LibsqlDialect config"
            );
        }

        return new LibsqlDriver(client, closeClient);
    }

    createIntrospector(db: kysely.Kysely<any>): kysely.DatabaseIntrospector {
        return new kysely.SqliteIntrospector(db);
    }

    createQueryCompiler(): kysely.QueryCompiler {
        return new kysely.SqliteQueryCompiler();
    }
}

export class LibsqlDriver implements kysely.Driver {
    client: libsql.Client;
    #closeClient: boolean;

    constructor(client: libsql.Client, closeClient: boolean) {
        this.client = client;
        this.#closeClient = closeClient;
    }

    async init(): Promise<void> {}

    async acquireConnection(): Promise<LibsqlConnection> {
        return new LibsqlConnection(this.client);
    }

    async beginTransaction(
        connection: LibsqlConnection,
        _settings: kysely.TransactionSettings
    ): Promise<void> {
        await connection.beginTransaction();
    }

    async commitTransaction(connection: LibsqlConnection): Promise<void> {
        await connection.commitTransaction();
    }

    async rollbackTransaction(connection: LibsqlConnection): Promise<void> {
        await connection.rollbackTransaction();
    }

    async releaseConnection(_conn: LibsqlConnection): Promise<void> {}

    async destroy(): Promise<void> {
        if (this.#closeClient) {
            this.client.close();
        }
    }
}

export class LibsqlConnection implements kysely.DatabaseConnection {
    client: libsql.Client;
    #transaction?: libsql.Transaction;

    constructor(client: libsql.Client) {
        this.client = client;
    }

    async executeQuery<R>(
        compiledQuery: kysely.CompiledQuery
    ): Promise<kysely.QueryResult<R>> {
        const target = this.#transaction ?? this.client;
        const result = await target.execute({
            sql: compiledQuery.sql,
            args: compiledQuery.parameters as Array<libsql.InValue>,
        });
        return {
            insertId: result.lastInsertRowid,
            numAffectedRows: BigInt(result.rowsAffected),
            rows: result.rows as Array<R>,
        };
    }

    async beginTransaction() {
        if (this.#transaction) {
          throw new Error("Transaction already in progress");
        }
        this.#transaction = await this.client.transaction();
    }

    async commitTransaction() {
        if (!this.#transaction) {
            throw new Error("No transaction to commit");
        }
        await this.#transaction.commit();
        this.#transaction = undefined;
    }

    async rollbackTransaction() {
        if (!this.#transaction) {
            throw new Error("No transaction to rollback");
        }
        await this.#transaction.rollback();
        this.#transaction = undefined;
    }

    async *streamQuery<R>(
        _compiledQuery: kysely.CompiledQuery,
        _chunkSize: number
    ): AsyncIterableIterator<kysely.QueryResult<R>> {
        throw new Error("Libsql Driver does not support streaming yet");
    }
}
