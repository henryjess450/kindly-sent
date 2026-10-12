"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useFraming } from "./SendJourney";
import { Backdrop, Cloud, GROUND, HomeMailbox, House, Letter, NEIGHBOUR, Person } from "./parts";

/**
 * Before the envelope: the recipient steps out of their house, walks to the
 * mailbox, takes the card out and carries it back inside.
 */
export function MailboxIntro({ recipientName, seal, onDone }: { recipientName: string; seal: string; onDone: () => void }) {
  const [door, setDoor] = useState(false);
  const [here, setHere] = useState(false);
  const [walking, setWalking] = useState(false);
  const [x, setX] = useState(250);
  const [face, setFace] = useState<1 | -1>(1);
  const [boxOpen, setBoxOpen] = useState(false);
  const [flag, setFlag] = useState(true);
  const [holding, setHolding] = useState(false);
  const [found, setFound] = useState(false);
  const box = useFraming();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return onDone();
    const steps: [number, () => void][] = [
      [500, () => setDoor(true)],
      [800, () => setHere(true)],
      [1000, () => { setWalking(true); setX(566); }],
      [2900, () => setWalking(false)],
      [3050, () => setBoxOpen(true)],
      [3450, () => { setHolding(true); setFound(true); setFlag(false); }],
      [3800, () => setBoxOpen(false)],
      [4000, () => { setFace(-1); setWalking(true); setX(250); }],
      [5900, () => { setWalking(false); setHere(false); }],
      [6200, () => setDoor(false)],
      [6800, onDone],
    ];
    const t = steps.map(([ms, fn]) => setTimeout(fn, ms));
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mbintro">
      <AnimatePresence mode="wait">
        <motion.p key={found ? "b" : "a"} className="mbintro-cap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
          {found ? `A card for ${recipientName}` : "Something's in the mailbox"}
        </motion.p>
      </AnimatePresence>
      <svg viewBox={box} preserveAspectRatio="xMidYMid meet" className="mbintro-svg">
        <Backdrop sky={["#BFE0F5", "#EAF5FC"]} ground="#8CC084" horizon="#A8D49D" />
        <rect x={-2000} y={GROUND + 18} width={4800} height={46} fill="#8A929B" />
        <path d={`M228 ${GROUND} L272 ${GROUND} L300 ${GROUND + 18} L200 ${GROUND + 18} Z`} fill="#C9B79C" />
        <Cloud x={130} y={90} s={1} o={0.9} />
        <Cloud x={640} y={80} s={0.8} o={0.9} />
        <g transform={`translate(250 ${GROUND})`}><House doorOpen={door} /></g>
        <g transform={`translate(600 ${GROUND + 14})`}><HomeMailbox open={boxOpen} flagUp={flag} /></g>
        <motion.g initial={{ x: 250, opacity: 0 }} animate={{ x, opacity: here ? 1 : 0 }} transition={{ x: { duration: 1.9, ease: "linear" }, opacity: { duration: 0.3 } }} style={{ y: GROUND + 6 }}>
          <Person look={NEIGHBOUR} walking={walking} face={face} holding={holding ? <g transform="scale(.6)"><Letter seal={seal} /></g> : undefined} />
        </motion.g>
      </svg>
      <button className="journey-skip" onClick={(e) => { e.stopPropagation(); onDone(); }}>Skip</button>
      <style>{`
        .mbintro { position: absolute; inset: 0; z-index: 30; background: #EAF5FC; overflow: hidden; }
        .mbintro-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .mbintro-cap { position: absolute; top: 9vh; left: 0; right: 0; z-index: 2; text-align: center; margin: 0; padding: 0 22px; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.03em; font-size: clamp(26px, 4.5vw, 44px); color: var(--ink); }
        .journey-skip { position: absolute; bottom: 18px; right: 18px; z-index: 2; border: 0; background: rgba(255,255,255,.75); backdrop-filter: blur(8px); border-radius: 980px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
}
