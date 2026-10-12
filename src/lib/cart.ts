import { cookies } from "next/headers";
import { site } from "@/config/site";
import { newToken } from "./ids";

// The cart is just a browser cookie; the group cards in it are saved as drafts.
const COOKIE = "ks_cart";

export async function getCartId(): Promise<string | null> {
  return (await cookies()).get(COOKIE)?.value ?? null;
}

export async function ensureCartId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(COOKIE)?.value;
  if (existing) return existing;
  const id = newToken();
  jar.set(COOKIE, id, { httpOnly: true, sameSite: "lax", secure: site.url.startsWith("https://"), path: "/", maxAge: 60 * 86400 });
  return id;
}
