"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { getDesign, DESIGNS } from "@/lib/designs";
import type { PublicCard } from "@/lib/cards";
import { money } from "@/config/pricing";

function status(c: PublicCard) {
  if (c.status === "sent" && c.openedAt) return { cls: "opened", label: "Opened" };
  if (c.status === "sent") return { cls: "sent", label: "Delivered" };
  if (c.status === "pending") return { cls: "pending", label: "Confirm your email" };
  if (c.status === "unpaid") return { cls: "pending", label: "Needs your OK" };
  if (c.status === "failed") return { cls: "failed", label: "Couldn't deliver" };
  if (c.status === "sending") return { cls: "sending", label: "Sending" };
  return { cls: "scheduled", label: "Scheduled" };
}

function when(c: PublicCard) {
  const at = c.sentAt ?? c.sendAt;
  return new Date(at).toLocaleString("en-CA", { timeZone: c.timezone, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

function countdown(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return "any moment";
  const days = Math.floor(diff / 864e5);
  if (days >= 2) return `in ${days} days`;
  const hours = Math.floor(diff / 36e5);
  if (hours >= 1) return `in ${hours} hour${hours === 1 ? "" : "s"}`;
  return `in ${Math.max(1, Math.round(diff / 6e4))} min`;
}

export function CardList({ cards, email, name, notifyOpen, confirmed }: { cards: PublicCard[]; email: string; name: string; notifyOpen: boolean; confirmed?: string }) {
  const router = useRouter();
  const [list, setList] = useState(cards);
  const [notify, setNotify] = useState(notifyOpen);
  const upcoming = list.filter((c) => c.status !== "sent");
  const past = list.filter((c) => c.status === "sent").sort((a, b) => (b.sentAt ?? 0) - (a.sentAt ?? 0));
  const justConfirmed = list.find((c) => c.id === confirmed);

  const [notice, setNotice] = useState("");
  async function cancel(c: PublicCard) {
    const paid = c.status !== "unpaid" && c.priceCents > 0;
    if (!confirm(`Cancel this card? It won't be sent${paid ? " and you'll get a full refund" : ""}.`)) return;
    const res = await fetch(`/api/cards/${c.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) {
      setList((l) => l.filter((x) => x.id !== c.id));
      setNotice(json.error ?? (json.refunded ? `Cancelled. ${money(json.refunded)} is on its way back to your card.` : "Cancelled."));
    }
  }
  async function toggleNotify() {
    const v = !notify;
    setNotify(v);
    await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ notifyOpen: v }) });
  }
  async function signOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const row = (c: PublicCard, i: number) => {
    const d = getDesign(c.design) ?? DESIGNS[0];
    const s = status(c);
    const editable = ["pending", "unpaid", "scheduled", "failed"].includes(c.status);
    return (
      <motion.li key={c.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, transition: { duration: 0.3 } }} transition={{ duration: 0.5, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }} className="card-row">
        <Link href={`/c/${c.token}`} className="card-thumb" aria-label={`Preview card to ${c.recipientName}`}>
          <CardArt design={d} />
        </Link>
        <div className="card-info">
          <div className="card-to">
            <strong>{c.recipientName}</strong>
            <span className={`pill pill-${s.cls}`}>{s.label}</span>
            {c.repeat === "yearly" && <span className="pill pill-sending">Every year</span>}
          </div>
          <div className="muted" style={{ fontSize: 15 }}>
            {c.status === "sent" ? `Delivered ${when(c)}` : `${when(c)} · ${countdown(c.sendAt)}`}
          </div>
          <div className="card-msg">{c.message}</div>
        </div>
        <div className="card-actions">
          <Link href={`/c/${c.token}`} className="btn btn-ghost btn-small">Preview</Link>
          {c.status === "unpaid" ? (
            <Link href={`/send?edit=${c.id}`} className="btn btn-brand btn-small">Send it for {money(c.priceCents)}</Link>
          ) : (
            editable && <Link href={`/send?edit=${c.id}`} className="btn btn-ghost btn-small">Edit</Link>
          )}
          {editable && <button className="btn btn-ghost btn-small" onClick={() => cancel(c)}>{c.status === "unpaid" ? "Skip" : "Cancel"}</button>}
        </div>
      </motion.li>
    );
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 36 }}>
        <div>
          <h1 className="display display-l">Your cards</h1>
          <p className="muted" style={{ margin: "6px 0 0" }}>{name || email}</p>
        </div>
        <Link href="/send" className="btn btn-brand">Write a card</Link>
      </div>

      <AnimatePresence>
        {notice && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="panel" style={{ padding: "18px 22px", marginBottom: 28, borderLeft: "4px solid var(--blue)" }}>
            {notice}
          </motion.div>
        )}
        {justConfirmed && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="panel" style={{ padding: "18px 22px", marginBottom: 28, borderLeft: "4px solid var(--ok)" }}>
            <strong>Confirmed.</strong> Your card to {justConfirmed.recipientName} is {justConfirmed.status === "sent" ? "on its way" : "scheduled"}.
          </motion.div>
        )}
      </AnimatePresence>

      <h2 className="list-head">Upcoming</h2>
      {upcoming.length === 0 ? (
        <div className="empty">
          Nothing scheduled. Think of someone with a birthday coming up? <Link href="/send" className="link">Write them a card</Link>.
        </div>
      ) : (
        <ul className="card-list"><AnimatePresence>{upcoming.map(row)}</AnimatePresence></ul>
      )}

      {past.length > 0 && (
        <>
          <h2 className="list-head" style={{ marginTop: 56 }}>Delivered</h2>
          <ul className="card-list"><AnimatePresence>{past.map(row)}</AnimatePresence></ul>
        </>
      )}

      <h2 className="list-head" style={{ marginTop: 56 }}>Settings</h2>
      <div className="panel" style={{ padding: "6px 22px" }}>
        <div className="setting">
          <div>
            <strong>Tell me when a card is opened</strong>
            <div className="hint">One email the first time they open it.</div>
          </div>
          <button className="switch" role="switch" aria-checked={notify} aria-label="Opened notifications" onClick={toggleNotify} />
        </div>
        <div className="setting" style={{ borderBottom: 0 }}>
          <div>
            <strong>Signed in as {email}</strong>
          </div>
          <button className="btn btn-ghost btn-small" onClick={signOut}>Sign out</button>
        </div>
      </div>

      <style>{`
        .list-head { font-family: var(--font-display); font-size: 22px; letter-spacing: -0.02em; margin: 0 0 14px; }
        .card-list { list-style: none; padding: 0; margin: 0; display: grid; gap: 12px; }
        .card-row { display: grid; grid-template-columns: 64px 1fr auto; gap: 18px; align-items: center; padding: 16px 18px; background: var(--surface); border-radius: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); }
        .card-thumb { width: 64px; aspect-ratio: 5/7; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.12); transition: transform .4s var(--ease-out); display: block; }
        .card-thumb:hover { transform: rotate(-3deg) scale(1.05); }
        .card-thumb svg { width: 100%; height: 100%; display: block; }
        .card-info { min-width: 0; display: grid; gap: 3px; }
        .card-to { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: 18px; }
        .card-msg { font-size: 14px; color: var(--ink-4); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .card-actions { display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end; }
        @media (max-width: 640px) { .card-row { grid-template-columns: 52px 1fr; } .card-thumb { width: 52px; } .card-actions { grid-column: 1 / -1; } }
        .empty { padding: 28px; border: 1px dashed var(--line); border-radius: 18px; color: var(--ink-3); text-align: center; }
        .setting { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid var(--line-soft); }
      `}</style>
    </div>
  );
}
