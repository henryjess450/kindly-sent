"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card3D } from "../Card3D";
import { CardArt } from "../CardArt";
import { SendOff } from "./SendOff";
import { DESIGNS, FONTS, getDesign } from "@/lib/designs";
import { useViewport } from "@/lib/useViewport";
import type { PublicCard } from "@/lib/cards";

type Draft = {
  design: string;
  font: string;
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
};

const STEPS = ["Card", "Message", "Delivery", "Review"];
const MAX = 1200;
const DRAFT_KEY = "ks-draft";

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
  if (d.sendNow) return "Right after you confirm";
  if (!d.date || !d.time) return "Pick a date";
  const [y, m, day] = d.date.split("-").map(Number);
  const [hh, mm] = d.time.split(":").map(Number);
  const dt = new Date(y, m - 1, day, hh, mm);
  return dt.toLocaleString("en-CA", { weekday: "long", month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
}

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
}: {
  signedInEmail: string | null;
  defaultName: string;
  initialDesign?: string;
  editCard?: PublicCard;
}) {
  const vp = useViewport();
  const [step, setStep] = useState(editCard ? 1 : initialDesign ? 1 : 0);
  const [dir, setDir] = useState(1);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ status: "pending" | "scheduled"; card: PublicCard } | null>(null);
  const [peek, setPeek] = useState<boolean | null>(null);
  const [d, setD] = useState<Draft>(() => ({
    design: editCard?.design ?? (initialDesign && getDesign(initialDesign) ? initialDesign : "balloons"),
    font: editCard?.font ?? "hand",
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
  }));
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => {
    setError("");
    setD((p) => ({ ...p, [k]: v }));
  };

  // Browser time zone, and a saved draft if they left halfway through.
  useEffect(() => {
    if (editCard) return;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let saved: Partial<Draft> = {};
    try {
      saved = JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? "{}");
    } catch {}
    setD((p) => ({ ...p, timezone: tz || p.timezone, ...saved, ...(initialDesign && getDesign(initialDesign) ? { design: initialDesign } : {}) }));
  }, [editCard, initialDesign]);
  useEffect(() => {
    if (editCard || result) return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...d, sendNow: false }));
    } catch {}
  }, [d, editCard, result]);

  const zones = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return [d.timezone];
    }
  }, [d.timezone]);

  const design = getDesign(d.design)!;
  const book = vp.w >= 980;
  const previewW = book ? Math.min(250, (vp.w / 2 - 120) / 2, (vp.h - 220) / 1.4) : Math.min(230, vp.w * 0.55, (vp.h * 0.42) / 1.4);
  const open = peek ?? step === 1;

  function validate(s: number): string {
    if (s === 1) {
      if (!d.recipientName.trim()) return "Who is the card for?";
      if (!d.message.trim()) return "Write a message inside the card.";
      if (!d.senderName.trim()) return "Add your name so they know who it's from.";
    }
    if (s === 2) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.recipientEmail.trim())) return "Check their email address.";
      if (!d.sendNow) {
        if (!d.date || !d.time) return "Pick a delivery date and time.";
      }
    }
    return "";
  }

  function go(to: number) {
    if (to > step) {
      for (let s = step; s < to; s++) {
        const e = validate(s);
        if (e) return setError(e);
      }
    }
    setError("");
    setPeek(null);
    setDir(to > step ? 1 : -1);
    setStep(to);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(editCard ? `/api/cards/${editCard.id}` : "/api/cards", {
        method: editCard ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(d),
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

  if (result) return <SendOff design={design} content={d} result={result} edited={!!editCard} />;

  return (
    <div className="composer">
      <div className="composer-preview">
        <div className="preview-sticky">
          <motion.div key={d.design} initial={{ opacity: 0, scale: 0.94, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 22 }}>
            <Card3D design={design} content={d} open={open} mode={book ? "book" : "flip"} width={previewW} />
          </motion.div>
          <button className="btn btn-ghost btn-small" style={{ marginTop: 26, visibility: vp.ready ? "visible" : "hidden" }} onClick={() => setPeek(!open)}>
            {open ? "Close the card" : "Look inside"}
          </button>
        </div>
      </div>

      <div className="composer-panel">
        <ol className="stepper" aria-label="Steps">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button onClick={() => go(i)} aria-current={i === step ? "step" : undefined} className={i < step ? "done" : ""}>
                <span className="dot">{i < step ? "✓" : i + 1}</span>
                {s}
              </button>
            </li>
          ))}
        </ol>

        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={slide} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}>
            {step === 0 && (
              <div>
                <h1 className="display display-m">Choose a card.</h1>
                <p className="lede" style={{ fontSize: 19, margin: "10px 0 28px" }}>You can change it any time before it goes out.</p>
                <div className="design-grid">
                  {DESIGNS.map((x) => (
                    <button key={x.id} className="design-tile" aria-pressed={x.id === d.design} onClick={() => set("design", x.id)}>
                      <div className="design-thumb"><CardArt design={x} /></div>
                      <strong>{x.name}</strong>
                      <span>{x.occasion}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="form-stack">
                <h1 className="display display-m">Write your message.</h1>
                <div className="field">
                  <label htmlFor="rn">Who is it for?</label>
                  <input id="rn" className="input" placeholder="Mom" value={d.recipientName} maxLength={60} onChange={(e) => set("recipientName", e.target.value)} />
                </div>
                <div className="field">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                    <label htmlFor="msg">Message</label>
                    <Segmented value={d.font} options={FONTS.map((f) => ({ value: f.id, label: f.name }))} onChange={(v) => set("font", v)} />
                  </div>
                  <textarea
                    id="msg"
                    className="textarea"
                    placeholder="Happy birthday! I hope this year is full of..."
                    value={d.message}
                    maxLength={MAX}
                    onChange={(e) => set("message", e.target.value)}
                    style={{ fontFamily: d.font === "hand" ? "var(--font-hand)" : d.font === "serif" ? "var(--font-serif)" : undefined, fontSize: d.font === "hand" ? 24 : 17 }}
                  />
                  <span className="hint" style={{ textAlign: "right" }}>{MAX - d.message.length} characters left</span>
                </div>
                <div className="field">
                  <label htmlFor="sn">Sign it</label>
                  <input id="sn" className="input" placeholder="Love, Sam" value={d.senderName} maxLength={60} onChange={(e) => set("senderName", e.target.value)} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="form-stack">
                <h1 className="display display-m">When should it arrive?</h1>
                <div className="field">
                  <label htmlFor="re">{d.recipientName.trim() || "Their"} email</label>
                  <input id="re" className="input" type="email" inputMode="email" autoComplete="off" placeholder="name@example.com" value={d.recipientEmail} onChange={(e) => set("recipientEmail", e.target.value)} />
                </div>
                <Segmented value={d.sendNow ? "now" : "later"} options={[{ value: "later", label: "Schedule it" }, { value: "now", label: "Send right away" }]} onChange={(v) => set("sendNow", v === "now")} />
                <AnimatePresence initial={false}>
                  {!d.sendNow && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} style={{ overflow: "hidden" }}>
                      <div className="form-stack" style={{ paddingTop: 4 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          {[
                            { label: "Tomorrow, 9 AM", date: addDays(1), time: "09:00" },
                            { label: "Friday evening", date: nextWeekday(5), time: "18:00" },
                            { label: "In one week", date: addDays(7), time: "09:00" },
                          ].map((q) => (
                            <button key={q.label} className="chip" aria-pressed={d.date === q.date && d.time === q.time} onClick={() => setD((p) => ({ ...p, date: q.date, time: q.time }))}>{q.label}</button>
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
                            <div className="hint">Same day, same minute, every year until you stop it.</div>
                          </div>
                          <button className="switch" role="switch" aria-checked={d.repeat === "yearly"} aria-label="Send every year" onClick={() => set("repeat", d.repeat === "yearly" ? "none" : "yearly")} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {step === 3 && (
              <div className="form-stack">
                <h1 className="display display-m">Ready to seal it?</h1>
                <dl className="summary">
                  <div><dt>Card</dt><dd>{design.name} <button className="link-btn" onClick={() => go(0)}>Change</button></dd></div>
                  <div><dt>To</dt><dd>{d.recipientName} · {d.recipientEmail} <button className="link-btn" onClick={() => go(2)}>Edit</button></dd></div>
                  <div><dt>Arrives</dt><dd>{whenLabel(d)}{!d.sendNow && <span className="muted"> ({d.timezone.replace(/_/g, " ")})</span>}{d.repeat === "yearly" && !d.sendNow ? ", every year" : ""}</dd></div>
                  <div><dt>From</dt><dd>{d.senderName}</dd></div>
                </dl>
                {!signedInEmail && (
                  <div className="field">
                    <label htmlFor="em">Your email</label>
                    <input id="em" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={d.email} onChange={(e) => set("email", e.target.value)} />
                    <span className="hint">We&apos;ll send one link to confirm it&apos;s you. The card waits until you tap it. No password needed.</span>
                  </div>
                )}
                {signedInEmail && <p className="hint" style={{ margin: 0 }}>Signed in as {signedInEmail}.</p>}
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
          {step > 0 ? <button className="btn btn-ghost" onClick={() => go(step - 1)}>Back</button> : <Link href="/" className="btn btn-ghost">Cancel</Link>}
          {step < 3 ? (
            <button className="btn btn-primary" onClick={() => go(step + 1)}>Continue</button>
          ) : (
            <button className="btn btn-brand" onClick={submit} disabled={busy}>
              {busy ? "Sealing..." : editCard ? "Save changes" : d.sendNow ? "Seal and send" : "Seal and schedule"}
            </button>
          )}
        </div>
      </div>

      <style>{`
        .composer { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 52px); }
        .composer-preview { background: var(--bg-alt); }
        .preview-sticky { position: sticky; top: 52px; height: calc(100vh - 52px); display: grid; place-items: center; align-content: center; justify-items: center; }
        .composer-panel { padding: 48px clamp(22px, 5vw, 72px) 64px; max-width: 640px; width: 100%; }
        @media (max-width: 979px) {
          .composer { grid-template-columns: 1fr; }
          .preview-sticky { position: relative; top: 0; height: auto; padding: 32px 0 22px; }
          .composer-panel { padding-top: 28px; margin: 0 auto; }
        }
        .stepper { list-style: none; padding: 0; margin: 0 0 36px; display: flex; gap: 6px; flex-wrap: wrap; }
        .stepper button { border: 0; background: none; display: flex; align-items: center; gap: 7px; font-size: 14px; font-weight: 600; color: var(--ink-4); cursor: pointer; padding: 6px 10px 6px 6px; border-radius: 980px; transition: background .2s, color .2s; }
        .stepper button:hover { background: rgba(0,0,0,.04); }
        .stepper button[aria-current] { color: var(--ink); background: rgba(0,0,0,.05); }
        .stepper .dot { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; font-size: 12px; background: var(--line-soft); color: var(--ink-3); transition: all .3s var(--ease-out); }
        .stepper [aria-current] .dot { background: var(--ink); color: #fff; }
        .stepper .done .dot { background: var(--brand); color: #fff; }
        .design-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 18px; }
        .design-tile { border: 0; background: none; padding: 0; text-align: left; cursor: pointer; display: grid; gap: 2px; }
        .design-thumb { aspect-ratio: 5/7; border-radius: 6px; overflow: hidden; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,.08), 0 6px 16px rgba(0,0,0,.08); transition: transform .45s var(--ease-out), box-shadow .3s; outline: 3px solid transparent; outline-offset: 3px; }
        .design-thumb svg { width: 100%; height: 100%; display: block; }
        .design-tile:hover .design-thumb { transform: translateY(-4px); }
        .design-tile[aria-pressed="true"] .design-thumb { outline-color: var(--ink); }
        .design-tile strong { font-size: 14px; }
        .design-tile span { font-size: 12px; color: var(--ink-4); }
        .form-stack { display: grid; gap: 22px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 18px; background: var(--surface); border: 1px solid var(--line-soft); border-radius: 14px; }
        .summary { margin: 0; display: grid; border-top: 1px solid var(--line-soft); }
        .summary > div { display: grid; grid-template-columns: 90px 1fr; gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--line-soft); }
        .summary dt { color: var(--ink-4); font-size: 15px; }
        .summary dd { margin: 0; font-size: 16px; }
        .link-btn { border: 0; background: none; color: var(--blue); cursor: pointer; font-size: 15px; padding: 0 0 0 6px; }
        .composer-actions { display: flex; justify-content: space-between; gap: 12px; margin-top: 36px; }
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
