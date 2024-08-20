import mysql, { type QueryResult } from "mysql2/promise";
import { DB } from "./enviroment";

const pool = mysql.createPool(DB);

export default async function sql<T = QueryResult>(
  queryParts: TemplateStringsArray,
  ...values: unknown[]
) {
  if (values.length <= 0) {
    const [res] = await pool.execute(queryParts[0]);
    return res;
  }

  const query = queryParts.join("?");

  const [res] = await pool.execute(query, values);
  return res as T;
}

export async function prepare<T = QueryResult>(
  queryParts: TemplateStringsArray,
  ...keys: never[]
): Promise<() => Promise<T>>;

export async function prepare<T = QueryResult, K extends string = string>(
  queryParts: TemplateStringsArray,
  ...keys: K[]
): Promise<(values: Record<K, unknown>) => Promise<T>>;

export async function prepare<T = QueryResult, K extends string = string>(
  queryParts: TemplateStringsArray,
  ...keys: K[]
): Promise<(() => Promise<T>) | ((values: Record<K, unknown>) => Promise<T>)> {
  if (keys.length <= 0) {
    const stmt = await pool.prepare(queryParts[0]);

    return async () => {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      const [[res]] = (await stmt.execute([])) as any;

      return res as T;
    };
  }

  const query = queryParts.join("?");
  const stmt = await pool.prepare(query);

  return async (values: Record<K, unknown>) => {
    const mapped = keys.map((key) => values[key]);

    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const [[res]] = (await stmt.execute(mapped)) as any;

    return res as T;
  };
}

// const users = await sql`SELECT * FROM users WHERE name = ${"shimigadoo"}`;

// console.log(users);

// const insert = await prepare<number>`
//   INSERT INTO users ${"hiii"} e etc
// `;

// insert({
//   hiii: "hi",
// });

// const nop = await prepare`SELECT * FROM users`;

// nop();
