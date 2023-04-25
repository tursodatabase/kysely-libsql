import { Kysely, Generated } from "kysely";
import { LibsqlDialect, hrana } from "..";

interface BookTable {
    id: Generated<number>,
    title: string,
}

interface Database {
    book: BookTable,
}

const url = process.env.URL ?? "ws://localhost:8080";

function withDb(callback: (db: Kysely<Database>) => Promise<void>): () => Promise<void> {
    return async () => {
        const client = hrana.open(url);
        try {
            const s = client.openStream();
            await s.run("DROP TABLE IF EXISTS book");
            await s.run("CREATE TABLE book (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT)");
            s.close();

            const db = new Kysely<Database>({
                dialect: new LibsqlDialect({ client }),
            });
            await callback(db);
            await db.destroy();
        } finally {
            client.close();
        }
    };
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
        const { id } = await db.insertInto("book")
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
