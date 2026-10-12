import { test } from "node:test";
import assert from "node:assert/strict";
import { quote, pricing } from "../src/config/pricing.ts";

test("a card alone is $1", () => {
  assert.equal(quote(0).total, pricing.cardCents);
  assert.equal(pricing.cardCents, 100);
});
test("gift value is added on top", () => {
  const q = quote(2500);
  assert.equal(q.gift, 2500);
  assert.equal(q.total, 100 + 2500 + q.giftFee + q.cardTax);
});

import { plainName, sealLetter } from "../src/lib/names.ts";
test("sign-offs are stripped from names", () => {
  assert.equal(plainName("Love, Henry"), "Henry");
  assert.equal(plainName("Cheers, Henry"), "Henry");
  assert.equal(plainName("xoxo Sam"), "Sam");
  assert.equal(plainName("Henry"), "Henry");
  assert.equal(sealLetter("With love, Ana"), "A");
});
