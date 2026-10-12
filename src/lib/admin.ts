import { getDb, type CardRow, type GroupRow } from "./db";

// Everything the site admin page lists, cards and group cards side by side.

export type AdminItem = {
  type: "card" | "group";
  id: string;
  design: string;
  recipientName: string;
  recipientEmail: string;
  from: string;
  at: number;
  timezone: string;
  status: string;
  priceCents: number;
  free: boolean;
  opened: boolean;
  repeat: boolean;
  signatures: number | null;
  previewUrl: string;
  manageUrl: string | null;
};

const fromCard = (c: CardRow & { free_code: string | null }): AdminItem => ({
  type: "card",
  id: c.id,
  design: c.design,
  recipientName: c.recipient_name,
  recipientEmail: c.recipient_email,
  from: c.sender_email ?? c.pending_email ?? "",
  at: c.sent_at ?? c.send_at,
  timezone: c.timezone,
  status: c.status,
  priceCents: c.price_cents,
  free: !!c.free_code,
  opened: !!c.opened_at,
  repeat: c.repeat === "yearly",
  signatures: null,
  previewUrl: `/c/${c.token}`,
  manageUrl: null,
});

const fromGroup = (g: GroupRow & { free_code: string | null; n: number }): AdminItem => ({
  type: "group",
  id: g.id,
  design: g.design,
  recipientName: g.recipient_name,
  recipientEmail: g.recipient_email,
  from: g.owner_email ?? "",
  at: g.sent_at ?? g.deliver_at,
  timezone: g.timezone,
  status: g.status === "collecting" && Date.now() >= g.due_at ? "closed" : g.status,
  priceCents: g.price_cents,
  free: !!g.free_code,
  opened: !!g.opened_at,
  repeat: false,
  signatures: g.n,
  previewUrl: `/gc/${g.view_token}`,
  manageUrl: `/groups/${g.id}`,
});

const SIG_COUNT = "(SELECT COUNT(*) FROM signatures s WHERE s.group_id = g.id AND s.hidden = 0) AS n";

export function adminLists() {
  const db = getDb();
  const upcoming = [
    ...(db.prepare("SELECT * FROM cards WHERE status IN ('pending','unpaid','scheduled','sending','failed') ORDER BY send_at LIMIT 500").all() as never[]).map(fromCard),
    ...(db.prepare(`SELECT g.*, ${SIG_COUNT} FROM group_cards g WHERE status IN ('collecting','sending','failed') ORDER BY deliver_at LIMIT 500`).all() as never[]).map(fromGroup),
  ].sort((a, b) => a.at - b.at);
  const sent = [
    ...(db.prepare("SELECT * FROM cards WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 300").all() as never[]).map(fromCard),
    ...(db.prepare(`SELECT g.*, ${SIG_COUNT} FROM group_cards g WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 300`).all() as never[]).map(fromGroup),
  ].sort((a, b) => b.at - a.at);
  return { upcoming, sent };
}

export function adminStats() {
  const db = getDb();
  const n = (sql: string, ...args: (string | number)[]) => (db.prepare(sql).get(...args) as { n: number | null }).n ?? 0;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();
  return {
    scheduled: n("SELECT COUNT(*) AS n FROM cards WHERE status IN ('scheduled','sending')"),
    collecting: n("SELECT COUNT(*) AS n FROM group_cards WHERE status IN ('collecting','sending')"),
    sent: n("SELECT COUNT(*) AS n FROM cards WHERE status = 'sent'") + n("SELECT COUNT(*) AS n FROM group_cards WHERE status = 'sent'"),
    sentMonth: n("SELECT COUNT(*) AS n FROM cards WHERE status = 'sent' AND sent_at >= ?", monthStart) + n("SELECT COUNT(*) AS n FROM group_cards WHERE status = 'sent' AND sent_at >= ?", monthStart),
    failed: n("SELECT COUNT(*) AS n FROM cards WHERE status = 'failed'") + n("SELECT COUNT(*) AS n FROM group_cards WHERE status = 'failed'"),
    signatures: n("SELECT COUNT(*) AS n FROM signatures"),
    // Real money only: demo payments from development don't count.
    revenue: n("SELECT SUM(amount_cents - refunded_cents) AS n FROM payments WHERE provider = 'square'"),
    revenueMonth: n("SELECT SUM(amount_cents - refunded_cents) AS n FROM payments WHERE provider = 'square' AND created_at >= ?", monthStart),
    freeSent: n("SELECT COUNT(*) AS n FROM cards WHERE free_code IS NOT NULL AND status != 'canceled'") + n("SELECT COUNT(*) AS n FROM group_cards WHERE free_code IS NOT NULL AND status != 'canceled'"),
  };
}
export type AdminStats = ReturnType<typeof adminStats>;
