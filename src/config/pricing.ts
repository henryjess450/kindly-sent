// Everything that costs money, in cents (CAD).
export const pricing = {
  currency: "CAD",
  cardCents: 100, // $1 per card sent
  // Taxes on the card fee. Check with an accountant; BC usually means 5% GST
  // once you pass $30k a year in sales.
  cardTaxPercent: 0,
  // Group cards: $1.50 each, or 50¢ each when the cart has 5 or more.
  groupCents: 150,
  groupBulkCents: 50,
  groupBulkMin: 5,
};

export function quote() {
  const card = pricing.cardCents;
  const cardTax = Math.round((card * pricing.cardTaxPercent) / 100);
  return { card, cardTax, total: card + cardTax };
}
export type Quote = ReturnType<typeof quote>;

/** The cart total for n group cards. The bulk price applies to every card once n reaches the minimum. */
export function groupQuote(n: number) {
  const count = Math.max(0, Math.floor(n));
  const bulk = count >= pricing.groupBulkMin;
  const each = bulk ? pricing.groupBulkCents : pricing.groupCents;
  const subtotal = each * count;
  const tax = Math.round((subtotal * pricing.cardTaxPercent) / 100);
  return {
    count,
    each,
    bulk,
    subtotal,
    tax,
    total: subtotal + tax,
    savings: count * pricing.groupCents - subtotal,
    // How many more cards unlock the bulk price (0 once it applies).
    toBulk: bulk ? 0 : pricing.groupBulkMin - count,
  };
}
export type GroupQuote = ReturnType<typeof groupQuote>;

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-CA", { style: "currency", currency: pricing.currency, minimumFractionDigits: cents % 100 ? 2 : 0 });
