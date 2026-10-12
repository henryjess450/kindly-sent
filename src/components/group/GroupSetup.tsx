"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "../CardArt";
import { DESIGNS, ENVELOPES, OCCASIONS, envelopeColor, getDesign } from "@/lib/designs";
import { groupQuote, money, pricing } from "@/config/pricing";
import type { PublicGroup } from "@/lib/groups";

type Form = {
  design: string;
  envelope: string;
  headline: string;
  recipientName: string;
  recipientEmail: string;
  dueDate: string;
  dueTime: string;
  deliverDate: string;
  deliverTime: string;
  timezone: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number);
  return ymd(new Date(y, m - 1, d + n));
};
const today = () => ymd(new Date());

const HEADLINES: Record<string, string> = {
  Birthday: "Happy birthday",
  Love: "With love",
  "Thank you": "Thank you",
  Congratulations: "Congratulations",
  Holidays: "Happy holidays",
  "Just because": "Thinking of you",
  "New baby": "Welcome to the world",
  Wedding: "Congratulations",
  "Get well": "Get well soon",
  "Thinking of you": "Thinking of you",
};

/**
 * Set up a group card: the design, who it's for, and the two dates that
 * matter (signatures due, then delivery). Creates a cart draft, or saves
 * changes to an existing card.
 */
