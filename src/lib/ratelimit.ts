// A small in-memory limiter: fine for one server process.
const hits = new Map<string, number[]>();

/** True when `key` has used up `max` tries in the last `windowMs`. Records the try otherwise. */
export function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const list = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
  if (list.length >= max) {
    hits.set(key, list);
    return true;
  }
  list.push(now);
  hits.set(key, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => t > now - windowMs)) hits.delete(k);
  return false;
}

export const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
