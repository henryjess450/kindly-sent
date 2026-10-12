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
