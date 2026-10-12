import { test } from "node:test";
import assert from "node:assert/strict";
import { open, seal } from "../src/lib/secretbox.ts";

test("gift codes round-trip and are not stored in plain text", () => {
  const codes = { credentials: [{ label: "Card number", value: "6006491234567890" }, { label: "PIN", value: "1234" }] };
  const sealed = seal(codes);
  assert.ok(!sealed.includes("6006491234567890"));
  assert.deepEqual(open(sealed), codes);
});
test("tampering is detected", () => {
  const sealed = seal({ a: 1 });
  const parts = sealed.split(".");
  parts[3] = parts[3].slice(0, -2) + (parts[3].endsWith("A") ? "BB" : "AA");
  assert.throws(() => open(parts.join(".")));
});