export function GroupSetup({ initial, groupId, cartCount = 0, onSaved, afterSave, initialDesign, freeCode, signedInEmail }: { initial?: PublicGroup; groupId?: string; cartCount?: number; onSaved?: (g: PublicGroup) => void; afterSave?: string; initialDesign?: string; freeCode?: string; signedInEmail?: string | null }) {
  const router = useRouter();
  const editing = !!groupId;
  const [f, setF] = useState<Form>(() => ({
    design: initial?.design ?? (initialDesign && getDesign(initialDesign) ? initialDesign : "balloons"),
    envelope: initial?.envelope ?? "match",
    headline: initial?.headline ?? "",
    recipientName: initial?.recipientName ?? "",
    recipientEmail: initial?.recipientEmail ?? "",
    dueDate: initial?.dueDate ?? addDays(today(), 6),
    dueTime: initial?.dueTime ?? "21:00",
    deliverDate: initial?.deliverDate ?? addDays(today(), 7),
    deliverTime: initial?.deliverTime ?? "09:00",
    timezone: initial?.timezone ?? "America/Vancouver",
  }));
  const [occasion, setOccasion] = useState("All");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState<{ name: string; count: number } | null>(null);
  const free = !!freeCode && !groupId;
  const [email, setEmail] = useState("");
  const [made, setMade] = useState<{ id: string; name: string; inviteUrl: string; signedIn: boolean; email: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setError("");
    setF((p) => ({ ...p, [k]: v }));
  };

  useEffect(() => {
    if (initial) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz) setF((p) => ({ ...p, timezone: tz }));
  }, [initial]);

  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [f.timezone];
    }
  }, [f.timezone]);

  const design = getDesign(f.design)!;
  const shown = DESIGNS.filter((d) => occasion === "All" || d.occasion === occasion);
  const placeholder = `${HEADLINES[design.occasion] ?? "For you"}${f.recipientName.trim() ? `, ${f.recipientName.trim()}` : ""}!`;

  function deliverIn(days: number) {
    const deliverDate = addDays(today(), days);
    setF((p) => ({ ...p, deliverDate, deliverTime: "09:00", dueDate: addDays(deliverDate, -1), dueTime: "21:00" }));
  }

  async function submit() {
    if (busy) return;
    if (!f.recipientName.trim()) return setError("Who is the card for?");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.recipientEmail.trim())) return setError("Check their email address.");
    if (free && !signedInEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Add your email so you can manage the card.");
    setBusy(true);
    setError("");
    try {
      const res = await fetch(editing ? `/api/groups/${groupId}` : "/api/groups", {
        method: editing ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(free ? { ...f, freeCode, email } : f),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      if (free) {
        setMade({ id: json.group.id, name: f.recipientName.trim(), inviteUrl: json.inviteUrl, signedIn: json.signedIn, email: json.email });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (editing) {
        onSaved?.(json.group);
        if (afterSave) router.push(afterSave);
      } else {
        setAdded({ name: f.recipientName.trim(), count: json.cartCount });
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  function another() {
    setAdded(null);
    setF((p) => ({ ...p, recipientName: "", recipientEmail: "", headline: "" }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (made) {
    return (
      <motion.div className="added" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
        <motion.div className="added-card" initial={{ rotate: -14, scale: 0.6, y: 40 }} animate={{ rotate: -5, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.1 }}>
          <CardArt design={design} />
        </motion.div>
        <h1 className="display display-m">{made.name}&apos;s card is ready to sign.</h1>
        <p className="lede" style={{ margin: "12px auto 24px", maxWidth: 560 }}>
          Send this link to everyone who should sign.{made.signedIn ? "" : ` We emailed ${made.email} a link to manage the card.`}
        </p>
        <div className="made-link">
          <span>{made.inviteUrl}</span>
          <button className="btn btn-primary btn-small" onClick={async () => { await navigator.clipboard.writeText(made.inviteUrl).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}>{copied ? "Copied" : "Copy link"}</button>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 22, flexWrap: "wrap" }}>
          <a href={made.inviteUrl} className="btn btn-ghost">Sign it yourself</a>
          {made.signedIn && <Link href={`/groups/${made.id}`} className="btn btn-brand">Manage the card</Link>}
        </div>
        <style>{`
          .added { text-align: center; padding: 64px 22px 96px; }
          .added-card { width: 150px; aspect-ratio: 5/7; margin: 0 auto 32px; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow-card); }
          .added-card svg { width: 100%; height: 100%; display: block; }
          .made-link { display: flex; gap: 8px; align-items: center; max-width: 560px; margin: 0 auto; background: var(--bg-alt); border-radius: 14px; padding: 6px 6px 6px 14px; }
          .made-link span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: var(--ink-3); text-align: left; }
        `}</style>
      </motion.div>
    );
  }

  if (added) {
    const q = groupQuote(added.count);
    return (
      <motion.div className="added" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 140, damping: 18 }}>
        <motion.div className="added-card" initial={{ rotate: -14, scale: 0.6, y: 40 }} animate={{ rotate: -5, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 160, damping: 13, delay: 0.1 }}>
          <CardArt design={design} />
        </motion.div>
        <h1 className="display display-m">{added.name}&apos;s card is in your cart.</h1>
        <p className="lede" style={{ margin: "12px auto 0", maxWidth: 520 }}>
          {q.bulk
            ? `You're getting the bulk price: ${added.count} cards at ${money(q.each)} each.`
            : `Add ${q.toBulk} more and every card drops to ${money(pricing.groupBulkCents)}.`}
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28, flexWrap: "wrap" }}>
          <button className="btn btn-ghost" onClick={another}>Set up another card</button>
          <Link href="/cart" className="btn btn-brand">Go to cart ({added.count})</Link>
        </div>
        <style>{`
          .added { text-align: center; padding: 64px 22px 96px; }
          .added-card { width: 150px; aspect-ratio: 5/7; margin: 0 auto 32px; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow-card); }
          .added-card svg { width: 100%; height: 100%; display: block; }
        `}</style>
      </motion.div>
    );
  }

  return (
    <div className="gsetup">
      {!editing && (
        <div className="gsetup-preview">
          <div className="gsetup-sticky">
            <AnimatePresence mode="wait">
              <motion.div key={f.design} className="gsetup-cover" initial={{ opacity: 0, scale: 0.92, rotate: -6 }} animate={{ opacity: 1, scale: 1, rotate: -3 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                <CardArt design={design} />
              </motion.div>
            </AnimatePresence>
            <div className="gsetup-stack" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span key={i} style={{ background: ["#FFF4C2", "#DDEEFF", "#FFE3E3"][i] }} animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.4, ease: "easeInOut" }} />
              ))}
            </div>
            <p className="gsetup-cap">{f.headline || placeholder}</p>
          </div>
        </div>
      )}

      <div className="gsetup-panel">
        {!editing && (
          <>
            <p className="eyebrow">{free ? "A free group card" : "Group card"}</p>
            <h1 className="display display-m">One card. Everyone signs.</h1>
            <p className="lede" style={{ fontSize: 19, margin: "10px 0 32px" }}>
              Share one link. Friends, family or the whole office add a message, a photo or a GIF. We deliver it on the day. {free ? "This one's free, courtesy of Kindly Sent." : `${money(pricing.groupCents)} a card, or ${money(pricing.groupBulkCents)} each when you get ${pricing.groupBulkMin} or more.`}
            </p>
          </>
        )}

        <div className="form-stack">
          <div className="field">
            <span className="label">Design</span>
            <div className="chips">
              {["All", ...OCCASIONS].map((o) => (
                <button key={o} className="chip" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>{o}</button>
              ))}
            </div>
            <div className="gsetup-designs">
              {shown.map((d) => (
                <button key={d.id} className="gsetup-design" aria-pressed={d.id === f.design} onClick={() => set("design", d.id)} title={d.name}>
                  <CardArt design={d} />
                </button>
              ))}
            </div>
          </div>

          <div className="two-col">
            <div className="field">
              <label htmlFor="g-rn">Who is it for?</label>
              <input id="g-rn" className="input" placeholder="Priya" maxLength={60} value={f.recipientName} onChange={(e) => set("recipientName", e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="g-re">Their email</label>
              <input id="g-re" className="input" type="email" inputMode="email" autoComplete="off" placeholder="priya@example.com" value={f.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="g-hl">Headline</label>
            <input id="g-hl" className="input" placeholder={placeholder} maxLength={80} value={f.headline} onChange={(e) => set("headline", e.target.value)} />
            <span className="hint">The big line at the top of the card. Leave it blank for &ldquo;For {f.recipientName.trim() || "them"}&rdquo;.</span>
          </div>

          <div className="field">
            <span className="label">Delivered</span>
            <div className="chips">
              {[3, 7, 14].map((n) => (
                <button key={n} className="chip" aria-pressed={f.deliverDate === addDays(today(), n)} onClick={() => deliverIn(n)}>
                  {n === 7 ? "In a week" : n === 14 ? "In two weeks" : `In ${n} days`}
                </button>
              ))}
            </div>
            <div className="two-col" style={{ marginTop: 6 }}>
              <input aria-label="Delivery date" className="input" type="date" min={today()} value={f.deliverDate} onChange={(e) => set("deliverDate", e.target.value)} />
              <input aria-label="Delivery time" className="input" type="time" step={300} value={f.deliverTime} onChange={(e) => set("deliverTime", e.target.value)} />
            </div>
          </div>

          <div className="field">
            <span className="label">Signatures due</span>
            <div className="two-col">
              <input aria-label="Signatures due date" className="input" type="date" value={f.dueDate} max={f.deliverDate} onChange={(e) => set("dueDate", e.target.value)} />
              <input aria-label="Signatures due time" className="input" type="time" step={300} value={f.dueTime} onChange={(e) => set("dueTime", e.target.value)} />
            </div>
            <span className="hint">Invite links stop taking messages after this. Signers get a reminder the day before.</span>
          </div>

          <div className="field">
            <label htmlFor="g-tz">Time zone</label>
            <select id="g-tz" className="select" value={f.timezone} onChange={(e) => set("timezone", e.target.value)}>
              {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
            </select>
          </div>

          <div className="field">
            <span className="label">Envelope</span>
            <div className="swatches">
              {ENVELOPES.map((e) => (
                <button key={e.id} className="swatch" aria-pressed={f.envelope === e.id} aria-label={e.name} title={e.name} onClick={() => set("envelope", e.id)} style={{ background: e.color || design.envelope }} />
              ))}
            </div>
            <span className="hint">{ENVELOPES.find((e) => e.id === f.envelope)?.name}. It&apos;s what {f.recipientName.trim() || "they"} tap to open.</span>
          </div>

          {free && !signedInEmail && (
            <div className="field">
              <label htmlFor="g-me">Your email</label>
              <input id="g-me" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => { setError(""); setEmail(e.target.value); }} />
              <span className="hint">You&apos;ll be the card&apos;s admin. We send you the invite link and a way to manage it.</span>
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p className="error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="gsetup-actions">
          {!editing && !free && cartCount > 0 ? <Link href="/cart" className="btn btn-ghost">Cart ({cartCount})</Link> : <span />}
          <button className="btn btn-brand" onClick={submit} disabled={busy}>
            {busy ? "Saving..." : free ? "Create the card, free" : editing ? "Save changes" : `Add to cart · ${money(groupQuote(cartCount + 1).bulk ? pricing.groupBulkCents : pricing.groupCents)}`}
          </button>
        </div>
      </div>

      <style>{`
        .gsetup { display: grid; grid-template-columns: ${editing ? "1fr" : "1fr 1fr"}; min-height: calc(100vh - 52px); }
        .gsetup-preview { background: var(--bg-alt); }
        .gsetup-sticky { position: sticky; top: 52px; height: calc(100vh - 52px); display: grid; place-items: center; align-content: center; gap: 28px; }
        .gsetup-cover { width: min(260px, 40vw); aspect-ratio: 5/7; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow-card); position: relative; z-index: 2; }
        .gsetup-cover svg { width: 100%; height: 100%; display: block; }
        .gsetup-stack { display: flex; gap: 10px; margin-top: -70px; z-index: 3; }
        .gsetup-stack span { width: 54px; height: 44px; border-radius: 4px; box-shadow: 0 6px 16px rgba(0,0,0,.12); display: block; }
        .gsetup-stack span:nth-child(1) { rotate: -8deg; } .gsetup-stack span:nth-child(3) { rotate: 7deg; }
        .gsetup-cap { font-family: var(--font-hand); font-size: 30px; margin: 0; text-align: center; padding: 0 22px; }
        .gsetup-panel { padding: ${editing ? "0" : "48px clamp(22px, 5vw, 72px) 64px"}; max-width: 660px; width: 100%; }
        .gsetup-designs { display: grid; grid-template-columns: repeat(auto-fill, minmax(62px, 1fr)); gap: 10px; margin-top: 8px; }
        .gsetup-design { border: 0; padding: 0; background: none; aspect-ratio: 5/7; border-radius: 4px; overflow: hidden; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,.1), 0 4px 10px rgba(0,0,0,.08); outline: 3px solid transparent; outline-offset: 2px; transition: transform .3s var(--ease-out); }
        .gsetup-design:hover { transform: translateY(-3px); }
        .gsetup-design[aria-pressed="true"] { outline-color: var(--ink); }
        .gsetup-design svg { width: 100%; height: 100%; display: block; }
        .form-stack { display: grid; gap: 22px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .chips { display: flex; gap: 8px; flex-wrap: wrap; }
        .swatches { display: flex; gap: 10px; flex-wrap: wrap; }
        .swatch { width: 36px; height: 36px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); transition: transform .25s var(--ease-out); }
        .swatch:hover { transform: scale(1.08); }
        .swatch[aria-pressed="true"] { box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 0 0 3px var(--bg), 0 0 0 5px var(--ink); }
        .gsetup-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 32px; }
        @media (max-width: 979px) {
          .gsetup { grid-template-columns: 1fr; }
          .gsetup-sticky { position: relative; top: 0; height: auto; padding: 36px 0 26px; }
          .gsetup-cover { width: 150px; }
          .gsetup-cap { font-size: 24px; }
          .gsetup-panel { margin: 0 auto; ${editing ? "" : "padding-top: 28px;"} }
        }
        @media (max-width: 480px) { .two-col { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
