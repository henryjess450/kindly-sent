import { test } from "node:test";
import assert from "node:assert/strict";
import { quote, pricing } from "../src/config/pricing.ts";
import { plainName, sealLetter } from "../src/lib/names.ts";

test("a card is $1", () => {
  assert.equal(pricing.cardCents, 100);
  assert.equal(quote().total, 100 + quote().cardTax);
});
test("sign-offs are stripped from names", () => {
  assert.equal(plainName("Love, Henry"), "Henry");
  assert.equal(plainName("Cheers, Henry"), "Henry");
  assert.equal(plainName("xoxo Sam"), "Sam");
  assert.equal(plainName("Henry"), "Henry");
  assert.equal(sealLetter("With love, Ana"), "A");
});
