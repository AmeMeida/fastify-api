import Database from "better-sqlite3";
import { fileURLToPath } from "url";
import { resolve, dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));

const db = new Database(resolve(__dirname, "database.db"), {
  verbose: import.meta.env.DEV ? console.log : undefined,
  fileMustExist: true
});

async function queryAll<T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const query = strings.join("?");
  const stmt = db.prepare(query);
  stmt.get();
  const rows = stmt.all(values);

  return rows as T[];
}

async function queryOne<T = unknown>(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<T> {
  const query = strings.join("?");

  const stmt = db.prepare(query);
  const rows = stmt.get(values);

  return rows as T;
}

async function nonQuery(
  strings: TemplateStringsArray,
  ...values: unknown[]
): Promise<Database.RunResult> {
  const query = strings.join("?");
  const stmt = db.prepare(query);
  return stmt.run(values);
}

export default {
  queryAll,
  queryOne,
  nonQuery
};
