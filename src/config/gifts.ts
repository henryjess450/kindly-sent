// Gift cards people can tuck inside a card. Bought when the card is delivered,
// never before, and the card number + PIN are printed inside the card.
//
// GIFT_PROVIDER=tango (default): Tango Card returns the real card number and PIN.
//   tangoUtid comes from `node scripts/gift-catalog.mjs [search]`.
// GIFT_PROVIDER=tremendous: Tremendous only gives a redeem link (no PIN).
// A brand with no ID for the active provider is hidden in production.

export type GiftBrand = {
  id: string;
  name: string;
  blurb: string;
  bg: string; // tile colour
  fg: string; // tile text colour
  tangoUtid?: string; // Tango Card item, e.g. "U123456"
  tremendousProductId?: string; // Tremendous product(s), comma separated
};

export const GIFT_BRANDS: GiftBrand[] = [
  { id: "choice", name: "Recipient's Choice", blurb: "They pick from 100+ stores", bg: "#1D1D1F", fg: "#FFFFFF" },
  { id: "amazon", name: "Amazon.ca", blurb: "Almost anything", bg: "#232F3E", fg: "#FF9900" },
  { id: "tims", name: "Tim Hortons", blurb: "Coffee and Timbits", bg: "#C8102E", fg: "#FFFFFF" },
  { id: "starbucks", name: "Starbucks", blurb: "A treat on you", bg: "#00704A", fg: "#FFFFFF" },
  { id: "indigo", name: "Indigo", blurb: "Books and gifts", bg: "#1F2A44", fg: "#FFFFFF" },
  { id: "cineplex", name: "Cineplex", blurb: "Movie night", bg: "#0A2240", fg: "#FFD100" },
  { id: "ubereats", name: "Uber Eats", blurb: "Dinner delivered", bg: "#06C167", fg: "#000000" },
  { id: "sephora", name: "Sephora", blurb: "Beauty", bg: "#000000", fg: "#FFFFFF" },
  { id: "bestbuy", name: "Best Buy", blurb: "Tech and games", bg: "#0046BE", fg: "#FFE000" },
  { id: "apple", name: "Apple", blurb: "Apps, music, devices", bg: "#F5F5F7", fg: "#1D1D1F" },
];

export const getGiftBrand = (id: string) => GIFT_BRANDS.find((b) => b.id === id);
