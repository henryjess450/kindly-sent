// Everything that costs money, in cents (CAD).
export const pricing = {
  currency: "CAD",
  cardCents: 100, // $1 per card sent
  // Square charges about 2.9% + 30¢ online, so a $50 gift costs ~$1.75 to
  // process. Set a percentage here to cover it (0 = absorb it).
  giftServiceFeePercent: 0,
  gift: {
    minCents: 500,
    maxCents: 50000,
    presetsCents: [1000, 2500, 5000, 10000],
  },
  // Taxes on the card fee. Gift card value is never taxed.
  // Check with an accountant; BC usually means 5% GST once you pass $30k/year.
  cardTaxPercent: 0,
};

export function quote(giftCents: number) {
  const card = pricing.cardCents;
  const cardTax = Math.round((card * pricing.cardTaxPercent) / 100);
  const giftFee = Math.round((giftCents * pricing.giftServiceFeePercent) / 100);
  return { card, cardTax, gift: giftCents, giftFee, total: card + cardTax + giftCents + giftFee };
}
export type Quote = ReturnType<typeof quote>;

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-CA", { style: "currency", currency: pricing.currency, minimumFractionDigits: cents % 100 ? 2 : 0 });
