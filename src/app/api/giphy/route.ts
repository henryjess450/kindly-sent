import { NextResponse } from "next/server";
import { clientIp, limited } from "@/lib/ratelimit";

// GIPHY search through the server, so the API key never reaches the browser.
// Free key: developers.giphy.com > Create an App > API. Put it in GIPHY_API_KEY.

type GiphyImage = { url: string; width: string; height: string };
type GiphyItem = { id: string; title: string; images: { fixed_width: GiphyImage; downsized?: GiphyImage; fixed_width_small?: GiphyImage } };

export async function GET(req: Request) {
  const key = process.env.GIPHY_API_KEY;
  if (!key) return NextResponse.json({ error: "GIFs aren't switched on yet.", items: [] }, { status: 503 });
  if (limited(`giphy:${clientIp(req)}`, 120, 60e3)) return NextResponse.json({ error: "Slow down a little.", items: [] }, { status: 429 });
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().slice(0, 60);
  const type = url.searchParams.get("type") === "stickers" ? "stickers" : "gifs";
  const offset = Math.min(Math.max(Number(url.searchParams.get("offset")) || 0, 0), 499);
  const api = new URL(`https://api.giphy.com/v1/${type}/${q ? "search" : "trending"}`);
  api.searchParams.set("api_key", key);
  api.searchParams.set("limit", "24");
  api.searchParams.set("offset", String(offset));
  api.searchParams.set("rating", "pg");
  if (q) {
    api.searchParams.set("q", q);
    api.searchParams.set("lang", "en");
  }
  const res = await fetch(api, { next: { revalidate: 300 } }).catch(() => null);
  if (!res?.ok) return NextResponse.json({ error: "GIPHY isn't answering right now.", items: [] }, { status: 502 });
  const json = (await res.json()) as { data: GiphyItem[]; pagination?: { total_count: number } };
  const items = json.data.map((g) => {
    const full = g.images.downsized ?? g.images.fixed_width;
    return {
      id: g.id,
      title: g.title,
      kind: type === "stickers" ? "sticker" : "gif",
      preview: g.images.fixed_width.url,
      pw: Number(g.images.fixed_width.width),
      ph: Number(g.images.fixed_width.height),
      src: full.url,
      w: Number(full.width),
      h: Number(full.height),
    };
  });
  return NextResponse.json({ items, more: (json.pagination?.total_count ?? 0) > offset + items.length });
}
