"use client";

import { useEffect, useState } from "react";
import { useViewport } from "@/lib/useViewport";
import { AnimatePresence, motion } from "motion/react";
import { Backdrop, CARRIER, Cloud, GROUND, HomeMailbox, House, Letter, Plane, Person, StreetBox, Truck } from "./parts";

/** Runs callbacks at set times after mount and cleans up. */
function useTimeline(steps: [number, () => void][]) {
  useEffect(() => {
    const t = steps.map(([ms, fn]) => setTimeout(fn, ms));
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

const EASE = [0.65, 0, 0.35, 1] as const;

/* 1. The card goes into the street box; the carrier collects it and walks off. 6.4 s */
function Street({ seal }: { seal: string }) {
  const [walking, setWalking] = useState(false);
  const [door, setDoor] = useState(false);
  const [carrying, setCarrying] = useState(false);
  const [x, setX] = useState(-80);
  useTimeline([
    [1500, () => { setWalking(true); setX(372); }],
    [3400, () => setWalking(false)],
    [3550, () => setDoor(true)],
    [4050, () => setCarrying(true)],
    [4350, () => setDoor(false)],
    [4650, () => { setWalking(true); setX(940); }],
  ]);
  return (
    <>
      <Backdrop sky={["#CFE3F2", "#EAF3FA"]} ground="#9AA3AD" horizon="#B8C0C8" />
      <rect x={-2000} y={GROUND} width={4800} height={14} fill="#C9CED6" />
      {[[80, 230, 120], [190, 180, 160], [640, 200, 150], [740, 250, 110]].map(([x, top, w], i) => (
        <rect key={i} x={x - w / 2} y={top} width={w} height={GROUND - 30 - top} fill={i % 2 ? "#B9C6D3" : "#C7D2DD"} />
      ))}
      <g transform={`translate(430 ${GROUND})`}><StreetBox doorOpen={door} /></g>
      <motion.g
        initial={{ x: 140, y: 70, rotate: -24, scale: 1.5, opacity: 0 }}
        animate={{ x: [140, 300, 430, 430], y: [70, 90, 290, 304], rotate: [-24, -8, 0, 0], scale: [1.2, 0.9, 0.45, 0.45], opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.4, times: [0, 0.35, 0.8, 1], ease: "easeInOut" }}
      >
        <Letter seal={seal} />
      </motion.g>
      <motion.g initial={{ x: -80 }} animate={{ x }} transition={{ duration: carrying ? 1.8 : 1.9, ease: "linear" }} style={{ y: GROUND }}>
        <Person look={CARRIER} walking={walking} holding={carrying ? <g transform="scale(.6)"><Letter seal={seal} /></g> : undefined} />
      </motion.g>
    </>
  );
}

/* 2. Across the sky. 2.6 s */
function Flight() {
  return (
    <>
      <Backdrop sky={["#6FA8DC", "#CFE3F2"]} ground="#CFE3F2" />
      {[[120, 120, 1], [420, 80, 1.3], [700, 160, 0.9], [300, 300, 1.4], [620, 360, 1.1], [900, 260, 1]].map(([x, y, s], i) => (
        <motion.g key={i} initial={{ x: 0 }} animate={{ x: -260 - i * 30 }} transition={{ duration: 2.8, ease: "linear" }}>
          <Cloud x={x} y={y} s={s} o={0.9} />
        </motion.g>
      ))}
      <motion.g initial={{ x: -180, y: 360, rotate: -10 }} animate={{ x: 980, y: 120, rotate: -6 }} transition={{ duration: 2.6, ease: "easeIn" }}>
        <Plane />
      </motion.g>
    </>
  );
}

/* 3. Touchdown on the runway. 3 s */
function Landing() {
  return (
    <>
      <Backdrop sky={["#F6C9A8", "#FBE7D6"]} ground="#7C8590" horizon="#C9B8A6" />
      <rect x={-2000} y={GROUND + 30} width={4800} height={6} fill="#fff" opacity={0.7} />
      {Array.from({ length: 14 }, (_, i) => <rect key={i} x={-200 + i * 90} y={GROUND + 60} width={50} height={6} fill="#fff" />)}
      <Cloud x={160} y={110} s={0.9} o={0.8} />
      <Cloud x={620} y={80} s={1.2} o={0.8} />
      <motion.g
        initial={{ x: -180, y: 90, rotate: 9 }}
        animate={{ x: [-180, 380, 520, 600], y: [90, GROUND - 36, GROUND - 38, GROUND - 36], rotate: [9, 2, -1, 0] }}
        transition={{ duration: 2.8, times: [0, 0.62, 0.8, 1], ease: "easeOut" }}
      >
        <g>
          <rect x={-56} y={18} width={4} height={14} fill="#555" />
          <rect x={78} y={18} width={4} height={14} fill="#555" />
          <circle cx={-54} cy={32} r={6} fill="#22252A" />
          <circle cx={80} cy={32} r={6} fill="#22252A" />
        </g>
        <Plane />
      </motion.g>
      <motion.g initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: [0, 0.8, 0], scale: [0.4, 1.4, 1.8] }} transition={{ delay: 1.7, duration: 0.8 }} style={{ x: 360, y: GROUND - 4 }}>
        <ellipse rx={40} ry={10} fill="#E8E2D8" />
      </motion.g>
    </>
  );
}

/* 4. The truck pulls up, the card goes in the mailbox, the flag goes up. 4.6 s */
function Delivery({ seal }: { seal: string }) {
  const [driving, setDriving] = useState(true);
  const [stage, setStage] = useState<"in" | "drop" | "flag" | "out">("in");
  useTimeline([
    [1400, () => { setDriving(false); setStage("drop"); }],
    [2300, () => setStage("flag")],
    [3000, () => { setDriving(true); setStage("out"); }],
  ]);
  return (
    <>
      <Backdrop sky={["#BFE0F5", "#EAF5FC"]} ground="#8CC084" horizon="#A8D49D" />
      <rect x={-2000} y={GROUND + 18} width={4800} height={46} fill="#8A929B" />
      <Cloud x={140} y={90} s={1} o={0.9} />
      <Cloud x={660} y={70} s={0.8} o={0.9} />
      <g transform={`translate(240 ${GROUND})`}><House doorOpen={false} /></g>
      <g transform={`translate(600 ${GROUND + 14})`}><HomeMailbox open={stage === "drop"} flagUp={stage === "flag" || stage === "out"} /></g>
      <motion.g
        initial={{ x: -260 }}
        animate={{ x: stage === "out" ? 1160 : 430 }}
        transition={stage === "out" ? { duration: 1.6, ease: "easeIn" } : { duration: 1.4, ease: "easeOut" }}
        style={{ y: GROUND + 50 }}
      >
        <Truck driving={driving} />
      </motion.g>
      {stage === "drop" && (
        <motion.g initial={{ x: 520, y: GROUND - 50, scale: 0.6 }} animate={{ x: [520, 560, 592], y: [GROUND - 50, GROUND - 120, GROUND - 52], scale: [0.6, 0.55, 0.25], opacity: [1, 1, 0] }} transition={{ duration: 0.8, ease: "easeInOut" }}>
          <Letter seal={seal} />
        </motion.g>
      )}
    </>
  );
}

/** Tall phones zoom in on the middle of the scene; wide screens see more of it. */
export function useFraming() {
  const vp = useViewport();
  const aspect = vp.w / Math.max(1, vp.h);
  return aspect < 0.8 ? "170 70 460 440" : aspect < 1.3 ? "90 60 620 450" : "20 40 760 450";
}

const SCENES = [
  { id: "street", ms: 6400 },
  { id: "flight", ms: 2600 },
  { id: "landing", ms: 3000 },
  { id: "delivery", ms: 4400 },
] as const;

/**
 * After paying: the card is posted in a street box, collected, flown across
 * the country, landed, and delivered to a mailbox. Calls onDone at the end
 * (or right away for reduced motion, or when skipped).
 */
export function SendJourney({ recipientName, seal, onDone }: { recipientName: string; seal: string; onDone: () => void }) {
  const [i, setI] = useState(0);
  const scene = SCENES[i]?.id;
  const box = useFraming();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return onDone();
    let at = 0;
    const t = SCENES.map((s, n) => {
      at += s.ms;
      return setTimeout(() => (n === SCENES.length - 1 ? onDone() : setI(n + 1)), at);
    });
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const captions: Record<string, string> = {
    street: "Posted",
    flight: "Up, up and away",
    landing: "Touchdown",
    delivery: `Special delivery for ${recipientName}`,
  };

  return (
    <div className="journey">
      <AnimatePresence mode="wait">
        <motion.p key={scene} className="journey-cap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
          {captions[scene]}
        </motion.p>
      </AnimatePresence>
      <motion.svg key={scene} viewBox={box} preserveAspectRatio="xMidYMid meet" className="journey-svg" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, ease: EASE }}>
        {scene === "street" && <Street seal={seal} />}
        {scene === "flight" && <Flight />}
        {scene === "landing" && <Landing />}
        {scene === "delivery" && <Delivery seal={seal} />}
      </motion.svg>
      <div className="journey-dots" aria-hidden>
        {SCENES.map((s, n) => <span key={s.id} className={n <= i ? "on" : ""} />)}
      </div>
      <button className="journey-skip" onClick={onDone}>Skip</button>
      <style>{`
        .journey { position: relative; height: calc(100vh - 52px); height: calc(100dvh - 52px); overflow: hidden; background: #EAF3FA; }
        .journey-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
        .journey-cap { position: absolute; top: 7%; left: 0; right: 0; z-index: 2; text-align: center; margin: 0; padding: 0 22px; font-family: var(--font-display); font-weight: 700; letter-spacing: -0.03em; font-size: clamp(26px, 4.5vw, 44px); color: var(--ink); text-shadow: 0 1px 0 rgba(255,255,255,.6); }
        .journey-dots { position: absolute; bottom: 28px; left: 50%; translate: -50% 0; display: flex; gap: 8px; z-index: 2; }
        .journey-dots span { width: 8px; height: 8px; border-radius: 50%; background: rgba(0,0,0,.18); transition: background .3s, width .3s; }
        .journey-dots span.on { background: var(--ink); }
        .journey-skip { position: absolute; bottom: 18px; right: 18px; z-index: 2; border: 0; background: rgba(255,255,255,.75); backdrop-filter: blur(8px); border-radius: 980px; padding: 8px 16px; font-size: 14px; font-weight: 600; cursor: pointer; }
      `}</style>
    </div>
  );
}
