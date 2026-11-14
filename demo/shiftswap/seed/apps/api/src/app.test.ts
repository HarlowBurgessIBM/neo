import { expect, test } from "vitest";
import { buildApp } from "./app";
import { openDatabase } from "./db";

// Toolchain smoke tests. Replace them when the first real endpoint lands.

test("GET /api/healthz returns ok", async () => {
  const app = buildApp();
  const response = await app.inject({ method: "GET", url: "/api/healthz" });
  expect(response.statusCode).toBe(200);
  expect(response.json()).toEqual({ status: "ok" });
});

test("node:sqlite opens an in-memory database", () => {
  const db = openDatabase(":memory:");
  db.exec("CREATE TABLE probe (value TEXT NOT NULL)");
  db.prepare("INSERT INTO probe (value) VALUES (?)").run("ok");
  expect(db.prepare("SELECT value FROM probe").get()).toEqual({ value: "ok" });
  db.close();
});
