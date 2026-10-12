"use client";

import { useId } from "react";

// Illustrated pieces for the mail journey: everyone and everything is drawn
// with its origin at the bottom centre (feet, wheels on the ground), so a
// scene can place them by x along the ground line.

export const GROUND = 400;

/** A sealed envelope, centred on 0,0. */
export function Letter({ seal = "#E5484D", paper = "#FFFDF6", w = 56 }: { seal?: string; paper?: string; w?: number }) {
  const h = w * 0.66;
  return (
    <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={3} fill={paper} stroke="#00000022" />
      <path d={`M${-w / 2} ${-h / 2} L0 ${h * 0.08} L${w / 2} ${-h / 2}`} fill="none" stroke="#00000030" strokeWidth={1.5} />
      <circle cx={0} cy={h * 0.06} r={w * 0.09} fill={seal} />
    </g>
  );
}

/**
 * A red street mailbox: a big box on a dark plinth, a pull-down slot up top,
 * a blue band, and postal codes scattered across it.
 */
export function StreetBox({ doorOpen }: { doorOpen: boolean }) {
  const id = useId().replace(/:/g, "");
  const codes = ["V8W", "K1A", "M5V", "H3B", "T2P", "B3H", "R3C", "S4P", "V6B", "E1C", "C1A", "A1C", "X1A", "Y1A", "J8Y", "L4K", "N2L", "P3E"];
  return (
    <g>
      <rect x={-62} y={-44} width={124} height={44} rx={3} fill="#3A3F45" />
      {[-48, -32, -16, 0, 16, 32, 48].map((x) => <rect key={x} x={x - 3} y={-40} width={6} height={36} rx={2} fill="#2C3035" />)}
      <path d="M-72 -44 V-196 Q-72 -214 -54 -214 H54 Q72 -214 72 -196 V-44 Z" fill="#D7262E" />
      <clipPath id={`${id}-box`}><path d="M-72 -44 V-196 Q-72 -214 -54 -214 H54 Q72 -214 72 -196 V-44 Z" /></clipPath>
      <g clipPath={`url(#${id}-box)`} opacity={0.3}>
        {codes.map((c, i) => (
          <text key={c} x={-80 + ((i * 37) % 160)} y={-60 - ((i * 23) % 140)} fill={i % 3 ? "#F5F7FA" : "#1F3A8A"} fontSize={9 + (i % 4) * 2.5} fontWeight={800} transform={`rotate(${(i % 2 ? 90 : 0) - 8} ${-80 + ((i * 37) % 160)} ${-60 - ((i * 23) % 140)})`} style={{ fontFamily: "var(--font-display)" }}>
            {c}
          </text>
        ))}
      </g>
      <path d="M-66 -206 H66 V-188 H-66 Z" fill="#B71C24" />
      <rect x={-50} y={-202} width={100} height={8} rx={4} fill="#5B1014" />
      <rect x={-66} y={-176} width={132} height={30} fill="#1F3A8A" />
      <text x={-60} y={-156} fill="#fff" fontSize={11} fontWeight={800} letterSpacing={1.5} style={{ fontFamily: "var(--font-display)" }}>MAIL</text>
      <text x={17} y={-156} fill="#fff" fontSize={11} fontWeight={800} letterSpacing={1.5} style={{ fontFamily: "var(--font-display)" }}>POSTE</text>
      <circle cx={0} cy={-161} r={11} fill="#D7262E" stroke="#fff" strokeWidth={2} />
      <path d="M-6 -164 L6 -160 L-6 -156 Z" fill="#fff" />
      {/* Collection door: swings open when the carrier empties the box. */}
      <rect x={-46} y={-132} width={92} height={74} rx={4} fill="#00000025" />
      <g style={{ transformBox: "fill-box", transformOrigin: "0% 50%", transform: doorOpen ? "scaleX(0.15)" : "scaleX(1)", transition: "transform .45s cubic-bezier(.65,0,.35,1)" }}>
        <rect x={-46} y={-132} width={92} height={74} rx={4} fill="#C81F27" stroke="#00000022" />
        <rect x={30} y={-100} width={8} height={14} rx={3} fill="#E8E8ED" />
      </g>
    </g>
  );
}

type PersonLook = { skin: string; top: string; legs: string; hair?: string; cap?: string; bag?: boolean };
export const CARRIER: PersonLook = { skin: "#C98B62", top: "#1F3A8A", legs: "#1B2440", cap: "#1F3A8A", bag: true };
export const NEIGHBOUR: PersonLook = { skin: "#E8B48F", top: "#E5484D", legs: "#3A4A6B", hair: "#4A3020" };

