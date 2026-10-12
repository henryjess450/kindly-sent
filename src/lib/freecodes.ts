import { getDb, type FreeCodeRow } from "./db";
import { newToken } from "./ids";

// Free links from the site admin: /free/CODE lets someone send a card, or
// start a group card, without paying. Each link has a number of uses.

export function createCode(kind: "card" | "group", maxUses: number, label: string, by: string): FreeCodeRow {
  const code = newToken().slice(0, 12);
  getDb()
    .prepare("INSERT INTO free_codes (code, kind, label, max_uses, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .run(code, kind, label.slice(0, 80), Math.max(1, Math.min(1000, Math.floor(maxUses))), by, Date.now());
  return getCode(code)!;
}

export const getCode = (code: string) => getDb().prepare("SELECT * FROM free_codes WHERE code = ?").get(code) as FreeCodeRow | undefined;

export const listCodes = () => (getDb().prepare("SELECT * FROM free_codes ORDER BY created_at DESC LIMIT 200").all() as FreeCodeRow[]).map((r) => ({ ...r }));

/** A code that can still be used for this kind of card. */
export function usableCode(code: unknown, kind: "card" | "group"): FreeCodeRow | null {
  if (typeof code !== "string" || !code) return null;
  const c = getCode(code);
  return c && c.kind === kind && !c.disabled && c.used < c.max_uses ? c : null;
}

/** Uses one go of the code. False when someone else took the last one first. */
export function claimCode(code: string, kind: "card" | "group"): boolean {
  return getDb().prepare("UPDATE free_codes SET used = used + 1 WHERE code = ? AND kind = ? AND disabled = 0 AND used < max_uses").run(code, kind).changes === 1;
}

export const releaseCode = (code: string) => getDb().prepare("UPDATE free_codes SET used = MAX(0, used - 1) WHERE code = ?").run(code);
