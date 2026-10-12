"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { CardArt } from "../CardArt";
import { Envelope } from "../Envelope";
import { DESIGNS, getDesign } from "@/lib/designs";
import { GiftTile } from "../GiftTile";
import { GIFT_BRANDS } from "@/config/gifts";
import { money, pricing } from "@/config/pricing";

const rise = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] as const },
};

export function Gallery() {
  const occasions = ["All", ...Array.from(new Set(DESIGNS.map((d) => d.occasion)))];
  const [filter, setFilter] = useState("All");
  const shown = DESIGNS.filter((d) => filter === "All" || d.occasion === filter);
  return (
    <section id="cards" className="section" style={{ background: "var(--bg-alt)", scrollMarginTop: 52 }}>
      <div className="wrap">
        <motion.div {...rise}>
          <p className="eyebrow">The cards</p>
          <h2 className="display display-l" style={{ maxWidth: 760 }}>{DESIGNS.length} cards. Drawn by hand. All alive.</h2>
          <p className="lede" style={{ maxWidth: 620, marginTop: 16 }}>
            Every design is illustrated line by line, and every one of them moves: the candle flickers, the snow falls, the mobile turns over the crib.
          </p>
        </motion.div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "36px 0 28px" }}>
          {occasions.map((o) => (
            <button key={o} className="chip" aria-pressed={filter === o} onClick={() => setFilter(o)}>{o}</button>
          ))}
        </div>
      </div>
      <div className="gallery-row">
        <AnimatePresence mode="popLayout">
          {shown.map((d, i) => (
            <motion.div
              key={d.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.03 }}
            >
              <Link href={`/send?design=${d.id}`} className="gallery-card">
                <div className="gallery-art"><CardArt design={d} /></div>
                <div className="gallery-meta">
                  <strong>{d.name}</strong>
                  <span>{d.occasion}</span>
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <style>{`
        .gallery-row { display: flex; gap: 22px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 12px max(22px, calc((100vw - 1080px) / 2 + 22px)) 40px; scrollbar-width: none; }
        .gallery-row::-webkit-scrollbar { display: none; }
        .gallery-row > div { scroll-snap-align: start; flex: 0 0 auto; }
        .gallery-card { display: block; width: clamp(200px, 22vw, 250px); text-decoration: none; }
        .gallery-art { aspect-ratio: 5 / 7; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow-card); transition: transform .6s var(--ease-out), box-shadow .6s var(--ease-out); }
        .gallery-art svg { display: block; width: 100%; height: 100%; }
        .gallery-card:hover .gallery-art { transform: translateY(-8px) rotate(-1.2deg); box-shadow: 0 2px 4px rgba(0,0,0,.06), 0 24px 50px rgba(0,0,0,.16); }
        .gallery-meta { display: flex; justify-content: space-between; align-items: baseline; padding: 14px 2px 0; font-size: 15px; }
        .gallery-meta span { color: var(--ink-4); font-size: 13px; }
      `}</style>
    </section>
  );
}

function Typing({ text, start }: { text: string; start: boolean }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!start) return;
    const id = setInterval(() => setN((v) => (v >= text.length ? v : v + 1)), 55);
    return () => clearInterval(id);
  }, [start, text]);
  return (
    <span>
      {text.slice(0, n)}
      <span className="caret" />
    </span>
  );
}

function Clock({ start }: { start: boolean }) {
  return (
    <svg viewBox="0 0 120 120" width="120" height="120" aria-hidden>
      <circle cx="60" cy="60" r="54" fill="#fff" stroke="#1d1d1f" strokeWidth="4" />
      {Array.from({ length: 12 }, (_, i) => (
        <line key={i} x1="60" y1="12" x2="60" y2={i % 3 ? 18 : 22} stroke="#1d1d1f" strokeWidth={i % 3 ? 2 : 4} strokeLinecap="round" transform={`rotate(${i * 30} 60 60)`} />
      ))}
      <motion.line x1="60" y1="60" x2="60" y2="34" stroke="#1d1d1f" strokeWidth="5" strokeLinecap="round" style={{ originX: "60px", originY: "60px" }} initial={{ rotate: 150 }} animate={start ? { rotate: 240 } : {}} transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }} />
      <motion.line x1="60" y1="60" x2="60" y2="22" stroke="#E5484D" strokeWidth="3" strokeLinecap="round" style={{ originX: "60px", originY: "60px" }} initial={{ rotate: 0 }} animate={start ? { rotate: 1080 } : {}} transition={{ duration: 2.2, ease: [0.65, 0, 0.35, 1] }} />
      <circle cx="60" cy="60" r="4" fill="#1d1d1f" />
    </svg>
  );
}

