"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { CardArt } from "../CardArt";
import { Envelope } from "../Envelope";
import type { Design } from "@/lib/designs";
import type { PublicCard } from "@/lib/cards";
import { useViewport } from "@/lib/useViewport";
import { sealLetter } from "@/lib/names";
import { SendJourney } from "../journey/SendJourney";

type Phase = "drop" | "close" | "seal" | "fly" | "journey" | "done";

/** The card slides into its envelope, the flap folds, the seal presses down, and off it goes. */
export function SendOff({
  design,
  content,
  result,
  edited,
  envelope,
  liner,
}: {
  design: Design;
  envelope: string;
  liner: string;
  content: { senderName: string; recipientName: string };
  result: { status: "pending" | "scheduled"; card: PublicCard };
  edited: boolean;
}) {
  const vp = useViewport();
  const [phase, setPhase] = useState<Phase>("drop");
  const w = Math.min(220, vp.w * 0.45);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return setPhase("done");
    const t = [
      setTimeout(() => setPhase("close"), 1100),
      setTimeout(() => setPhase("seal"), 1800),
      setTimeout(() => setPhase("fly"), 2700),
      setTimeout(() => setPhase(edited ? "done" : "journey"), 3400),
    ];
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const when = new Date(result.card.sendAt).toLocaleString("en-CA", {
    timeZone: result.card.timezone,
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const now = result.card.sendAt <= Date.now() + 60_000;
  const letter = sealLetter(content.senderName);

  if (phase === "journey") return <SendJourney recipientName={content.recipientName} seal={design.accent} onDone={() => setPhase("done")} />;

  return (
    <div style={{ minHeight: "calc(100vh - 52px)", display: "grid", placeItems: "center", padding: "40px 22px", overflow: "hidden" }}>
      {phase !== "done" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={phase === "fly" ? { y: -vp.h, x: vp.w * 0.25, rotate: -14, scale: 0.55, opacity: 0.9 } : { opacity: 1, scale: 1, y: 0 }}
          transition={phase === "fly" ? { duration: 0.85, ease: [0.55, 0, 0.75, 0.3] } : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <Envelope design={design} width={w} color={envelope} liner={liner} label={phase === "drop" ? undefined : content.recipientName} flapOpen={phase === "drop"} seal={phase === "seal" || phase === "fly"} sealLetter={letter}>
            <div className="ks-env-card" style={{ transform: "translate(-50%, -50%)" }}>
              <motion.div
                initial={{ y: -w * 1.25, rotate: -90 }}
                animate={{ y: phase === "drop" ? [-w * 1.25, -w * 1.25, w * 0.02] : w * 0.02, rotate: -90 }}
                transition={{ duration: 1, times: [0, 0.3, 1], ease: [0.65, 0, 0.35, 1] }}
                style={{ width: w * 0.94, aspectRatio: "5 / 7", borderRadius: 4, overflow: "hidden", boxShadow: "0 4px 14px rgba(0,0,0,.12)" }}
              >
                <CardArt design={design} />
              </motion.div>
            </div>
          </Envelope>
        </motion.div>
      ) : (
        <motion.div className="center" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }} style={{ maxWidth: 560 }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 400, damping: 18, delay: 0.1 }} style={{ width: 72, height: 72, borderRadius: "50%", background: design.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, margin: "0 auto 24px", fontFamily: "var(--font-display)" }}>
            {letter}
          </motion.div>
          {result.status === "pending" ? (
            <>
              <h1 className="display display-m">Sealed. One more tap.</h1>
              <p className="lede" style={{ margin: "14px 0 30px" }}>
                We emailed you a link to confirm it&apos;s you. Tap it and your card to {result.card.recipientName} {now ? "goes out right away" : `arrives ${when}`}.
              </p>
              <Link href="/" className="btn btn-ghost">Back to home</Link>
            </>
          ) : (
            <>
              <h1 className="display display-m">{edited ? "Changes saved." : now ? "On its way." : "Sealed and scheduled."}</h1>
              <p className="lede" style={{ margin: "14px 0 30px" }}>
                {now ? `${result.card.recipientName} will have it in a moment.` : `${result.card.recipientName} gets it ${when}.`} We&apos;ve emailed your receipt and we&apos;ll let you know when it lands.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <Link href="/cards" className="btn btn-primary">See your cards</Link>
                <a href="/send" className="btn btn-ghost">Write another</a>
              </div>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
