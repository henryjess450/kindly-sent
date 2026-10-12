// Everything that costs money, in cents (CAD).
export const pricing = {
  currency: "CAD",
  cardCents: 100, // $1 per card sent
  // Taxes on the card fee. Check with an accountant; BC usually means 5% GST
  // once you pass $30k a year in sales.
  cardTaxPercent: 0,
};

export function quote() {
  const card = pricing.cardCents;
  const cardTax = Math.round((card * pricing.cardTaxPercent) / 100);
  return { card, cardTax, total: card + cardTax };
}
export type Quote = ReturnType<typeof quote>;

export const money = (cents: number) =>
  (cents / 100).toLocaleString("en-CA", { style: "currency", currency: pricing.currency, minimumFractionDigits: cents % 100 ? 2 : 0 });