function SealDemo({ start }: { start: boolean }) {
  const [sealed, setSealed] = useState(false);
  useEffect(() => {
    if (!start) return;
    const t = setTimeout(() => setSealed(true), 700);
    return () => clearTimeout(t);
  }, [start]);
  return <Envelope design={getDesign("heart")!} width={118} flapOpen={false} seal={sealed} sealLetter="K" />;
}

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-120px" });
  const steps = [
    { title: "Write it now", body: "Pick a design, write in your own words, then choose the lettering, the ink and the envelope.", art: <div className="mini-card"><Typing start={seen} text="Proud of you, always." /></div> },
    { title: "Pick the minute", body: "Their birthday at 7:00 AM in their time zone. Your anniversary at dinner. Any date up to five years out.", art: <Clock start={seen} /> },
    { title: "We seal and deliver", body: "It arrives by email in a sealed envelope they open with a tap. You get a note when it lands, and when they open it.", art: <SealDemo start={seen} /> },
  ];
  return (
    <section id="how" className="section" style={{ scrollMarginTop: 52 }}>
      <div className="wrap">
        <motion.div {...rise} className="center">
          <p className="eyebrow">How it works</p>
          <h2 className="display display-l">Three steps. Then forget about it.</h2>
        </motion.div>
        <div ref={ref} className="steps">
          {steps.map((s, i) => (
            <motion.div key={s.title} className="step panel" initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}>
              <div className="step-art">{s.art}</div>
              <span className="step-n">{i + 1}</span>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 64px; }
        @media (max-width: 860px) { .steps { grid-template-columns: 1fr; } }
        .step { padding: 32px 30px 34px; }
        .step-art { height: 190px; display: grid; place-items: center; margin-bottom: 18px; background: var(--bg-alt); border-radius: 16px; }
        .step-n { font-family: var(--font-display); font-weight: 700; color: var(--brand); font-size: 15px; }
        .step h3 { font-family: var(--font-display); font-size: 26px; letter-spacing: -0.03em; margin: 4px 0 8px; }
        .step p { margin: 0; color: var(--ink-3); font-size: 16px; }
        .mini-card { width: 150px; height: 120px; background: #fffdf8; border-radius: 6px; box-shadow: var(--shadow-card); padding: 16px; font-family: var(--font-hand); font-size: 24px; line-height: 1.1; transform: rotate(-3deg); }
        .caret { display: inline-block; width: 2px; height: 0.9em; background: var(--brand); margin-left: 2px; vertical-align: -0.1em; animation: blink 1s steps(1) infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </section>
  );
}

export function EveryYear() {
  const years = [2026, 2027, 2028, 2029, 2030];
  return (
    <section className="section" style={{ background: "#1d1d1f", color: "#f5f5f7", overflow: "hidden" }}>
      <div className="wrap center">
        <motion.div {...rise}>
          <p className="eyebrow" style={{ color: "#ff8a8d" }}>Repeats every year</p>
          <h2 className="display display-l">Never miss a birthday again.</h2>
          <p className="lede" style={{ maxWidth: 600, margin: "16px auto 0", color: "#a1a1a6" }}>
            Turn on yearly and the card goes out on the same day, at the same minute, every year. Change the message any time before it leaves.
          </p>
        </motion.div>
        <div className="years">
          {years.map((y, i) => (
            <motion.div key={y} className="year" initial={{ opacity: 0, y: 60, rotate: -6 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }} transition={{ type: "spring", stiffness: 160, damping: 18, delay: 0.15 + i * 0.12 }}>
              <div className="year-env">
                <span style={{ background: i === 0 ? "#E5484D" : "#3a3a3c" }} />
              </div>
              <strong>Mar 14</strong>
              <span>{y}</span>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        .years { display: flex; gap: clamp(10px, 3vw, 36px); justify-content: center; margin-top: 64px; flex-wrap: wrap; }
        .year { display: grid; justify-items: center; gap: 4px; }
        .year strong { font-family: var(--font-display); font-size: 17px; margin-top: 12px; }
        .year > span { color: #86868b; font-size: 14px; }
        .year-env { width: clamp(88px, 12vw, 128px); aspect-ratio: 1.4; background: #2c2c2e; border-radius: 8px; position: relative; overflow: hidden; }
        .year-env::before { content: ""; position: absolute; inset: 0; background: #3a3a3c; clip-path: polygon(0 0, 100% 0, 50% 58%); }
        .year-env span { position: absolute; left: 50%; top: 58%; width: 24%; aspect-ratio: 1; border-radius: 50%; transform: translate(-50%, -50%); }
      `}</style>
    </section>
  );
}

export function Notifications() {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: "-100px" });
  const notes = [
    { title: "Delivered to Mom", body: "Your card arrived right on time.", time: "7:00 AM" },
    { title: "Mom opened your card", body: "She just read what you wrote.", time: "7:12 AM" },
  ];
  return (
    <section className="section">
      <div className="wrap notif-grid">
        <motion.div {...rise}>
          <p className="eyebrow">Peace of mind</p>
          <h2 className="display display-m">You&apos;ll know the moment it lands.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            A quiet note when the card is delivered, and another when it&apos;s opened. Turn them off whenever you like.
          </p>
        </motion.div>
        <div ref={ref} className="notif-stack">
          {notes.map((n, i) => (
            <motion.div key={n.title} className="notif" initial={{ opacity: 0, y: -24, scale: 0.94 }} animate={seen ? { opacity: 1, y: 0, scale: 1 } : {}} transition={{ type: "spring", stiffness: 260, damping: 24, delay: 0.3 + i * 1.1 }}>
              <span className="notif-icon">K</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <strong>{n.title}</strong>
                  <span className="muted" style={{ fontSize: 13 }}>{n.time}</span>
                </div>
                <div className="muted" style={{ fontSize: 15 }}>{n.body}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        .notif-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        @media (max-width: 820px) { .notif-grid { grid-template-columns: 1fr; } }
        .notif-stack { display: grid; gap: 12px; padding: 40px 28px; background: var(--bg-alt); border-radius: 28px; }
        .notif { display: flex; gap: 12px; align-items: center; padding: 14px 16px; border-radius: 20px; background: rgba(255,255,255,.85); backdrop-filter: blur(20px); box-shadow: 0 6px 24px rgba(0,0,0,.08); font-size: 15px; }
        .notif-icon { width: 38px; height: 38px; border-radius: 10px; background: var(--brand); color: #fff; display: grid; place-items: center; font-weight: 800; flex-shrink: 0; }
      `}</style>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="section center">
      <motion.div {...rise} className="wrap">
        <h2 className="display display-l">Someone&apos;s day is coming up.</h2>
        <p className="lede" style={{ margin: "16px auto 30px", maxWidth: 520 }}>Write it while you&apos;re thinking of them. Two minutes and {money(pricing.cardCents)}.</p>
        <Link href="/send" className="btn btn-brand">Write a card</Link>
      </motion.div>
    </section>
  );
}

export function Gifts() {
  const fan = GIFT_BRANDS.slice(1, 6);
  return (
    <section className="section" style={{ overflow: "hidden" }}>
      <div className="wrap gifts-grid">
        <motion.div {...rise}>
          <p className="eyebrow">Gift cards</p>
          <h2 className="display display-l">Tuck a gift inside.</h2>
          <p className="lede" style={{ marginTop: 16 }}>
            Add a gift card from Amazon, Tim Hortons, Starbucks, Indigo and more. Its card number and PIN are printed inside the card, ready to use the moment they open it.
          </p>
          <p className="muted" style={{ marginTop: 14, fontSize: 15 }}>
            We buy it the moment the card is delivered, so if plans change, cancelling is a full refund.
          </p>
        </motion.div>
        <div className="fan">
          {fan.map((b, i) => (
            <motion.div
              key={b.id}
              className="fan-card"
              initial={{ opacity: 0, y: 120, rotate: 0 }}
              whileInView={{ opacity: 1, y: 0, rotate: (i - 2) * 9 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ type: "spring", stiffness: 120, damping: 16, delay: 0.1 + i * 0.09 }}
              style={{ zIndex: i, x: (i - 2) * 46 }}
            >
              <GiftTile brand={b} amountCents={[2500, 5000, 1000, 2500, 10000][i]} width={230} />
            </motion.div>
          ))}
        </div>
      </div>
      <style>{`
        .gifts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        @media (max-width: 860px) { .gifts-grid { grid-template-columns: 1fr; } }
        .fan { position: relative; height: 320px; display: grid; place-items: center; }
        .fan-card { position: absolute; transform-origin: 50% 160%; }
        @media (max-width: 480px) { .fan { transform: scale(.8); } }
      `}</style>
    </section>
  );
}

export function Pricing() {
  return (
    <section className="section center" style={{ background: "var(--bg-alt)" }}>
      <motion.div {...rise} className="wrap">
        <p className="eyebrow">Pricing</p>
        <motion.h2
          className="display"
          style={{ fontSize: "clamp(96px, 18vw, 220px)", letterSpacing: "-0.06em" }}
          initial={{ scale: 0.7, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
        >
          {money(pricing.cardCents)}
        </motion.h2>
        <p className="lede" style={{ maxWidth: 560, margin: "8px auto 0" }}>
          Per card. No subscription, no account fee. Every design, every option, and a full refund if you cancel before it goes out.
        </p>
        <div className="price-points">
          {["Any of the " + DESIGNS.length + " animated designs", "Your choice of writing, ink and envelope", "Delivered to the minute, in their time zone", "Know when it lands and when it's opened"].map((t, i) => (
            <motion.div key={t} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08 }}>
              <span className="tick">✓</span>
              {t}
            </motion.div>
          ))}
        </div>
      </motion.div>
      <style>{`
        .price-points { display: grid; grid-template-columns: repeat(2, minmax(0, 300px)); gap: 14px 28px; justify-content: center; margin-top: 40px; text-align: left; font-size: 16px; }
        @media (max-width: 640px) { .price-points { grid-template-columns: 1fr; } }
        .price-points > div { display: flex; gap: 10px; align-items: baseline; }
        .tick { color: var(--brand); font-weight: 800; }
      `}</style>
    </section>
  );
}
