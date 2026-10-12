// Lists Tremendous gift card products available in CAD, so you can copy
// product IDs into src/config/gifts.ts.
//   TREMENDOUS_API_KEY=... node scripts/gift-catalog.mjs [search]
const key = process.env.TREMENDOUS_API_KEY;
if (!key) throw new Error("Set TREMENDOUS_API_KEY");
const base = process.env.TREMENDOUS_ENV === "production" ? "https://api.tremendous.com/api/v2" : "https://testflight.tremendous.com/api/v2";
const res = await fetch(`${base}/products?country=CA&currency=CAD`, { headers: { authorization: `Bearer ${key}` } });
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
const { products } = await res.json();
const q = (process.argv[2] ?? "").toLowerCase();
for (const p of products.filter((p) => p.name.toLowerCase().includes(q))) {
  console.log(`${p.id}  ${p.name}  [${p.category}]`);
}
