import { Kysely, Generated } from "kysely";
import { LibsqlDialect, hrana } from "@libsql/kysely-libsql";

interface Database {
    book: BookTable,
}

interface BookTable {
    id: Generated<number>,
    author: string,
    title: string,
    year: number | null,
}

async function example() {
    const db = new Kysely<Database>({
        dialect: new LibsqlDialect({
            url: "ws://localhost:8080",
        }),
    });

    /*
    const client = hrana.open("ws://localhost:8080");
    const db = new Kysely<Database>({
        dialect: new LibsqlDialect({ client }),
    });
    */

    await db.schema
        .createTable("book")
        .addColumn("id", "integer", col => col.primaryKey())
        .addColumn("author", "text", col => col.notNull())
        .addColumn("title", "text", col => col.notNull())
        .addColumn("year", "integer")
        .execute();

    await db
        .insertInto("book")
        .values([
            { author: "Jane Austen", title: "Sense and Sensibility", year: 1811 },
            { author: "Daniel Defoe", title: "Robinson Crusoe", year: 1719 },
            { author: "Sally Rooney", title: "Beautiful World, Where Are You?", year: 2021 },
        ])
        .execute();

    const books = await db
        .selectFrom("book")
        .selectAll()
        .orderBy("year", "asc")
        .execute();
    for (const book of books) {
        console.dir(book);
    }

    await db.destroy();
}

example();
