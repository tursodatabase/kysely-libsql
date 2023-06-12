import { Kysely, Generated, sql } from "kysely";
import { LibsqlDialect, hrana } from "..";

const url = process.env.URL ?? "ws://localhost:8080";

function withDb(callback: (db: Kysely<Database>) => Promise<void>): () => Promise<void> {
    return async () => {
        const db = new Kysely<Database>({
            dialect: new LibsqlDialect({ url }),
        });
        try {
            await createTables(db);
            await callback(db);
        } finally {
            await db.destroy();
        }
    };
}



interface BookTable {
    id: Generated<number>,
    title: string,
}

interface Database {
    book: BookTable,
}

async function createTables(db: Kysely<Database>): Promise<void> {
    await sql<void[]>`
        DROP TABLE IF EXISTS book
    `.execute(db);
    await sql<void[]>`
        CREATE TABLE book (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)
    `.execute(db);
}



test("basic operations", withDb(async (db) => {
    const { id } = await db.insertInto("book")
        .values({ title: "Pride and Prejudice" })
        .returning("id")
        .executeTakeFirstOrThrow();

    const book = await db.selectFrom("book")
        .select(["id", "title"])
        .where("book.id", "=", id)
        .executeTakeFirst();

    expect(book!.id).toStrictEqual(id);
    expect(book!.title).toStrictEqual("Pride and Prejudice");
}));

test("transaction", withDb(async (db) => {
    const id = await db.transaction().execute(async (txn) => {
        const { id } = await txn.insertInto("book")
            .values({ title: "Sense and Sensibility" })
            .returning("id")
            .executeTakeFirstOrThrow();
        return id;
    });

    const book = await db.selectFrom("book")
        .select(["id", "title"])
        .where("book.id", "=", id)
        .executeTakeFirst();

    expect(book!.id).toStrictEqual(id);
}));
