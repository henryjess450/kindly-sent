"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Card3D, type CardContent } from "./Card3D";
import { Envelope } from "./Envelope";
import { Particles } from "./Particles";
import { GiftTile } from "./GiftTile";
import { GiftPocket, type GiftCodes } from "./GiftPocket";
import { getGiftBrand } from "@/config/gifts";
import type { Design } from "@/lib/designs";
import { useViewport } from "@/lib/useViewport";
import { plainName, sealLetter } from "@/lib/names";

type Stage = "sealed" | "unseal" | "rise" | "present" | "open";
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Sealed envelope -> seal pops -> flap lifts -> card slides out sideways,
 * turns upright and comes forward -> opens -> celebration.
 */
type Gift = { brand: string; amountCents: number } | null;

export function OpenCard({
  design,
  content,
  token,
  preview,
  envelope,
  liner,
  gift,
}: {
  design: Design;
  content: CardContent;
  token: string;
  preview: boolean;
  envelope: string;
  liner: string;
  gift: Gift;
}) {
  const brand = gift ? getGiftBrand(gift.brand) : undefined;
  const [codes, setCodes] = useState<GiftCodes>(null);
  const [codesLoading, setCodesLoading] = useState(!!gift && !preview);
  const [sheet, setSheet] = useState(false);
  const vp = useViewport();
  const [stage, setStage] = useState<Stage>("sealed");
  const book = vp.w >= 760;
  const w = Math.round(book ? Math.min(340, (vp.w - 100) / 2, (vp.h - 190) / 1.4) : Math.min(330, vp.w - 56, (vp.h - 210) / 1.4));
  const ew = Math.round(Math.min(260, vp.w * 0.6)); // card width that fits the envelope
  const letter = sealLetter(content.senderName);

  async function open() {
    if (stage !== "sealed") return;
    if (!preview) {
      // Opening is what fetches the gift card number and PIN.
      void fetch(`/api/open/${token}`, { method: "POST" })
        .then((r) => r.json())
        .then((j: { gift?: GiftCodes }) => setCodes(j.gift ?? null))
        .catch(() => {})
        .finally(() => setCodesLoading(false));
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setStage("open");
    setStage("unseal");
    await wait(900);
    setStage("rise");
    await wait(900);
    setStage("present");
    await wait(1100);
    setStage("open");
  }

  const envGone = stage === "present" || stage === "open";
  const scale = w / (ew * 0.94);

  return (
    <div className="open-stage" onClick={open} style={{ cursor: stage === "sealed" ? "pointer" : "default", background: envGone ? envelope : "var(--bg-alt)" }}>
      <AnimatePresence>
        {stage === "sealed" && (
          <motion.div key="caption" className="open-caption" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <p className="eyebrow" style={{ color: "var(--ink-3)" }}>{preview ? "Preview" : "You have a card"}</p>
            <h1 className="display display-m">For {content.recipientName}</h1>
          </motion.div>
        )}
      </AnimatePresence>

      {vp.ready && (
        <div className="open-center">
          <motion.div
            className="open-env"
            initial={false}
            animate={envGone ? { y: vp.h * 0.7, opacity: 0, rotate: 4 } : stage === "sealed" ? { y: [0, -8, 0] } : { y: 0 }}
            transition={envGone ? { duration: 0.8, ease: [0.55, 0, 0.75, 0.3] } : stage === "sealed" ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          >
            <Envelope design={design} width={ew} color={envelope} liner={liner} flapOpen={stage !== "sealed"} seal={stage === "sealed"} sealLetter={letter}>
              {!envGone && (
                <div className="ks-env-card" style={{ transform: "translate(-50%, -50%)" }}>
                  <motion.div
                    initial={false}
                    animate={{ y: stage === "rise" ? -ew * 1.02 : ew * 0.02, rotate: -90 }}
                    transition={{ duration: 0.85, ease: [0.65, 0, 0.35, 1] }}
                  >
                    <Card3D design={design} content={content} open={false} mode={book ? "book" : "flip"} width={ew * 0.94} />
                  </motion.div>
                </div>
              )}
            </Envelope>
          </motion.div>

          {/* Once clear of the pocket, the card hands over to a free layer at the exact same spot. */}
          {envGone && (
            <motion.div
              className="open-card-layer"
              initial={{ y: -ew * 1.02, rotate: -90, scale: 1 }}
              animate={{ y: 0, rotate: 0, scale }}
              transition={{ type: "spring", stiffness: 70, damping: 16 }}
            >
              <Card3D
                design={design}
                content={content}
                open={stage === "open"}
                mode={book ? "book" : "flip"}
                width={ew * 0.94}
                insideLeft={
                  brand && gift ? (
                    <GiftPocket brand={brand} amountCents={gift.amountCents} accent={design.accent} codes={codes} loading={codesLoading} preview={preview} recipient={content.recipientName} show={stage === "open"} />
                  ) : undefined
                }
              />
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {stage === "sealed" && (
          <motion.button key="tap" className="btn btn-primary open-cta" onClick={open} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }}>
            Tap to open
          </motion.button>
        )}
        {stage === "open" && (
          <motion.div key="cta" className="open-cta" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: brand ? 2.4 : 1.6, duration: 0.6 }} style={{ display: "flex", gap: 10 }}>
            {brand && !book && <button className="btn btn-brand" onClick={() => setSheet(true)}>See your gift</button>}
            <Link href="/send" className={brand && !book ? "btn btn-ghost" : "btn btn-primary"} style={brand && !book ? { background: "rgba(255,255,255,.8)" } : undefined}>Send one back</Link>
          </motion.div>
        )}
        {stage === "open" && brand && gift && !book && (
          <motion.div
            key="gift"
            className="open-gift"
            onClick={() => setSheet(true)}
            initial={{ y: 260, rotate: -8, opacity: 0 }}
            animate={{ y: 0, rotate: -4, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 14, delay: 1.9 }}
          >
            <GiftTile brand={brand} amountCents={gift.amountCents} width={Math.min(250, vp.w * 0.6)} from={plainName(content.senderName)} />
          </motion.div>
        )}
        {sheet && brand && gift && (
          <motion.div key="sheet-bg" className="gift-sheet-bg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)}>
            <motion.div
              className="gift-sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="gift-sheet-grip" />
              <div className="gift-sheet-page">
                <GiftPocket brand={brand} amountCents={gift.amountCents} accent={design.accent} codes={codes} loading={codesLoading} preview={preview} recipient={content.recipientName} show />
              </div>
              <button className="btn btn-ghost" style={{ width: "100%" }} onClick={() => setSheet(false)}>Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Particles effect={design.effect} play={stage === "open"} />

      <style>{`
        .open-stage { position: relative; min-height: 100vh; min-height: 100dvh; overflow: hidden; transition: background-color 1.2s var(--ease-out); }
        .open-caption { position: absolute; top: 9vh; left: 0; right: 0; text-align: center; padding: 0 22px; z-index: 10; }
        .open-center { position: absolute; left: 50%; top: 52%; }
        .open-env { position: absolute; transform-origin: center; translate: -50% -50%; z-index: 3; }
        .open-card-layer { position: absolute; left: 0; top: 0; translate: -50% -50%; z-index: 6; }
        .open-card-layer .ks-card-stage { margin: 0; }
        .open-gift { position: absolute; right: max(24px, calc(50% - ${book ? w * 1.25 : w * 0.7}px)); bottom: 14vh; z-index: 35; }
        @media (max-width: 760px) { .open-gift { right: 50%; translate: 50% 0; bottom: 15vh; } }
        .gift-sheet-bg { position: fixed; inset: 0; z-index: 60; background: rgba(0,0,0,.35); display: flex; align-items: flex-end; justify-content: center; }
        .gift-sheet { width: min(440px, 100%); background: #fffdf8; border-radius: 22px 22px 0 0; padding: 10px 16px calc(16px + env(safe-area-inset-bottom)); box-shadow: 0 -10px 40px rgba(0,0,0,.2); }
        .gift-sheet-grip { width: 40px; height: 5px; border-radius: 3px; background: #d2d2d7; margin: 0 auto 6px; }
        .gift-sheet-page { position: relative; container-type: inline-size; aspect-ratio: 5 / 6; }
        .open-cta { position: absolute; bottom: 7vh; left: 50%; translate: -50% 0; z-index: 40; }
      `}</style>
    </div>
  );
}

