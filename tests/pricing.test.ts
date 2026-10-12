import { test } from "node:test";
import assert from "node:assert/strict";
import { groupQuote, quote, pricing } from "../src/config/pricing.ts";
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
test("group cards are $1.50 each, 50¢ each from 5", () => {
  assert.equal(groupQuote(1).subtotal, 150);
  assert.equal(groupQuote(4).subtotal, 600);
  assert.equal(groupQuote(4).toBulk, 1);
  assert.equal(groupQuote(5).subtotal, 250);
  assert.equal(groupQuote(5).bulk, true);
  assert.equal(groupQuote(5).savings, 500);
  assert.equal(groupQuote(12).each, 50);
  assert.equal(groupQuote(0).total, 0);
});
