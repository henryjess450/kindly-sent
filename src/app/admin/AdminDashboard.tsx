"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { getDesign, DESIGNS } from "@/lib/designs";
import { money } from "@/config/pricing";
import type { AdminItem, AdminStats } from "@/lib/admin";
import type { FreeCodeRow } from "@/lib/db";

const fmt = (ms: number, tz: string) => new Date(ms).toLocaleString("en-CA", { timeZone: tz, month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

const STATUS: Record<string, { cls: string; label: string }> = {
  scheduled: { cls: "scheduled", label: "Scheduled" },
  pending: { cls: "pending", label: "Confirming email" },
  unpaid: { cls: "pending", label: "Needs renewal" },
  sending: { cls: "sending", label: "Sending" },
  failed: { cls: "failed", label: "Failed" },
  collecting: { cls: "scheduled", label: "Collecting" },
  closed: { cls: "pending", label: "Signing closed" },
  sent: { cls: "sent", label: "Delivered" },
};

function Row({ x }: { x: AdminItem }) {
  const d = getDesign(x.design) ?? DESIGNS[0];
  const s = x.status === "sent" && x.opened ? { cls: "opened", label: "Opened" } : (STATUS[x.status] ?? { cls: "sending", label: x.status });
  return (
    <li className="ad-row">
      <a href={x.previewUrl} className="ad-thumb" aria-label="Preview"><CardArt design={d} /></a>
      <div className="ad-info">
        <div className="ad-top">
          <strong>{x.recipientName}</strong>
          <span className={`pill pill-${s.cls}`}>{s.label}</span>
          {x.type === "group" && <span className="pill pill-sending">Group · {x.signatures} signed</span>}
          {x.repeat && <span className="pill pill-sending">Yearly</span>}
          {x.free && <span className="pill pill-sent">Free</span>}
        </div>
        <span className="muted ad-sub">{x.recipientEmail} · from {x.from || "unknown"}</span>
        <span className="muted ad-sub">{fmt(x.at, x.timezone)} · {x.free || x.priceCents === 0 ? "free" : money(x.priceCents)}</span>
      </div>
      <div className="ad-actions">
        <a href={x.previewUrl} className="btn btn-ghost btn-small">View</a>
        {x.manageUrl && <Link href={x.manageUrl} className="btn btn-ghost btn-small">Manage</Link>}
      </div>
    </li>
  );
}

export function AdminDashboard({ stats, upcoming, sent, codes: initialCodes, siteUrl }: { stats: AdminStats; upcoming: AdminItem[]; sent: AdminItem[]; codes: FreeCodeRow[]; siteUrl: string }) {
  const [tab, setTab] = useState<"upcoming" | "sent">("upcoming");
  const [kind, setKind] = useState<"all" | "card" | "group">("all");
  const [q, setQ] = useState("");
  const [codes, setCodes] = useState(initialCodes);
  const [newKind, setNewKind] = useState<"card" | "group">("card");
  const [uses, setUses] = useState(1);
  const [label, setLabel] = useState("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");

  const list = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (tab === "upcoming" ? upcoming : sent).filter(
      (x) => (kind === "all" || x.type === kind) && (!needle || `${x.recipientName} ${x.recipientEmail} ${x.from}`.toLowerCase().includes(needle)),
    );
  }, [tab, kind, q, upcoming, sent]);

  async function makeCode() {
    setError("");
    const res = await fetch("/api/admin/codes", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: newKind, maxUses: uses, label }) });
    const json = await res.json();
    if (!res.ok) return setError(json.error ?? "That didn't work.");
    setCodes(json.codes);
    setLabel("");
    copy(`${siteUrl}/free/${json.codes[0].code}`);
  }
  async function toggle(c: FreeCodeRow) {
    const res = await fetch("/api/admin/codes", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ code: c.code, disabled: !c.disabled }) });
    if (res.ok) setCodes((await res.json()).codes);
  }
  async function copy(url: string) {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(""), 2000);
  }

  const tiles = [
    { n: stats.scheduled, l: "cards scheduled" },
    { n: stats.collecting, l: "group cards collecting" },
    { n: stats.sent, l: `delivered · ${stats.sentMonth} this month` },
    { n: money(stats.revenue), l: `earned · ${money(stats.revenueMonth)} this month` },
    { n: stats.signatures, l: "group notes written" },
    { n: stats.freeSent, l: "free cards given" },
    ...(stats.failed ? [{ n: stats.failed, l: "failed deliveries", bad: true }] : []),
  ];

  return (
    <div className="admin">
      <p className="eyebrow">Admin</p>
      <h1 className="display display-l">Every card.</h1>

      <div className="ad-tiles">
        {tiles.map((t, i) => (
          <motion.div key={t.l} className={`ad-tile${"bad" in t ? " bad" : ""}`} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <strong>{t.n}</strong>
            <span>{t.l}</span>
          </motion.div>
        ))}
      </div>

      <section className="panel ad-sec">
        <h2>Free links</h2>
        <p className="muted">Anyone with a free link can send a card, or start a group card everyone signs, without paying. Each link works the number of times you choose.</p>
        <div className="ad-make">
          <div className="segmented" role="radiogroup">
            {(["card", "group"] as const).map((k) => (
              <button key={k} role="radio" aria-checked={newKind === k} onClick={() => setNewKind(k)} style={{ background: newKind === k ? "#fff" : undefined, boxShadow: newKind === k ? "0 1px 3px rgba(0,0,0,.12)" : undefined }}>
                {k === "card" ? "Card" : "Group card"}
              </button>
            ))}
          </div>
          <label className="ad-uses">
            Uses
            <input className="input" type="number" min={1} max={1000} value={uses} onChange={(e) => setUses(Number(e.target.value))} />
          </label>
          <input className="input ad-label" placeholder="Label, e.g. Mom's birthday, giveaway winner" maxLength={80} value={label} onChange={(e) => setLabel(e.target.value)} />
          <button className="btn btn-brand" onClick={makeCode}>Make link</button>
        </div>
        {error && <p className="error">{error}</p>}
        {codes.length > 0 && (
          <ul className="ad-codes">
            {codes.map((c) => {
              const url = `${siteUrl}/free/${c.code}`;
              const left = c.max_uses - c.used;
              return (
                <li key={c.code} style={{ opacity: c.disabled ? 0.5 : 1 }}>
                  <div className="ad-code-info">
                    <strong>{c.label || (c.kind === "group" ? "Free group card" : "Free card")}</strong>
                    <span className="muted">{c.kind === "group" ? "Group card" : "Card"} · used {c.used} of {c.max_uses}{c.disabled ? " · switched off" : left <= 0 ? " · used up" : ""}</span>
                    <span className="ad-url">{url}</span>
                  </div>
                  <div className="ad-actions">
                    <button className="btn btn-primary btn-small" onClick={() => copy(url)}>{copied === url ? "Copied" : "Copy"}</button>
                    <button className="btn btn-ghost btn-small" onClick={() => toggle(c)}>{c.disabled ? "Turn on" : "Turn off"}</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div className="ad-bar">
        <div className="segmented" role="tablist">
          {(["upcoming", "sent"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} style={{ background: tab === t ? "#fff" : undefined, boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,.12)" : undefined }}>
              {t === "upcoming" ? `Soon to be sent (${upcoming.length})` : `Sent (${sent.length})`}
            </button>
          ))}
        </div>
        <div className="chips">
          {(["all", "card", "group"] as const).map((k) => (
            <button key={k} className="chip" aria-pressed={kind === k} onClick={() => setKind(k)}>{k === "all" ? "All" : k === "card" ? "Cards" : "Group cards"}</button>
          ))}
        </div>
        <input className="input ad-search" type="search" placeholder="Search names and emails" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <AnimatePresence mode="wait">
        <motion.ul key={tab + kind} className="ad-list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          {list.length === 0 ? <li className="empty">Nothing here{q ? " for that search" : " yet"}.</li> : list.map((x) => <Row key={x.type + x.id} x={x} />)}
        </motion.ul>
      </AnimatePresence>

      <style>{`
        .admin { display: grid; gap: 24px; }
        .admin > .display { margin-top: -12px; }
        .ad-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
        .ad-tile { background: var(--surface); border-radius: 18px; padding: 16px 18px; display: grid; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); }
        .ad-tile strong { font-family: var(--font-display); font-size: 28px; letter-spacing: -0.03em; }
        .ad-tile span { font-size: 13px; color: var(--ink-4); }
        .ad-tile.bad strong { color: #d70015; }
        .ad-sec { padding: 24px 26px; }
        .ad-sec h2 { font-family: var(--font-display); font-size: 22px; letter-spacing: -0.02em; margin: 0 0 6px; }
        .ad-sec > .muted { margin: 0 0 16px; font-size: 15px; }
        .ad-make { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .ad-make .segmented button { padding: 9px 16px; }
        .ad-uses { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--ink-3); }
        .ad-uses .input { width: 84px; }
        .ad-label { flex: 1; min-width: 200px; }
        .ad-codes { list-style: none; padding: 0; margin: 18px 0 0; display: grid; }
        .ad-codes li { display: flex; justify-content: space-between; align-items: center; gap: 14px; padding: 12px 0; border-top: 1px solid var(--line-soft); }
        .ad-code-info { display: grid; gap: 2px; min-width: 0; font-size: 14px; }
        .ad-url { font-size: 13px; color: var(--blue); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ad-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-top: 12px; }
        .ad-bar .segmented button { padding: 8px 16px; }
        .ad-search { flex: 1; min-width: 200px; }
        .ad-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 10px; }
        .ad-row { display: grid; grid-template-columns: 48px 1fr auto; gap: 16px; align-items: center; padding: 14px 16px; background: var(--surface); border-radius: 16px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); }
        .ad-thumb { width: 48px; aspect-ratio: 5/7; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.12); display: block; }
        .ad-thumb svg { width: 100%; height: 100%; display: block; }
        .ad-info { display: grid; gap: 2px; min-width: 0; }
        .ad-top { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; font-size: 17px; }
        .ad-sub { font-size: 14px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ad-actions { display: flex; gap: 6px; flex-shrink: 0; }
        .empty { padding: 28px; border: 1px dashed var(--line); border-radius: 18px; color: var(--ink-3); text-align: center; }
        @media (max-width: 640px) {
          .ad-row { grid-template-columns: 44px 1fr; }
          .ad-row .ad-actions { grid-column: 1 / -1; }
          .ad-codes li { flex-direction: column; align-items: stretch; }
          .ad-sec { padding: 20px 18px; }
        }
      `}</style>
    </div>
  );
}