/** Feet at 0,0. `walking` swings the arms and legs; `face` flips them to walk left. */
export function Person({ look, walking, face = 1, holding }: { look: PersonLook; walking: boolean; face?: 1 | -1; holding?: React.ReactNode }) {
  const run = walking ? "running" : "paused";
  const limb = (delay: number, origin: string) => ({ animation: `ks-walk .62s ease-in-out ${delay}s infinite`, animationPlayState: run, transformBox: "fill-box" as const, transformOrigin: origin });
  return (
    <g transform={`scale(${face} 1)`}>
      <g style={{ animation: "ks-step .31s ease-in-out infinite", animationPlayState: run }}>
        <ellipse cx={0} cy={0} rx={22} ry={4} fill="#00000018" />
        <g style={limb(-0.31, "50% 0%")}><rect x={-9} y={-52} width={9} height={50} rx={4} fill={look.legs} /><rect x={-11} y={-6} width={15} height={6} rx={3} fill="#222" /></g>
        <g style={limb(0, "50% 0%")}><rect x={1} y={-52} width={9} height={50} rx={4} fill={look.legs} /><rect x={-1} y={-6} width={15} height={6} rx={3} fill="#222" /></g>
        <g style={limb(0, "50% 0%")}><rect x={-15} y={-100} width={8} height={40} rx={4} fill={look.top} /></g>
        <rect x={-14} y={-104} width={28} height={56} rx={10} fill={look.top} />
        {look.bag && (
          <>
            <path d="M-12 -100 L12 -62" stroke="#6B4423" strokeWidth={4} />
            <rect x={6} y={-70} width={22} height={20} rx={4} fill="#8B5A2B" />
            <rect x={6} y={-70} width={22} height={7} rx={3} fill="#6B4423" />
          </>
        )}
        <rect x={-4} y={-112} width={8} height={10} fill={look.skin} />
        <circle cx={0} cy={-124} r={14} fill={look.skin} />
        <circle cx={6} cy={-126} r={1.6} fill="#222" />
        {look.hair && <path d="M-14 -126 Q-14 -142 0 -142 Q14 -142 14 -128 Q6 -136 -6 -132 Q-12 -130 -14 -126 Z" fill={look.hair} />}
        {look.cap && (
          <>
            <path d="M-14 -128 Q-14 -142 0 -142 Q14 -142 14 -128 Z" fill={look.cap} />
            <rect x={4} y={-131} width={16} height={4} rx={2} fill="#14254F" />
          </>
        )}
        <g style={limb(-0.31, "50% 0%")}>
          <rect x={7} y={-100} width={8} height={40} rx={4} fill={look.top} />
          <circle cx={11} cy={-60} r={4.5} fill={look.skin} />
          {holding && <g transform="translate(16 -60)">{holding}</g>}
        </g>
      </g>
    </g>
  );
}

/** A passenger plane facing right, centred on its body. */
export function Plane() {
  return (
    <g>
      <path d="M-120 -6 Q-128 -40 -112 -44 L-92 -10 Z" fill="#E5484D" />
      <path d="M-130 4 Q-130 -14 -100 -14 H86 Q124 -14 132 4 Q124 20 86 20 H-100 Q-130 20 -130 4 Z" fill="#FBFBFD" />
      <path d="M-120 8 H120 Q114 16 86 16 H-100 Q-118 16 -120 8 Z" fill="#1F3A8A" />
      {[-70, -50, -30, -10, 10, 30, 50].map((x) => <rect key={x} x={x} y={-6} width={10} height={8} rx={3} fill="#9FB8D9" />)}
      <path d="M102 -8 Q118 -8 124 0 H104 Z" fill="#1F2A3A" />
      <path d="M-20 10 L-60 52 H-38 L22 12 Z" fill="#D9DEE6" />
      <path d="M-118 2 L-136 22 H-122 L-104 4 Z" fill="#D9DEE6" />
    </g>
  );
}

