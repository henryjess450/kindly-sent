import { test } from "node:test";
import assert from "node:assert/strict";
import { zonedToUtc, nextYearDate } from "../src/lib/time.ts";

test("Vancouver winter is UTC-8", () => {
  assert.equal(new Date(zonedToUtc("2026-12-25", "08:00", "America/Vancouver")).toISOString(), "2026-12-25T16:00:00.000Z");
});
test("Vancouver summer is UTC-7", () => {
  assert.equal(new Date(zonedToUtc("2026-07-01", "09:30", "America/Vancouver")).toISOString(), "2026-07-01T16:30:00.000Z");
});
test("Halifax and Tokyo", () => {
  assert.equal(new Date(zonedToUtc("2026-03-01", "00:00", "America/Halifax")).toISOString(), "2026-03-01T04:00:00.000Z");
  assert.equal(new Date(zonedToUtc("2026-03-01", "09:00", "Asia/Tokyo")).toISOString(), "2026-03-01T00:00:00.000Z");
});
test("day after spring forward", () => {
  assert.equal(new Date(zonedToUtc("2027-03-14", "12:00", "America/Vancouver")).toISOString(), "2027-03-14T19:00:00.000Z");
});
test("leap day repeats on Feb 28", () => {
  assert.equal(nextYearDate("2028-02-29"), "2029-02-28");
  assert.equal(nextYearDate("2026-10-11"), "2027-10-11");
});
