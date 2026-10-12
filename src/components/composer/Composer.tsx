"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card3D } from "../Card3D";
import { CardArt } from "../CardArt";
import { Envelope } from "../Envelope";
import { GiftTile } from "../GiftTile";
import { SendOff } from "./SendOff";
import { PayForm, type PayHandle } from "./PayForm";
import { DESIGNS, ENVELOPES, FONTS, INKS, LINERS, OCCASIONS, envelopeColor, getDesign } from "@/lib/designs";
import { useViewport } from "@/lib/useViewport";
import { money, pricing, quote } from "@/config/pricing";
import type { GiftBrand } from "@/config/gifts";
import type { PublicCard } from "@/lib/cards";
import type { ClientPayConfig } from "@/lib/payments";

type Draft = {
  design: string;
  font: string;
  ink: string;
  envelope: string;
  liner: string;
  message: string;
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  date: string;
  time: string;
  timezone: string;
  repeat: "none" | "yearly";
  sendNow: boolean;
  email: string;
  gift: { brand: string; amountCents: number } | null;
};

type StepId = "card" | "message" | "envelope" | "gift" | "delivery" | "pay";
const LABELS: Record<StepId, string> = { card: "Card", message: "Message", envelope: "Envelope", gift: "Gift", delivery: "Delivery", pay: "Pay" };
const MAX = 1200;
const DRAFT_KEY = "ks-draft-v2";

const pad = (n: number) => String(n).padStart(2, "0");
const ymd = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
function addDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return ymd(d);
}
function nextWeekday(day: number) {
  const d = new Date();
  d.setDate(d.getDate() + (((day - d.getDay() + 7) % 7) || 7));
  return ymd(d);
}
function whenLabel(d: Draft) {
  if (d.sendNow) return "Right away";
  if (!d.date || !d.time) return "Pick a date";
  const [y, m, day] = d.date.split("-").map(Number);
  const [hh, mm] = d.time.split(":").map(Number);
  return new Date(y, m - 1, day, hh, mm).toLocaleString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}
const sealLetter = (name: string) => (name.trim().replace(/^(love|from|xo)[,\s]+/i, "")[0] ?? "K").toUpperCase();

const slide = {
  initial: (dir: number) => ({ opacity: 0, x: dir * 40 }),
  animate: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -40 }),
};