/** A delivery van facing right. Wheels turn while it drives. */
export function Truck({ driving }: { driving: boolean }) {
  const wheel = { animation: "ks-spin .5s linear infinite", animationPlayState: driving ? "running" : "paused", transformBox: "fill-box" as const, transformOrigin: "center" };
  return (
    <g>
      <ellipse cx={0} cy={0} rx={110} ry={6} fill="#00000018" />
      <rect x={-110} y={-120} width={150} height={100} rx={8} fill="#FBFBFD" stroke="#00000014" />
      <rect x={-110} y={-62} width={150} height={14} fill="#D7262E" />
      <rect x={-110} y={-48} width={150} height={6} fill="#1F3A8A" />
      <text x={-35} y={-80} textAnchor="middle" fill="#1F3A8A" fontSize={20} fontWeight={800} letterSpacing={2} style={{ fontFamily: "var(--font-display)" }}>MAIL</text>
      <path d="M40 -96 H78 Q92 -96 98 -80 L110 -50 V-20 H40 Z" fill="#D7262E" />
      <path d="M50 -88 H76 Q84 -88 88 -78 L96 -58 H50 Z" fill="#BFD7EE" />
      <rect x={100} y={-34} width={12} height={8} rx={2} fill="#FFD27A" />
      {[-70, 72].map((x) => (
        <g key={x} transform={`translate(${x} -18)`}>
          <g style={wheel}>
            <circle r={18} fill="#22252A" />
            <circle r={8} fill="#C9CED6" />
            <rect x={-1.5} y={-8} width={3} height={16} fill="#8A9099" />
          </g>
        </g>
      ))}
    </g>
  );
}

/** A curbside mailbox on a post; its door opens and its flag goes up or down. */
export function HomeMailbox({ open, flagUp }: { open: boolean; flagUp: boolean }) {
  return (
    <g>
      <rect x={-5} y={-92} width={10} height={92} fill="#6B4423" />
      <path d="M-34 -92 V-120 Q-34 -138 0 -138 Q34 -138 34 -120 V-92 Z" fill="#2F6FEB" />
      <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: flagUp ? "rotate(0deg)" : "rotate(90deg)", transition: "transform .5s cubic-bezier(.34,1.56,.64,1)" }}>
        <rect x={34} y={-140} width={5} height={34} fill="#E5484D" />
        <rect x={34} y={-140} width={16} height={11} fill="#E5484D" />
      </g>
      <g style={{ transformBox: "fill-box", transformOrigin: "50% 100%", transform: open ? "rotateX(70deg) scaleY(.3)" : "none", transition: "transform .4s cubic-bezier(.65,0,.35,1)" }}>
        <path d="M-36 -92 V-118 Q-36 -134 -24 -136 V-92 Z" fill="#1F55C9" />
      </g>
    </g>
  );
}

/** A small house with a door that opens. The door's left edge sits at x = -30. */
export function House({ doorOpen, roof = "#8E3B2E", wall = "#F4E4D0" }: { doorOpen: boolean; roof?: string; wall?: string }) {
  return (
    <g>
      <rect x={-130} y={-170} width={260} height={170} fill={wall} />
      <path d="M-150 -168 L0 -270 L150 -168 Z" fill={roof} />
      <rect x={60} y={-260} width={28} height={50} fill="#7A3226" />
      <rect x={-104} y={-138} width={56} height={48} rx={4} fill="#BFD7EE" stroke="#fff" strokeWidth={5} />
      <rect x={52} y={-138} width={56} height={48} rx={4} fill="#FFE7A6" stroke="#fff" strokeWidth={5} />
      <rect x={-30} y={-104} width={60} height={104} rx={4} fill="#2B1D14" />
      <g style={{ transformBox: "fill-box", transformOrigin: "0% 50%", transform: doorOpen ? "scaleX(0.12)" : "scaleX(1)", transition: "transform .5s cubic-bezier(.65,0,.35,1)" }}>
        <rect x={-30} y={-104} width={60} height={104} rx={4} fill="#3F6E4E" />
        <circle cx={18} cy={-50} r={4} fill="#E8C66A" />
      </g>
      <rect x={-46} y={-4} width={92} height={8} rx={3} fill="#C9B79C" />
    </g>
  );
}

export function Cloud({ x, y, s = 1, o = 1 }: { x: number; y: number; s?: number; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <ellipse cx={0} cy={0} rx={50} ry={22} fill="#fff" />
      <ellipse cx={-26} cy={-6} rx={26} ry={20} fill="#fff" />
      <ellipse cx={20} cy={-14} rx={30} ry={24} fill="#fff" />
    </g>
  );
}

/** Wide ground and sky so the scene fills any screen shape. */
export function Backdrop({ sky, ground, horizon }: { sky: [string, string]; ground: string; horizon?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <>
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky[0]} />
          <stop offset="1" stopColor={sky[1]} />
        </linearGradient>
      </defs>
      <rect x={-2000} y={-2000} width={4800} height={2000 + GROUND} fill={`url(#${id}-sky)`} />
      {horizon && <rect x={-2000} y={GROUND - 30} width={4800} height={30} fill={horizon} />}
      <rect x={-2000} y={GROUND} width={4800} height={2000} fill={ground} />
    </>
  );
}
