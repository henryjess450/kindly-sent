"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { findLed, LAMP_ANIMS, LAMP_ANIM_IDS, TAKES_AMOUNT, type LampAnim } from "@/lib/lamp/animations";
import type { LampChoice, LampEvent, LampPlay, LampSettings, LampStatus } from "@/lib/lamp/server";
import { LampRing } from "./LampRing";
import { money } from "@/config/pricing";

// Kept here as well as in server.ts: this file runs in the browser.
const EVENTS: { key: LampEvent; label: string }[] = [
  { key: "card", label: "A card is bought" },
  { key: "group", label: "A group card is bought" },
  { key: "free", label: "A free link is used" },
  { key: "renew", label: "A yearly card is renewed" },
  { key: "paid", label: "A payment comes in (plays after the one above)" },
  { key: "signed", label: "Someone signs a group card" },
  { key: "delivered", label: "A card is delivered" },
  { key: "opened", label: "A card is opened" },
  { key: "canceled", label: "A card is cancelled and refunded" },
];
const REASONS: Record<string, string> = { ...Object.fromEntries(EVENTS.map((e) => [e.key, e.label])), admin: "Played from here", ring: "Checking the bottom" };
const animName = (id: string) => LAMP_ANIMS[id as LampAnim]?.name ?? id;
const HOURS = Array.from({ length: 24 }, (_, h) => ({ h, label: new Date(2026, 0, 1, h).toLocaleTimeString("en-CA", { hour: "numeric" }) }));

