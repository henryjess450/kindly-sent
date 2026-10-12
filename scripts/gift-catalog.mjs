// Lists gift cards you can sell in Canada, so you can copy their IDs into
// src/config/gifts.ts.
//   Tango Card (default):  TANGO_PLATFORM_NAME=... TANGO_PLATFORM_KEY=... node scripts/gift-catalog.mjs [search]
//   Tremendous:            GIFT_PROVIDER=tremendous TREMENDOUS_API_KEY=... node scripts/gift-catalog.mjs [search]
const q = (process.argv[2] ?? "").toLowerCase();

if ((process.env.GIFT_PROVIDER ?? "tango") === "tremendous") {
  const base = process.env.TREMENDOUS_ENV === "production" ? "https://api.tremendous.com/api/v2" : "https://testflight.tremendous.com/api/v2";
  const res = await fetch(`${base}/products?country=CA&currency=CAD`, { headers: { authorization: `Bearer ${process.env.TREMENDOUS_API_KEY}` } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  for (const p of (await res.json()).products.filter((p) => p.name.toLowerCase().includes(q))) console.log(`tremendousProductId: "${p.id}"  ${p.name}`);
} else {
  const base = process.env.TANGO_ENV === "production" ? "https://api.tangocard.com/raas/v2" : "https://integration-api.tangocard.com/raas/v2";
  const auth = Buffer.from(`${process.env.TANGO_PLATFORM_NAME}:${process.env.TANGO_PLATFORM_KEY}`).toString("base64");
  const res = await fetch(`${base}/catalogs?verbose=true`, { headers: { authorization: `Basic ${auth}`, accept: "application/json" } });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  for (const brand of (await res.json()).brands ?? []) {
    if (!brand.brandName.toLowerCase().includes(q)) continue;
    for (const item of brand.items ?? []) {
      if (item.currencyCode !== "CAD" && !(item.countries ?? []).includes("CA")) continue;
      const range = item.valueType === "VARIABLE_VALUE" ? `$${item.minValue} to $${item.maxValue}` : `$${item.faceValue}`;
      console.log(`tangoUtid: "${item.utid}"  ${brand.brandName} / ${item.rewardName}  ${item.currencyCode} ${range}`);
    }
  }
}
