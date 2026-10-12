// Group card notes: plain data shared by the server and the browser.

export const PAPERS = [
  { id: "cream", name: "Cream", color: "#FFFDF6" },
  { id: "butter", name: "Butter", color: "#FFF4C2" },
  { id: "blush", name: "Blush", color: "#FFE3E3" },
  { id: "mint", name: "Mint", color: "#DDF5E6" },
  { id: "sky", name: "Sky", color: "#DDEEFF" },
  { id: "lilac", name: "Lilac", color: "#ECE3FF" },
  { id: "peach", name: "Peach", color: "#FFE6D1" },
] as const;
export const getPaper = (id: string) => PAPERS.find((p) => p.id === id) ?? PAPERS[0];

export type Media =
  | { kind: "photo"; src: string; w: number; h: number }
  | { kind: "gif" | "sticker"; src: string; w: number; h: number; id: string; title?: string };

export const noteLimits = {
  messageChars: 600,
  nameChars: 60,
  media: 4, // photos + GIFs per note
  photoBytes: 5 * 1024 * 1024,
  signaturesPerCard: 300,
  invitesPerCard: 200,
  adminsPerCard: 10,
};

/** Only GIPHY's own media hosts, so a note can't point an <img> anywhere else. */
export const isGiphyUrl = (v: unknown): v is string =>
  typeof v === "string" && v.length < 400 && /^https:\/\/(media\d*|i)\.giphy\.com\/[\w./?=&-]+$/.test(v);

export const isPhotoSrc = (v: unknown): v is string => typeof v === "string" && /^\/api\/media\/[\w-]+\.(jpg|png|webp|gif)$/.test(v);

/** http(s) links only, with the scheme added when someone types "example.com". */
export function cleanLink(v: unknown): string | null {
  if (typeof v !== "string" || !v.trim()) return null;
  let raw = v.trim();
  if (!/^https?:\/\//i.test(raw)) raw = `https://${raw}`;
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return null;
    if (!u.hostname.includes(".")) return null;
    return u.toString().slice(0, 500);
  } catch {
    return null;
  }
}

export const linkHost = (url: string) => {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
};

/** A steady tilt per note, so the board looks hand-pinned but never reshuffles. */
export function tiltFor(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) | 0;
  return ((Math.abs(h) % 7) - 3) * 0.6;
}
