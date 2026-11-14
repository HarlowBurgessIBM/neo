import { DatabaseSync } from "node:sqlite";

/**
 * Opens the application database. Persistence is SQLite through Node's built-in
 * `node:sqlite` module, so there is no native dependency to compile.
 * Pass ":memory:" in tests.
 */
export function openDatabase(path: string): DatabaseSync {
  return new DatabaseSync(path);
}