async function post(body: unknown) {
  const res = await fetch("/api/admin/lamp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "That didn't work.");
  return json;
}

export function LampPanel(props: { settings: LampSettings; status: LampStatus; plays: LampPlay[]; keyMadeAt: number | null; site: string; preview?: boolean }) {
  const [status, setStatus] = useState(props.status);
  const [plays, setPlays] = useState(props.plays);

  // Keep the online dot and the list of plays fresh.
  useEffect(() => {
    if (props.preview) return;
    const id = setInterval(async () => {
      const res = await fetch("/api/admin/lamp").catch(() => null);
      if (!res?.ok) return;
      const json = await res.json();
      setStatus(json.status);
      setPlays(json.plays);
    }, 10_000);
    return () => clearInterval(id);
  }, [props.preview]);

  return (
    <div className="lamp">
      <header className="lamp-hero">
        <div>
          <p className="eyebrow"><Link href="/admin">Admin</Link> · Card lamp</p>
          <h1 className="display display-l">The card lamp.</h1>
          <p className="lamp-lede muted">A ring of 12 lights on your desk that lights up when someone buys a card, signs one, or opens one.</p>
          <StatusLine status={status} paired={!!props.keyMadeAt} />
        </div>
        <LampRing anim={LAMP_ANIM_IDS} size={168} />
      </header>

      <PlayPanel preview={props.preview} onPlayed={setPlays} />
      <SettingsPanel initial={props.settings} preview={props.preview} onSaved={setStatus} />
      <RingPanel initial={props.settings.ring} online={status.online} preview={props.preview} onPlayed={setPlays} />
      <div className="lamp-two">
        <PairPanel keyMadeAt={props.keyMadeAt} site={props.site} preview={props.preview} />
        <section className="panel lamp-sec">
          <h2>Recently played</h2>
          {plays.length === 0 ? (
            <p className="muted">Nothing yet. Tap Play above, or wait for a card.</p>
          ) : (
            <ul className="lamp-plays">
              {plays.map((p) => (
                <li key={p.id}>
                  <span><strong>{animName(p.anim)}</strong> <span className="muted">· {REASONS[p.reason] ?? p.reason}{p.cents != null ? ` · ${money(p.cents)}` : ""}</span></span>
                  <time className="muted">{new Date(p.at).toLocaleString("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <style>{`
        .lamp { display: grid; gap: 24px; }
        .lamp-hero { display: flex; justify-content: space-between; align-items: center; gap: 28px; flex-wrap: wrap; }
        .lamp-hero .eyebrow a { color: inherit; text-decoration: none; }
        .lamp-lede { font-size: 19px; line-height: 1.45; max-width: 520px; margin: 12px 0 14px; }
        .lamp-status { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; font-size: 15px; color: var(--ink-3); }
        .lamp-status strong { color: var(--ink); font-weight: 600; }
        .lamp-sws { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: 10px; margin: 0 0 18px; }
        .lamp-sw { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 14px; border: 1px solid var(--line-soft); background: #1c1c1e; color: #f5f5f7; font: inherit; font-size: 13px; font-weight: 500; text-align: left; cursor: pointer; }
        .lamp-sw:disabled { cursor: default; }
        .lamp-sw i { width: 18px; height: 18px; border-radius: 50%; flex-shrink: 0; }
        .lamp-sw i.flash { animation: lamp-flash 0.5s steps(1, end) infinite; }
        .lamp-sw.big { padding: 16px 18px; font-size: 15px; }
        .lamp-sw.big i { width: 26px; height: 26px; }
        @keyframes lamp-flash { 50% { opacity: 0.15; box-shadow: none; } }
        .lamp-ask { font-size: 17px; margin: 0 0 16px; }
        .lamp-ring-now { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin: 0 0 16px; font-size: 15px; }
        .lamp-quiet { display: inline-flex; align-items: center; height: 24px; padding: 0 10px; border-radius: 980px; background: #eef0ff; color: #3e4ccf; font-size: 12px; font-weight: 600; }
        .lamp-dot { position: relative; display: inline-flex; width: 10px; height: 10px; margin-right: 8px; vertical-align: -1px; }
        .lamp-dot i { position: absolute; inset: 0; border-radius: 50%; }
        .lamp-sec { padding: 24px 26px; }
        .lamp-sec h2 { font-family: var(--font-display); font-size: 22px; letter-spacing: -0.02em; margin: 0 0 6px; }
        .lamp-sec > .muted { margin: 0 0 18px; font-size: 15px; }
        .lamp-tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
        .lamp-tile { display: flex; gap: 14px; align-items: center; padding: 14px; border-radius: 18px; background: var(--bg-alt); }
        .lamp-tile p { margin: 2px 0 8px; font-size: 13px; line-height: 1.35; color: var(--ink-3); }
        .lamp-tile strong { font-size: 16px; }
        .lamp-play { display: flex; align-items: center; gap: 8px; }
        .lamp-dollars { display: inline-flex; align-items: center; gap: 2px; height: 36px; padding: 0 4px 0 12px; border-radius: 980px; background: #fff; border: 1px solid var(--line); font-size: 15px; font-weight: 600; color: var(--ink-3); }
        .lamp-dollars input { width: 52px; border: 0; background: transparent; font: inherit; color: var(--ink); outline: none; }
        .lamp-msg { margin: 14px 0 0; font-size: 14px; font-weight: 500; color: var(--ok); }
        .lamp-events { display: grid; gap: 0; }
        .lamp-event { display: grid; grid-template-columns: 1fr 210px 40px; gap: 14px; align-items: center; padding: 10px 0; border-top: 1px solid var(--line-soft); font-size: 15px; }
        .lamp-event:first-child { border-top: 0; }
        .lamp-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 18px 28px; margin-top: 22px; }
        .lamp-field { display: grid; gap: 8px; font-size: 14px; font-weight: 600; color: var(--ink-2); align-content: start; }
        .lamp-field .muted { font-weight: 400; }
        .lamp-inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-weight: 500; }
        .lamp-inline .input { width: 84px; }
        .lamp-inline .select { width: auto; }
        .lamp-range { width: 100%; accent-color: var(--brand); }
        .lamp-check { display: flex; align-items: center; gap: 10px; font-size: 15px; font-weight: 500; color: var(--ink); }
        .lamp-check input { width: 18px; height: 18px; accent-color: var(--brand); }
        .lamp-save { display: flex; align-items: center; gap: 14px; margin-top: 24px; }
        .lamp-two { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
        .lamp-steps { margin: 0 0 14px; padding-left: 20px; display: grid; gap: 6px; font-size: 15px; color: var(--ink-2); }
        .lamp-steps code, .lamp-key code { font-family: ui-monospace, Menlo, monospace; font-size: 13px; background: var(--bg-alt); padding: 2px 6px; border-radius: 6px; }
        .lamp-key { margin-top: 14px; padding: 14px; border-radius: 16px; background: #fdeceb; display: grid; gap: 8px; }
        .lamp-key b { font-size: 12px; letter-spacing: .08em; text-transform: uppercase; color: var(--brand); }
        .lamp-key div { display: flex; gap: 10px; align-items: center; }
        .lamp-key code { flex: 1; word-break: break-all; background: #fff; padding: 8px 10px; }
        .lamp-plays { list-style: none; margin: 0; padding: 0; }
        .lamp-plays li { display: flex; justify-content: space-between; gap: 12px; padding: 9px 0; border-top: 1px solid var(--line-soft); font-size: 15px; }
        .lamp-plays li:first-child { border-top: 0; }
        .lamp-plays time { font-size: 13px; flex-shrink: 0; }
        @media (max-width: 760px) {
          .lamp-two { grid-template-columns: 1fr; }
          .lamp-event { grid-template-columns: 1fr 40px; }
          .lamp-event > span { grid-column: 1 / -1; }
          .lamp-sec { padding: 20px 18px; }
          .lamp-hero { flex-direction: column-reverse; align-items: flex-start; }
        }
      `}</style>
    </div>
  );
}

function StatusLine({ status, paired }: { status: LampStatus; paired: boolean }) {
  const quiet = status.quietNow && <span className="lamp-quiet">Quiet hours: the site won&apos;t light it</span>;
  const ago = status.agoMin;
  const signal = status.rssi == null ? null : status.rssi > -60 ? "strong" : status.rssi > -72 ? "okay" : "weak";
  const color = status.online ? "var(--ok)" : "var(--ink-4)";
  return (
    <p className="lamp-status">
      <span>
        <span className="lamp-dot">
          {status.online && (
            <motion.i
              style={{ background: color }}
              animate={{ scale: [1, 1.8, 2.6], opacity: [0, 0.45, 0] }}
              transition={{ duration: 2.2, times: [0, 0.25, 1], repeat: Infinity, ease: "easeOut" }}
            />
          )}
          <i style={{ background: color }} />
        </span>
        <strong>{status.online ? "On and listening" : paired ? "Offline" : "No lamp set up yet"}</strong>
      </span>
      {!status.online && ago != null && <span>last heard {ago < 1 ? "just now" : ago < 120 ? `${ago} min ago` : `${Math.round(ago / 60)} h ago`}</span>}
      {status.online && signal && <span>Wi-Fi {signal} ({status.rssi} dBm)</span>}
      {quiet}
    </p>
  );
}

function PlayPanel({ preview, onPlayed }: { preview?: boolean; onPlayed: (p: LampPlay[]) => void }) {
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [dollars, setDollars] = useState(5);
  async function play(anim: LampAnim) {
    setBusy(anim);
    setMsg("");
    try {
      if (preview) {
        setMsg(`Preview only: ${LAMP_ANIMS[anim].name} would play now.`);
      } else {
        const json = await post({ action: "play", anim, dollars: TAKES_AMOUNT.includes(anim) ? dollars : undefined });
        onPlayed(json.plays);
        setMsg(json.message);
      }
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <section className="panel lamp-sec">
      <h2>Play on the lamp</h2>
      <p className="muted">Each one starts and ends dark. Tap Play and the lamp runs it within a second.</p>
      <div className="lamp-tiles">
        {LAMP_ANIM_IDS.map((id, i) => (
          <motion.div key={id} className="lamp-tile" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <LampRing anim={id} size={78} amount={dollars} />
            <div>
              <strong>{LAMP_ANIMS[id].name}</strong>
              <p>{LAMP_ANIMS[id].blurb}</p>
              <span className="lamp-play">
                <motion.button className="btn btn-ghost btn-small" whileTap={{ scale: 0.94 }} disabled={!!busy} onClick={() => play(id)}>
                  {busy === id ? "Sending..." : "Play"}
                </motion.button>
                {TAKES_AMOUNT.includes(id) && (
                  <label className="lamp-dollars" aria-label="Sale amount in dollars">
                    $<input type="number" min={0.01} max={48} step={0.5} value={dollars} onChange={(e) => setDollars(Math.min(48, Math.max(0.01, Number(e.target.value) || 1)))} />
                  </label>
                )}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {msg && (
          <motion.p className="lamp-msg" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {msg}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}

function SettingsPanel({ initial, preview, onSaved }: { initial: LampSettings; preview?: boolean; onSaved: (s: LampStatus) => void }) {
  const [s, setS] = useState(initial);
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (patch: Partial<LampSettings>) => {
    setS((x) => ({ ...x, ...patch }));
    setMsg("");
  };

  async function save() {
    setSaving(true);
    setError("");
    try {
      if (preview) setMsg("Preview only: nothing saved.");
      else {
        const json = await post({ action: "settings", settings: s });
        setS(json.settings);
        onSaved(json.status);
        setMsg(json.message);
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="panel lamp-sec">
      <h2>When it lights up</h2>
      <p className="muted">Pick an animation for each thing that happens on the site, or Nothing to leave the lamp dark.</p>
      <div className="lamp-events">
        {EVENTS.map((e) => (
          <div key={e.key} className="lamp-event">
            <span>{e.label}</span>
            <select className="select" value={s.play[e.key]} onChange={(ev) => set({ play: { ...s.play, [e.key]: ev.target.value as LampChoice } })}>
              {LAMP_ANIM_IDS.map((id) => <option key={id} value={id}>{LAMP_ANIMS[id].name}</option>)}
              <option value="none">Nothing</option>
            </select>
            <LampRing anim={s.play[e.key]} size={40} />
          </div>
        ))}
      </div>

      <div className="lamp-grid">
        <div className="lamp-field">
          Milestones
          <span className="lamp-inline">
            Every
            <input className="input" type="number" min={0} max={10000} value={s.milestone.every || ""} placeholder="Never" onChange={(e) => set({ milestone: { ...s.milestone, every: Math.max(0, Math.round(Number(e.target.value) || 0)) } })} />
            cards, also play
            <select className="select" value={s.milestone.anim} onChange={(e) => set({ milestone: { ...s.milestone, anim: e.target.value as LampAnim } })}>
              {LAMP_ANIM_IDS.map((id) => <option key={id} value={id}>{LAMP_ANIMS[id].name}</option>)}
            </select>
          </span>
        </div>
        <label className="lamp-field">
          <span>Brightness <span className="muted">{s.brightness}%</span></span>
          <input className="lamp-range" type="range" min={5} max={100} step={5} value={s.brightness} onChange={(e) => set({ brightness: Number(e.target.value) })} />
        </label>
        <div className="lamp-field">
          Between cards
          <span className="lamp-inline">
            <div className="segmented" role="radiogroup">
              {(["off", "glow"] as const).map((k) => (
                <button key={k} role="radio" aria-checked={s.idle === k} onClick={() => set({ idle: k })} style={{ background: s.idle === k ? "#fff" : undefined, boxShadow: s.idle === k ? "0 1px 3px rgba(0,0,0,.12)" : undefined }}>
                  {k === "off" ? "Dark" : "Soft glow"}
                </button>
              ))}
            </div>
            <LampRing anim={s.idle} size={40} />
          </span>
        </div>
        <div className="lamp-field">
          <label className="lamp-check">
            <input type="checkbox" checked={s.quiet.on} onChange={(e) => set({ quiet: { ...s.quiet, on: e.target.checked } })} />
            Quiet hours
          </label>
          <span className="lamp-inline" style={{ opacity: s.quiet.on ? 1 : 0.45 }}>
            <select className="select" disabled={!s.quiet.on} value={s.quiet.from} onChange={(e) => set({ quiet: { ...s.quiet, from: Number(e.target.value) } })}>
              {HOURS.map((o) => <option key={o.h} value={o.h}>{o.label}</option>)}
            </select>
            to
            <select className="select" disabled={!s.quiet.on} value={s.quiet.to} onChange={(e) => set({ quiet: { ...s.quiet, to: Number(e.target.value) } })}>
              {HOURS.map((o) => <option key={o.h} value={o.h}>{o.label}</option>)}
            </select>
          </span>
          <span className="muted">Victoria time. The lamp stays dark (no glow) and the site doesn&apos;t light it. Play above still works.</span>
        </div>
      </div>

      <div className="lamp-save">
        <motion.button className="btn btn-brand" whileTap={{ scale: 0.96 }} disabled={saving} onClick={save}>{saving ? "Saving..." : "Save"}</motion.button>
        {msg && <span className="lamp-msg" style={{ margin: 0 }}>{msg}</span>}
        {error && <span className="error">{error}</span>}
      </div>
    </section>
  );
}

function Swatch({ j, onPick, big }: { j: number; onPick?: () => void; big?: boolean }) {
  const led = findLed(j);
  const [r, g, b] = led.rgb;
  return (
    <motion.button type="button" className={`lamp-sw${big ? " big" : ""}`} onClick={onPick} whileTap={{ scale: 0.92 }} whileHover={{ y: -2 }} disabled={!onPick}>
      <i className={led.flashing ? "flash" : ""} style={{ background: `rgb(${r} ${g} ${b})`, boxShadow: `0 0 14px rgb(${r} ${g} ${b} / .6)` }} />
      <span>{led.name}{led.flashing ? ", flashing" : ""}</span>
    </motion.button>
  );
}

/**
 * Find the bottom: the lamp lights each LED a different colour in its wiring
 * order. Tap the one at the bottom, then the one just left of it (going
 * clockwise), and every animation starts at the bottom and goes the right way.
 */
function RingPanel({ initial, online, preview, onPlayed }: { initial: LampSettings["ring"]; online: boolean; preview?: boolean; onPlayed: (p: LampPlay[]) => void }) {
  const [ring, setRing] = useState(initial);
  const [step, setStep] = useState<"idle" | "bottom" | "left" | "done">("idle");
  const [bottom, setBottom] = useState(0);
  const [error, setError] = useState("");

  // Leaving the page mid-way stops the colours (they also stop by themselves after 3 minutes).
  useEffect(() => {
    if (step !== "bottom" && step !== "left") return;
    const stop = () => navigator.sendBeacon?.("/api/admin/lamp", new Blob([JSON.stringify({ action: "find", on: false })], { type: "application/json" }));
    window.addEventListener("pagehide", stop);
    return () => window.removeEventListener("pagehide", stop);
  }, [step]);

  async function start() {
    setError("");
    try {
      if (!preview) await post({ action: "find", on: true });
      setStep("bottom");
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function cancel() {
    setStep("idle");
    if (!preview) await post({ action: "find", on: false }).catch(() => {});
  }
  async function pickLeft(j: number) {
    // Animations count up clockwise from the bottom, so "left of the bottom" is the next LED round.
    const reverse = j === (bottom + 11) % 12;
    setError("");
    try {
      if (!preview) {
        const json = await post({ action: "ring", bottom, reverse });
        onPlayed(json.plays);
      }
      setRing({ bottom, reverse });
      setStep("done");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <section className="panel lamp-sec">
      <h2>Find the bottom</h2>
      <AnimatePresence mode="wait">
        {step === "idle" || step === "done" ? (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <p className="muted">
              {step === "done"
                ? "Saved. Fresh ink is playing on the lamp: it should start at the bottom and run up the left side. If it doesn't, run this again."
                : "If animations don't start at the bottom of the ring, or go round the wrong way, tap below. Every light on the ring turns a different colour, and you tap the one at the bottom."}
            </p>
            <div className="lamp-ring-now">
              <Swatch j={ring.bottom} />
              <span className="muted">is the bottom light, and animations go round {ring.reverse ? "the other way" : "the usual way"}.</span>
            </div>
            <button className="btn btn-brand btn-small" onClick={start} disabled={!online && !preview}>{step === "done" ? "Do it again" : "Find the bottom"}</button>
            {!online && !preview && <span className="muted" style={{ marginLeft: 12, fontSize: 14 }}>The lamp needs to be online.</span>}
          </motion.div>
        ) : step === "bottom" ? (
          <motion.div key="bottom" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="lamp-ask"><b>1 of 2.</b> Look at the lamp. Which light is at the very bottom of the ring?</p>
            <div className="lamp-sws">
              {Array.from({ length: 12 }, (_, j) => <Swatch key={j} j={j} onPick={() => { setBottom(j); setStep("left"); }} />)}
            </div>
            <button className="btn btn-ghost btn-small" onClick={cancel}>Cancel</button>
          </motion.div>
        ) : (
          <motion.div key="left" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="lamp-ask"><b>2 of 2.</b> And which one is just to the <b>left</b> of it?</p>
            <div className="lamp-sws">
              {[(bottom + 1) % 12, (bottom + 11) % 12].map((j) => <Swatch key={j} j={j} big onPick={() => pickLeft(j)} />)}
            </div>
            <button className="btn btn-ghost btn-small" onClick={() => setStep("bottom")}>Back</button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="error">{error}</p>}
    </section>
  );
}

function PairPanel({ keyMadeAt, site, preview }: { keyMadeAt: number | null; site: string; preview?: boolean }) {
  const [key, setKey] = useState("");
  const [madeAt, setMadeAt] = useState(keyMadeAt);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function make() {
    if (madeAt && !confirm("Make a new lamp key? The lamp stops working until it's set up again with the new one.")) return;
    setError("");
    try {
      const json = preview ? { key: "lamp_preview-only-not-a-real-key", madeAt: Date.now() } : await post({ action: "key" });
      setKey(json.key);
      setMadeAt(json.madeAt);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <section className="panel lamp-sec">
      <h2>Set up the lamp</h2>
      <ol className="lamp-steps">
        <li>Plug the ESP32 into the Mac with a USB cable that carries data.</li>
        <li>In the kindly-sent folder, run <code>bash scripts/lamp/flash.sh</code></li>
        <li>When it asks for the lamp key, make one here and paste it in.</li>
      </ol>
      <p className="muted" style={{ fontSize: 13, margin: "0 0 14px" }}>
        The lamp talks to {site.replace(/^https?:\/\//, "")}. {madeAt ? `Current key made ${new Date(madeAt).toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" })}.` : "No key made yet."}
      </p>
      {key ? (
        <motion.div className="lamp-key" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
          <b>Lamp key (shown once)</b>
          <div>
            <code>{key}</code>
            <button className="btn btn-primary btn-small" onClick={() => void navigator.clipboard.writeText(key).then(() => setCopied(true))}>{copied ? "Copied" : "Copy"}</button>
          </div>
        </motion.div>
      ) : (
        <button className={`btn btn-small ${madeAt ? "btn-ghost" : "btn-brand"}`} onClick={make}>{madeAt ? "Make a new lamp key" : "Make a lamp key"}</button>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  );
}
