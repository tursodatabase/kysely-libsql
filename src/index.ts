import * as hrana from "@libsql/hrana-client";
import * as kysely from "kysely";

export * as hrana from "@libsql/hrana-client";

export interface LibsqlDialectConfig {
    client?: hrana.Client,
    url?: string,
    authToken?: string,
}

export class LibsqlDialect implements kysely.Dialect {
    #config: LibsqlDialectConfig

    constructor(config: LibsqlDialectConfig) {
        this.#config = config;
    }

    createAdapter(): kysely.DialectAdapter {
        return new kysely.SqliteAdapter();
    }

    createDriver(): kysely.Driver {
        let client: hrana.Client;
        let closeClient: boolean;
        if (this.#config.client !== undefined) {
            client = this.#config.client;
            closeClient = false;
        } else if (this.#config.url !== undefined) {
            const parsedUrl = hrana.parseLibsqlUrl(this.#config.url)
            const authToken = parsedUrl.authToken ?? this.#config.authToken;
            if (parsedUrl.hranaHttpUrl !== undefined) {
                client = hrana.openHttp(parsedUrl.hranaHttpUrl, authToken);
            } else {
                client = hrana.openWs(parsedUrl.hranaWsUrl!, authToken);
            }
            closeClient = true;
        } else {
            throw new Error("Please specify either `client` or `url` in the LibsqlDialect config");
        }

        return new HranaDriver(client, closeClient);
    }

    createIntrospector(db: kysely.Kysely<any>): kysely.DatabaseIntrospector {
        return new kysely.SqliteIntrospector(db);
    }

    createQueryCompiler(): kysely.QueryCompiler {
        return new kysely.SqliteQueryCompiler();
    }
}

export class HranaDriver implements kysely.Driver {
    client: hrana.Client;
    #closeClient: boolean;

    constructor(client: hrana.Client, closeClient: boolean) {
        this.client = client;
        this.#closeClient = closeClient;
    }

    async init(): Promise<void> {
    }

    async acquireConnection(): Promise<HranaConnection> {
        return new HranaConnection(this.client.openStream());
    }

    async beginTransaction(
        connection: HranaConnection,
        _settings: kysely.TransactionSettings,
    ): Promise<void> {
        await connection.stream.run("BEGIN IMMEDIATE");
    }

    async commitTransaction(connection: HranaConnection): Promise<void> {
        await connection.stream.run("COMMIT");
    }

    async rollbackTransaction(connection: HranaConnection): Promise<void> {
        await connection.stream.run("ROLLBACK");
    }

    async releaseConnection(connection: HranaConnection): Promise<void> {
        connection.stream.close();
    }

    async destroy(): Promise<void> {
        if (this.#closeClient) {
            this.client.close();
        }
    }
}

export class HranaConnection implements kysely.DatabaseConnection {
    stream: hrana.Stream

    constructor(stream: hrana.Stream) {
        this.stream = stream;
    }

    async executeQuery<R>(compiledQuery: kysely.CompiledQuery): Promise<kysely.QueryResult<R>> {
        const stmt = new hrana.Stmt(compiledQuery.sql);
        stmt.bindIndexes(compiledQuery.parameters as Array<hrana.InValue>);
        const rowsResult = await this.stream.query(stmt);
        return {
            numAffectedRows: BigInt(rowsResult.affectedRowCount),
            rows: rowsResult.rows as R[],
        };
    }

    async *streamQuery<R>(
        _compiledQuery: kysely.CompiledQuery,
        _chunkSize: number,
    ): AsyncIterableIterator<kysely.QueryResult<R>> {
        throw new Error("Hrana protocol does not support streaming yet");
    }
}