export function Composer({
  signedInEmail,
  defaultName,
  initialDesign,
  editCard,
  brands,
  pay,
}: {
  signedInEmail: string | null;
  defaultName: string;
  initialDesign?: string;
  editCard?: PublicCard;
  brands: GiftBrand[];
  pay: ClientPayConfig;
}) {
  const vp = useViewport();
  const needsPay = !editCard || editCard.status === "unpaid";
  const steps = useMemo<StepId[]>(
    () => (editCard ? ["card", "message", "envelope", "delivery", "pay"] : ["card", "message", "envelope", ...(brands.length ? ["gift" as const] : []), "delivery", "pay"]),
    [editCard, brands.length],
  );
  const [i, setI] = useState(editCard || initialDesign ? 1 : 0);
  const step = steps[i];
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: "pending" | "scheduled"; card: PublicCard } | null>(null);
  const [peek, setPeek] = useState<boolean | null>(null);
  const [occasion, setOccasion] = useState<string>("All");
  const payRef = useRef<PayHandle>(null);
  const [d, setD] = useState<Draft>(() => ({
    design: editCard?.design ?? (initialDesign && getDesign(initialDesign) ? initialDesign : "balloons"),
    font: editCard?.font ?? "hand",
    ink: editCard?.ink ?? "black",
    envelope: editCard?.envelope ?? "match",
    liner: editCard?.liner ?? "dots",
    message: editCard?.message ?? "",
    recipientName: editCard?.recipientName ?? "",
    recipientEmail: editCard?.recipientEmail ?? "",
    senderName: editCard?.senderName ?? defaultName,
    date: editCard?.date ?? addDays(1),
    time: editCard?.time ?? "09:00",
    timezone: editCard?.timezone ?? "America/Vancouver",
    repeat: editCard?.repeat ?? "none",
    sendNow: false,
    email: "",
    gift: null,
  }));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setError("");
    setD((p) => ({ ...p, [k]: v }));
  };

  // Restore a half-written card, and only start saving after that, so the
  // empty starting draft never overwrites the saved one.
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    if (editCard) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let saved: Partial<Draft> = {};
    try {
      saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}");
    } catch {}
    setD((p) => ({ ...p, timezone: tz || p.timezone, ...saved, ...(initialDesign && getDesign(initialDesign) ? { design: initialDesign } : {}) }));
    setRestored(true);
  }, [editCard, initialDesign]);
  useEffect(() => {
    if (editCard || result || !restored) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, sendNow: false }));
    } catch {}
  }, [d, editCard, result, restored]);

  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [d.timezone];
    }
  }, [d.timezone]);

  const design = getDesign(d.design)!;
  const envColor = envelopeColor(design, d.envelope);
  const brand = d.gift ? brands.find((b) => b.id === d.gift!.brand) : undefined;
  const q = quote(editCard ? 0 : d.gift?.amountCents ?? 0);
  const book = vp.w >= 980;
  const previewW = book ? Math.min(250, (vp.w / 2 - 120) / 2, (vp.h - 220) / 1.4) : Math.min(230, vp.w * 0.55, (vp.h * 0.42) / 1.4);
  const open = peek ?? (step === "message" || step === "gift");
  const showEnvelope = step === "envelope" || step === "delivery" || step === "pay";

  function validate(s: StepId): string {
    if (s === "message") {
      if (!d.recipientName.trim()) return "Who is the card for?";
      if (!d.message.trim()) return "Write a message inside the card.";
      if (!d.senderName.trim()) return "Add your name so they know who it's from.";
    }
    if (s === "delivery") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.recipientEmail.trim())) return "Check their email address.";
      if (!d.sendNow && (!d.date || !d.time)) return "Pick a delivery date and time.";
    }
    if (s === "gift" && d.gift && (d.gift.amountCents < pricing.gift.minCents || d.gift.amountCents > pricing.gift.maxCents))
      return `Gift amounts are ${money(pricing.gift.minCents)} to ${money(pricing.gift.maxCents)}.`;
    return "";
  }

  function go(to: number) {
    if (to > i) {
      for (let s = i; s < to; s++) {
        const e = validate(steps[s]);
        if (e) return setError(e);
      }
    }
    setError("");
    setPeek(null);
    setDir(to > i ? 1 : -1);
    setI(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(walletToken?: string) {
    if (busy) return;
    if (!signedInEmail && !editCard && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email.trim())) return setError("Add your email for the receipt.");
    setBusy(true);
    setError("");
    try {
      const paymentToken = needsPay ? (walletToken ?? (await payRef.current!.tokenize())) : undefined;
      const res = await fetch(editCard ? `/api/cards/${editCard.id}` : "/api/cards", {
        method: editCard ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...d, paymentToken }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again.");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setResult(json);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (result) return <SendOff design={design} envelope={envColor} liner={d.liner} content={d} result={result} edited={!!editCard && editCard.status !== "unpaid"} brand={brand} />;

  const shown = DESIGNS.filter((x) => occasion === "All" || x.occasion === occasion);

  return (
    <div className="composer">
      <div className="composer-preview">
        <div className="preview-sticky">
          <AnimatePresence mode="wait">
            {showEnvelope ? (
              <motion.div key="env" initial={{ opacity: 0, y: 30, scale: 0.94 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ type: "spring", stiffness: 160, damping: 20 }}>
                <Envelope
                  design={design}
                  width={Math.min(previewW * 1.15, vp.w * 0.58)}
                  color={envColor}
                  liner={d.liner}
                  flapOpen={step === "envelope"}
                  seal={step !== "envelope"}
                  sealLetter={sealLetter(d.senderName)}
                  label={step !== "envelope" ? d.recipientName : undefined}
                >
                  <div className="ks-env-card" style={{ transform: "translate(-50%, -50%)" }}>
                    <div style={{ width: Math.min(previewW * 1.15, vp.w * 0.58) * 0.9, aspectRatio: "5 / 7", rotate: "-90deg", translate: `0 ${step === "envelope" ? "-38%" : "2%"}`, transition: "translate .8s var(--ease-in-out)", borderRadius: 4, overflow: "hidden" }}>
                      <CardArt design={design} />
                    </div>
                  </div>
                </Envelope>
              </motion.div>
            ) : (
              <motion.div key={`card-${d.design}`} initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} style={{ position: "relative" }}>
                <Card3D design={design} content={d} open={open} mode={book ? "book" : "flip"} width={previewW} />
                <AnimatePresence>
                  {step === "gift" && brand && d.gift && (
                    <motion.div
                      key={brand.id + d.gift.amountCents}
                      initial={{ y: 80, opacity: 0, rotate: 4 }}
                      animate={{ y: 0, opacity: 1, rotate: -5 }}
                      exit={{ y: 60, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 220, damping: 18 }}
                      style={{ position: "absolute", right: book ? -previewW * 0.75 : -previewW * 0.1, bottom: -previewW * 0.18, zIndex: 5 }}
                    >
                      <GiftTile brand={brand} amountCents={d.gift.amountCents} width={previewW * 0.82} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
          {!showEnvelope && (
            <button className="btn btn-ghost btn-small" style={{ marginTop: 30, visibility: vp.ready ? "visible" : "hidden" }} onClick={() => setPeek(!open)}>
              {open ? "Close the card" : "Look inside"}
            </button>
          )}
        </div>
      </div>

      <div className="composer-panel">
        <ol className="stepper" aria-label="Steps">
          {steps.map((s, n) => (
            <li key={s}>
              <button onClick={() => go(n)} aria-current={n === i ? "step" : undefined} className={n < i ? "done" : ""} aria-label={LABELS[s]} title={LABELS[s]}>
                <span className="dot">{n < i ? "✓" : n + 1}</span>
                <motion.span className="step-label" initial={false} animate={{ width: n === i ? "auto" : 0, opacity: n === i ? 1 : 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
                  {LABELS[s]}
                </motion.span>
              </button>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}>
            {step === "card" && (
              <div>
                <h1 className="display display-m">Choose a card.</h1>
                <p className="lede" style={{ fontSize: 19, margin: "10px 0 20px" }}>{DESIGNS.length} designs, all drawn by hand, and every one of them moves.</p>
                <div className="chips">
                  {["All", ...OCCASIONS].map((o) => (
                    <button key={o} className="chip" aria-pressed={occasion === o} onClick={() => setOccasion(o)}>{o}</button>
                  ))}
                </div>
                <motion.div layout className="design-grid">
                  <AnimatePresence mode="popLayout">
                    {shown.map((x) => (
                      <motion.button layout key={x.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="design-tile" aria-pressed={x.id === d.design} onClick={() => set("design", x.id)}>
                        <div className="design-thumb"><CardArt design={x} /></div>
                        <strong>{x.name}</strong>
                        <span>{x.occasion}</span>
                      </motion.button>
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            )}

            {step === "message" && (
              <div className="form-stack">
                <h1 className="display display-m">Write your message.</h1>
                <div className="field">
                  <label htmlFor="rn">Who is it for?</label>
                  <input id="rn" className="input" placeholder="Mom" value={d.recipientName} maxLength={60} onChange={(e) => set("recipientName", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="msg">Message</label>
                  <textarea
                    id="msg"
                    className="textarea"
                    placeholder="Happy birthday! I hope this year is full of..."
                    value={d.message}
                    maxLength={MAX}
                    onChange={(e) => set("message", e.target.value)}
                    style={{ fontFamily: FONTS.find((f) => f.id === d.font)?.css, fontSize: d.font === "hand" ? 24 : 18, color: INKS.find((k) => k.id === d.ink)?.color }}
                  />
                  <span className="hint" style={{ textAlign: "right" }}>{MAX - d.message.length} characters left</span>
                </div>
                <div className="field">
                  <span className="label">Writing</span>
                  <div className="font-row">
                    {FONTS.map((f) => (
                      <button key={f.id} className="font-chip" aria-pressed={d.font === f.id} onClick={() => set("font", f.id)} style={{ fontFamily: f.css }}>
                        <span style={{ fontSize: f.id === "hand" ? 24 : 18 }}>Aa</span>
                        <small>{f.name}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="label">Ink</span>
                  <div className="swatches">
                    {INKS.map((k) => (
                      <button key={k.id} className="swatch" aria-pressed={d.ink === k.id} aria-label={k.name} title={k.name} onClick={() => set("ink", k.id)} style={{ background: k.color }} />
                    ))}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="sn">Sign it</label>
                  <input id="sn" className="input" placeholder="Love, Sam" value={d.senderName} maxLength={60} onChange={(e) => set("senderName", e.target.value)} />
                </div>
              </div>
            )}

            {step === "envelope" && (
              <div className="form-stack">
                <h1 className="display display-m">Pick the envelope.</h1>
                <p className="lede" style={{ fontSize: 19, margin: 0 }}>It&apos;s the first thing they see. They tap the seal to open it.</p>
                <div className="field">
                  <span className="label">Colour</span>
                  <div className="swatches">
                    {ENVELOPES.map((e) => {
                      const c = e.color || design.envelope;
                      return (
                        <button key={e.id} className="swatch big" aria-pressed={d.envelope === e.id} aria-label={e.name} title={e.name} onClick={() => set("envelope", e.id)} style={{ background: c }}>
                          {e.id === "match" && <span style={{ fontSize: 10, fontWeight: 700, color: "#0008" }}>MATCH</span>}
                        </button>
                      );
                    })}
                  </div>
                  <span className="hint">{ENVELOPES.find((e) => e.id === d.envelope)?.name}</span>
                </div>
                <div className="field">
                  <span className="label">Liner</span>
                  <div className="liner-row">
                    {LINERS.map((l) => (
                      <button key={l.id} className="liner-chip" aria-pressed={d.liner === l.id} onClick={() => set("liner", l.id)}>
                        <svg viewBox="0 0 48 32" width="48" height="32" aria-hidden>
                          <defs>
                            <pattern id={`lp-${l.id}`} width={12} height={12} patternUnits="userSpaceOnUse">
                              <rect width={12} height={12} fill={l.id === "plain" ? "#e8e8ed" : "#fff"} />
                              {l.id === "dots" && <circle cx={6} cy={6} r={1.6} fill={design.accent} />}
                              {l.id === "stripes" && <rect width={6} height={12} fill={design.accent} opacity={0.55} transform="rotate(35 6 6)" />}
                              {l.id === "confetti" && <><rect x={1} y={2} width={3} height={1.4} fill={design.accent} /><circle cx={9} cy={8} r={1} fill="#4AA3FF" /></>}
                              {l.id === "hearts" && <path d="M6 8.4 C 3 6.4, 3 3.6, 4.8 3.4 C 5.6 3.3, 6 4, 6 4.6 C 6 4, 6.4 3.3, 7.2 3.4 C 9 3.6, 9 6.4, 6 8.4 Z" fill={design.accent} />}
                            </pattern>
                          </defs>
                          <rect width={48} height={32} rx={5} fill={`url(#lp-${l.id})`} />
                        </svg>
                        <small>{l.name}</small>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === "gift" && (
              <div className="form-stack">
                <h1 className="display display-m">Tuck in a gift?</h1>
                <p className="lede" style={{ fontSize: 19, margin: 0 }}>A digital gift card slides out when they open the card. It&apos;s bought the moment the card arrives, so cancelling is always a full refund.</p>
                <div className="brand-grid">
                  <button className="brand-tile none" aria-pressed={!d.gift} onClick={() => set("gift", null)}>
                    <strong>No gift</strong>
                    <span>Just the card</span>
                  </button>
                  {brands.map((b) => (
                    <button
                      key={b.id}
                      className="brand-tile"
                      aria-pressed={d.gift?.brand === b.id}
                      onClick={() => set("gift", { brand: b.id, amountCents: d.gift?.amountCents ?? pricing.gift.presetsCents[1] })}
                      style={{ background: b.bg, color: b.fg }}
                    >
                      <strong>{b.name}</strong>
                      <span>{b.blurb}</span>
                    </button>
                  ))}
                </div>
                <AnimatePresence initial={false}>
                  {d.gift && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                      <div className="field" style={{ paddingTop: 4 }}>
                        <span className="label">Amount</span>
                        <div className="chips">
                          {pricing.gift.presetsCents.map((c) => (
                            <button key={c} className="chip" aria-pressed={d.gift?.amountCents === c} onClick={() => set("gift", { ...d.gift!, amountCents: c })}>{money(c)}</button>
                          ))}
                          <div className="amount-input">
                            <span>$</span>
                            <input
                              inputMode="numeric"
                              aria-label="Custom amount"
                              placeholder="Other"
                              value={pricing.gift.presetsCents.includes(d.gift.amountCents) ? "" : String(d.gift.amountCents / 100)}
                              onChange={(e) => {
                                const v = parseInt(e.target.value.replace(/\D/g, "") || "0", 10);
                                set("gift", { ...d.gift!, amountCents: Math.min(v, pricing.gift.maxCents / 100) * 100 });
                              }}
                            />
                          </div>
                        </div>
                        <span className="hint">{money(pricing.gift.minCents)} to {money(pricing.gift.maxCents)}, whole dollars.</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === "delivery" && (
              <div className="form-stack">
                <h1 className="display display-m">When should it arrive?</h1>
                <div className="field">
                  <label htmlFor="re">{d.recipientName.trim() ? `${d.recipientName.trim()}'s` : "Their"} email</label>
                  <input id="re" className="input" type="email" inputMode="email" autoComplete="off" placeholder="name@example.com" value={d.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} />
                </div>
                <Segmented value={d.sendNow ? "now" : "later"} options={[{ value: "later", label: "Schedule it" }, { value: "now", label: "Send right away" }]} onChange={(v) => set("sendNow", v === "now")} />
                <AnimatePresence initial={false}>
                  {!d.sendNow && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
                      <div className="form-stack" style={{ paddingTop: 4 }}>
                        <div className="chips">
                          {[
                            { label: "Tomorrow, 9 AM", date: addDays(1), time: "09:00" },
                            { label: "Friday evening", date: nextWeekday(5), time: "18:00" },
                            { label: "In one week", date: addDays(7), time: "09:00" },
                          ].map((x) => (
                            <button key={x.label} className="chip" aria-pressed={d.date === x.date && d.time === x.time} onClick={() => setD((p) => ({ ...p, date: x.date, time: x.time }))}>{x.label}</button>
                          ))}
                        </div>
                        <div className="two-col">
                          <div className="field">
                            <label htmlFor="dt">Date</label>
                            <input id="dt" className="input" type="date" min={ymd(new Date())} value={d.date} onChange={(e) => set("date", e.target.value)} />
                          </div>
                          <div className="field">
                            <label htmlFor="tm">Time</label>
                            <input id="tm" className="input" type="time" step={300} value={d.time} onChange={(e) => set("time", e.target.value)} />
                          </div>
                        </div>
                        <div className="field">
                          <label htmlFor="tz">Time zone</label>
                          <select id="tz" className="select" value={d.timezone} onChange={(e) => set("timezone", e.target.value)}>
                            {zones.map((z) => <option key={z} value={z}>{z.replace(/_/g, " ")}</option>)}
                          </select>
                          <span className="hint">Use their time zone if they live somewhere else.</span>
                        </div>
                        <div className="toggle-row">
                          <div>
                            <strong>Send every year</strong>
                            <div className="hint">We&apos;ll have next year&apos;s ready and ask you to confirm it for {money(pricing.cardCents)} a week before.</div>
                          </div>
                          <button className="switch" role="switch" aria-checked={d.repeat === "yearly"} aria-label="Send every year" onClick={() => set("repeat", d.repeat === "yearly" ? "none" : "yearly")} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === "pay" && (
              <div className="form-stack">
                <h1 className="display display-m">{needsPay ? "Seal it." : "Save your changes."}</h1>
                <dl className="summary">
                  <div><dt>Card</dt><dd>{design.name} <button className="link-btn" onClick={() => go(0)}>Change</button></dd></div>
                  <div><dt>To</dt><dd>{d.recipientName} · {d.recipientEmail}</dd></div>
                  <div><dt>Arrives</dt><dd>{whenLabel(d)}{!d.sendNow && <span className="muted"> ({d.timezone.replace(/_/g, " ")})</span>}{d.repeat === "yearly" && !d.sendNow ? ", every year" : ""}</dd></div>
                  <div><dt>From</dt><dd>{d.senderName}</dd></div>
                </dl>
                {needsPay && (
                  <>
                    <table className="price">
                      <tbody>
                        <tr><td>Card, sealed and delivered</td><td>{money(q.card)}</td></tr>
                        {q.cardTax > 0 && <tr><td>Tax</td><td>{money(q.cardTax)}</td></tr>}
                        {brand && <tr><td>{brand.name} gift card</td><td>{money(q.gift)}</td></tr>}
                        {q.giftFee > 0 && <tr><td>Gift service fee</td><td>{money(q.giftFee)}</td></tr>}
                        <tr className="total"><td>Total</td><td>{money(q.total)}</td></tr>
                      </tbody>
                    </table>
                    {!signedInEmail && (
                      <div className="field">
                        <label htmlFor="em">Your email</label>
                        <input id="em" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={d.email} onChange={(e) => set("email", e.target.value)} />
                        <span className="hint">For your receipt and a link to manage your cards. No password needed.</span>
                      </div>
                    )}
                    <PayForm ref={payRef} config={pay} totalCents={q.total} onWalletToken={(t) => submit(t)} disabled={busy} />
                    <p className="hint" style={{ margin: 0 }}>Cancel any time before it goes out for a full refund.</p>
                  </>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.p className="error" role="alert" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0, x: [0, -6, 6, -4, 4, 0] }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="composer-actions">
          {i > 0 ? <button className="btn btn-ghost" onClick={() => go(i - 1)}>Back</button> : <Link href="/" className="btn btn-ghost">Cancel</Link>}
          {step !== "pay" ? (
            <button className="btn btn-primary" onClick={() => go(i + 1)}>Continue</button>
          ) : (
            <button className="btn btn-brand" onClick={() => submit()} disabled={busy}>
              {busy ? "Sealing..." : needsPay ? `Pay ${money(q.total)} and ${d.sendNow ? "send" : "schedule"}` : "Save changes"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .composer { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 52px); }
        .composer-preview { background: var(--bg-alt); }
        .preview-sticky { position: sticky; top: 52px; height: calc(100vh - 52px); display: grid; place-items: center; align-content: center; justify-items: center; }
        .composer-panel { padding: 48px clamp(22px, 5vw, 72px) 64px; max-width: 660px; width: 100%; }
        @media (max-width: 979px) {
          .composer { grid-template-columns: 1fr; }
          .preview-sticky { position: relative; top: 0; height: auto; min-height: 360px; padding: 32px 0 22px; }
          .composer-panel { padding-top: 28px; margin: 0 auto; }
        }
        .stepper { list-style: none; padding: 0; margin: 0 0 32px; display: flex; gap: 4px; flex-wrap: wrap; }
        .stepper .step-label { overflow: hidden; white-space: nowrap; display: inline-block; }
        .stepper button { border: 0; background: none; display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 600; color: var(--ink-4); cursor: pointer; padding: 6px 10px 6px 6px; border-radius: 980px; transition: background .2s, color .2s; }
        .stepper button:hover { background: rgba(0,0,0,.04); }
        .stepper button[aria-current] { color: var(--ink); background: rgba(0,0,0,.05); padding-right: 12px; }
        .stepper .dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; background: var(--line-soft); color: var(--ink-3); transition: all .3s var(--ease-out); }
        .stepper [aria-current] .dot { background: var(--ink); color: #fff; }
        .stepper .done .dot { background: var(--brand); color: #fff; }
        .chips { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
        .design-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(116px, 1fr)); gap: 18px; margin-top: 22px; }
        .design-tile { border: 0; background: none; padding: 0; text-align: left; cursor: pointer; display: grid; gap: 2px; }
        .design-thumb { aspect-ratio: 5/7; border-radius: 6px; overflow: hidden; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 6px 16px rgba(0,0,0,.08); transition: transform .45s var(--ease-out), box-shadow .3s; outline: 3px solid transparent; outline-offset: 3px; }
        .design-thumb svg { width: 100%; height: 100%; display: block; }
        .design-tile:hover .design-thumb { transform: translateY(-4px); }
        .design-tile[aria-pressed="true"] .design-thumb { outline-color: var(--ink); }
        .design-tile strong { font-size: 14px; }
        .design-tile span { font-size: 12px; color: var(--ink-4); }
        .form-stack { display: grid; gap: 22px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .font-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
        .font-chip { border: 1px solid var(--line); background: var(--surface); border-radius: 12px; padding: 10px 4px 8px; cursor: pointer; display: grid; justify-items: center; gap: 2px; transition: all .2s; }
        .font-chip small { font-family: var(--font-text); font-size: 11px; color: var(--ink-3); font-weight: 600; }
        .font-chip[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
        @media (max-width: 480px) { .font-row { grid-template-columns: repeat(3, 1fr); } }
        .swatches { display: flex; gap: 10px; flex-wrap: wrap; }
        .swatch { width: 34px; height: 34px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.12); transition: transform .25s var(--ease-out), box-shadow .2s; display: grid; place-items: center; }
        .swatch.big { width: 44px; height: 44px; }
        .swatch:hover { transform: scale(1.08); }
        .swatch[aria-pressed="true"] { box-shadow: inset 0 0 0 1px rgba(0,0,0,.12), 0 0 0 3px var(--bg), 0 0 0 5px var(--ink); }
        .liner-row { display: flex; gap: 10px; flex-wrap: wrap; }
        .liner-chip { border: 1px solid var(--line); background: var(--surface); border-radius: 12px; padding: 8px; cursor: pointer; display: grid; justify-items: center; gap: 4px; }
        .liner-chip small { font-size: 11px; font-weight: 600; color: var(--ink-3); }
        .liner-chip[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
        .brand-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 10px; }
        .brand-tile { aspect-ratio: 1.586; border: 0; border-radius: 12px; padding: 12px; text-align: left; cursor: pointer; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 1px 2px rgba(0,0,0,.1), 0 4px 12px rgba(0,0,0,.08); transition: transform .3s var(--ease-out), box-shadow .3s; outline: 3px solid transparent; outline-offset: 3px; }
        .brand-tile strong { font-family: var(--font-display); font-size: 16px; letter-spacing: -0.02em; line-height: 1.15; }
        .brand-tile span { font-size: 12px; opacity: .75; }
        .brand-tile:hover { transform: translateY(-3px); }
        .brand-tile[aria-pressed="true"] { outline-color: var(--ink); }
        .brand-tile.none { background: var(--surface); box-shadow: inset 0 0 0 1px var(--line); }
        .amount-input { display: flex; align-items: center; gap: 4px; border: 1px solid var(--line); border-radius: 980px; padding: 0 12px; height: 36px; background: var(--surface); }
        .amount-input input { border: 0; outline: 0; width: 60px; font-size: 14px; background: transparent; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 14px; }
        .summary { margin: 0; display: grid; border-top: 1px solid var(--line-soft); }
        .summary > div { display: grid; grid-template-columns: 90px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line-soft); }
        .summary dt { color: var(--ink-4); font-size: 15px; }
        .summary dd { margin: 0; font-size: 16px; }
        .price { width: 100%; border-collapse: collapse; font-size: 16px; }
        .price td { padding: 6px 0; }
        .price td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
        .price .total td { font-weight: 700; font-size: 19px; padding-top: 12px; border-top: 1px solid var(--line-soft); }
        .link-btn { border: 0; background: none; color: var(--blue); cursor: pointer; font-size: 15px; padding: 0 0 0 6px; }
        .composer-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 32px; }
      `}</style>
    </div>
  );
}

function Segmented({ value, options, onChange }: { value: string; options: { value: string; label: string }[]; onChange: (v: string) => void }) {
  const i = Math.max(0, options.findIndex((o) => o.value === value));
  return (
    <div className="segmented" role="radiogroup">
      <motion.span className="thumb" initial={false} animate={{ left: `calc(${(100 / options.length) * i}% + 2px)`, width: `calc(${100 / options.length}% - 4px)` }} transition={{ type: "spring", stiffness: 500, damping: 38 }} />
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)} style={{ color: o.value === value ? "var(--ink)" : undefined }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
