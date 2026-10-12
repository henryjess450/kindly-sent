"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { GiftTile } from "./GiftTile";
import type { GiftBrand } from "@/config/gifts";
import type { Credential } from "@/lib/giftcards";

export type GiftCodes = { credentials: Credential[]; instructions?: string } | null;

/**
 * The gift, printed inside the card: a paper pocket holding the gift card,
 * with its number and PIN underneath. Codes stay hidden until tapped.
 * Sizes use cqw so it scales with the card.
 */
export function GiftPocket({
  brand,
  amountCents,
  accent,
  codes,
  loading,
  preview,
  recipient,
  show,
}: {
  brand: GiftBrand;
  amountCents: number;
  accent: string;
  codes: GiftCodes;
  loading: boolean;
  preview: boolean;
  recipient: string;
  show: boolean;
}) {
  const [shown, setShown] = useState<Record<number, boolean>>({});
  const [copied, setCopied] = useState<number | null>(null);
  const [help, setHelp] = useState(false);

  async function copy(i: number, value: string) {
    try {
      await navigator.clipboard.writeText(value.replace(/\s/g, ""));
      setCopied(i);
      setTimeout(() => setCopied((c) => (c === i ? null : c)), 1600);
    } catch {}
  }

  const rows = (codes?.credentials ?? []).filter((c) => c.kind !== "url");
  const link = codes?.credentials.find((c) => c.kind === "url");

  return (
    <div className="pocket" style={{ ["--accent" as string]: accent }}>
      <div className="pocket-kicker">A gift for you</div>
      <div className="pocket-slot">
        <motion.div className="pocket-card" initial={false} animate={show ? { y: "0%", rotate: -3 } : { y: "62%", rotate: 0 }} transition={{ type: "spring", stiffness: 70, damping: 13, delay: show ? 0.9 : 0 }}>
          <GiftTile brand={brand} amountCents={amountCents} width="64cqw" />
        </motion.div>
        <svg className="pocket-front" viewBox="0 0 100 34" preserveAspectRatio="none" aria-hidden>
          <path d="M0 6 L44 0 Q50 -1 56 0 L100 6 V34 H0 Z" fill="var(--accent)" opacity="0.14" />
          <path d="M0 6 L44 0 Q50 -1 56 0 L100 6" stroke="var(--accent)" strokeOpacity="0.35" strokeWidth="0.6" fill="none" strokeDasharray="1.6 1.2" />
        </svg>
      </div>

      <div className="pocket-codes">
        {preview ? (
          <p className="pocket-note">The card number and PIN appear here for {recipient} when they open it.</p>
        ) : loading ? (
          <>
            <div className="code-skel" />
            <div className="code-skel short" />
          </>
        ) : rows.length ? (
          rows.map((c, i) => (
            <div key={i} className="code-row">
              <span className="code-label">{c.label}</span>
              <button className="code-value" onClick={() => setShown((s) => ({ ...s, [i]: !s[i] }))} aria-label={shown[i] ? `Hide ${c.label}` : `Show ${c.label}`}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span key={shown[i] ? "v" : "m"} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.18 }}>
                    {shown[i] ? c.value : c.kind === "pin" ? "••••" : `•••• ${c.value.replace(/\s/g, "").slice(-4)}`}
                  </motion.span>
                </AnimatePresence>
              </button>
              <button className="code-copy" onClick={() => copy(i, c.value)}>{copied === i ? "Copied" : "Copy"}</button>
            </div>
          ))
        ) : link ? null : (
          <p className="pocket-note">Your gift is on its way. Open this card again in a minute.</p>
        )}
        {!preview && link && (
          <a className="code-link" href={link.value} target="_blank" rel="noopener noreferrer">Redeem online</a>
        )}
        {!preview && rows.length > 0 && <p className="pocket-note">Tap a code to show it.{codes?.instructions ? " " : ""}{codes?.instructions && <button className="code-help" onClick={() => setHelp(true)}>How to use it</button>}</p>}
      </div>

      <AnimatePresence>
        {help && codes?.instructions && (
          <motion.div className="pocket-help" initial={{ opacity: 0, y: "6%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "6%" }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
            <strong>How to use your {brand.name} gift card</strong>
            <div className="pocket-help-body">{codes.instructions}</div>
            <button className="code-copy" onClick={() => setHelp(false)}>Done</button>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .pocket { position: absolute; inset: 0; padding: 8cqw 7cqw; display: flex; flex-direction: column; align-items: center; font-family: var(--font-text); color: #24211d; }
        .pocket-kicker { font-size: 3.1cqw; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--accent); margin-bottom: 5cqw; }
        .pocket-slot { position: relative; width: 78cqw; height: 50cqw; display: grid; justify-items: center; }
        .pocket-card { position: absolute; top: 0; z-index: 1; filter: drop-shadow(0 1.5cqw 2cqw rgba(0,0,0,.18)); }
        .pocket-card .gift-tile { box-shadow: none; }
        .pocket-front { position: absolute; left: 0; bottom: -4cqw; width: 100%; height: 26cqw; z-index: 2; }
        .pocket-codes { width: 100%; margin-top: 9cqw; display: grid; gap: 2.6cqw; }
        .code-row { display: grid; grid-template-columns: 1fr auto; grid-template-areas: "label label" "value copy"; align-items: center; column-gap: 2cqw; padding-bottom: 2.4cqw; border-bottom: 0.3cqw dashed rgba(0,0,0,.15); }
        .code-label { grid-area: label; font-size: 2.7cqw; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #8a847a; }
        .code-value { grid-area: value; text-align: left; border: 0; background: none; padding: 0.6cqw 0; cursor: pointer; font-family: ui-monospace, "SF Mono", Menlo, monospace; font-size: 5cqw; font-weight: 600; letter-spacing: .04em; color: #1d1d1f; font-variant-numeric: tabular-nums; overflow-wrap: anywhere; }
        .code-copy { grid-area: copy; border: 0; border-radius: 99px; background: rgba(0,0,0,.06); padding: 1.4cqw 3cqw; font-size: 2.9cqw; font-weight: 700; cursor: pointer; color: #1d1d1f; }
        .code-copy:hover { background: rgba(0,0,0,.1); }
        .code-link { justify-self: start; font-size: 3.4cqw; font-weight: 700; color: var(--accent); }
        .code-help { border: 0; background: none; padding: 0; color: var(--accent); font: inherit; font-weight: 700; cursor: pointer; text-decoration: underline; }
        .pocket-note { margin: 0; font-size: 2.9cqw; line-height: 1.4; color: #8a847a; }
        .code-skel { height: 9cqw; border-radius: 1.5cqw; background: rgba(0,0,0,.06); animation: skel 1.4s ease-in-out infinite; }
        .code-skel.short { width: 55%; }
        @keyframes skel { 0%, 100% { opacity: .5; } 50% { opacity: 1; } }
        .pocket-help { position: absolute; inset: 4cqw; z-index: 5; background: #fffdf8; border-radius: 2cqw; box-shadow: 0 2cqw 6cqw rgba(0,0,0,.18); padding: 6cqw; display: flex; flex-direction: column; gap: 3cqw; font-size: 3.2cqw; }
        .pocket-help-body { flex: 1; overflow: auto; white-space: pre-wrap; line-height: 1.45; color: #4a4640; }
        .pocket-help .code-copy { align-self: flex-end; }
      `}</style>
    </div>
  );
}
