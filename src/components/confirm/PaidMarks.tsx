"use client";

import { motion } from "motion/react";

// Payment-confirmed animations for the top of the confirmation page.
// Each plays once on mount and settles into a still badge.

export type PaidProps = { amount: string; accent: string; to: string; date: string };

const SPRING = { type: "spring", stiffness: 420, damping: 16 } as const;

/** 1. A postage stamp thunks down; a PAID postmark presses over its corner. */
export function StampMark({ amount, accent, to }: PaidProps) {
  return (
    <svg viewBox="0 0 240 200" width={240} height={200} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <motion.g initial={{ y: -140, rotate: -18, scale: 1.4, opacity: 0 }} animate={{ y: 0, rotate: -6, scale: 1, opacity: 1 }} transition={{ ...SPRING, stiffness: 300, damping: 14 }} style={{ transformOrigin: "120px 100px" }}>
        <rect x={62} y={30} width={116} height={140} fill="#fff" style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,.18))" }} />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <circle cx={66 + i * 13.5} cy={30} r={4} fill="var(--bg)" />
            <circle cx={66 + i * 13.5} cy={170} r={4} fill="var(--bg)" />
          </g>
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <g key={i}>
            <circle cx={62} cy={36 + i * 14.5} r={4} fill="var(--bg)" />
            <circle cx={178} cy={36 + i * 14.5} r={4} fill="var(--bg)" />
          </g>
        ))}
        <rect x={74} y={42} width={92} height={116} fill={accent} />
        <path d="M120 82 C 100 66, 88 84, 104 98 L120 112 L136 98 C 152 84, 140 66, 120 82 Z" fill="#fff" />
        <text x={120} y={142} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={800} style={{ fontFamily: "var(--font-display)" }}>{amount}</text>
      </motion.g>
      <motion.g initial={{ scale: 2.2, opacity: 0 }} animate={{ scale: 1, opacity: 0.85 }} transition={{ delay: 0.55, duration: 0.22, ease: [0.5, 0, 0.75, 0] }} style={{ transformOrigin: "176px 52px" }}>
        <circle cx={176} cy={52} r={40} fill="none" stroke="#1F3A8A" strokeWidth={3} />
        <circle cx={176} cy={52} r={32} fill="none" stroke="#1F3A8A" strokeWidth={1.5} />
        <text x={176} y={58} textAnchor="middle" fill="#1F3A8A" fontSize={18} fontWeight={900} letterSpacing={2} style={{ fontFamily: "var(--font-display)" }} transform="rotate(-12 176 52)">PAID</text>
        {[0, 1, 2].map((i) => <path key={i} d={`M214 ${40 + i * 10} q 8 -5 16 0 t 16 0`} fill="none" stroke="#1F3A8A" strokeWidth={2} />)}
      </motion.g>
      <motion.text x={120} y={196} textAnchor="middle" fontSize={13} fill="var(--ink-3)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>to {to}</motion.text>
    </svg>
  );
}

/** 2. A receipt prints out of a slot line by line, then tears free. */
export function ReceiptMark({ amount, accent, to, date }: PaidProps) {
  const lines = [["Card for", to], ["Delivery", date], ["Total", amount]];
  return (
    <div style={{ width: 240, margin: "0 auto", position: "relative" }}>
      <div style={{ height: 14, borderRadius: 7, background: "var(--ink)", position: "relative", zIndex: 2 }} />
      <motion.div
        initial={{ y: -230, clipPath: "inset(230px 0 0 0)" }}
        animate={{ y: [-230, -150, -150, -70, -70, 0, 0, 12], clipPath: ["inset(230px 0 0 0)", "inset(150px 0 0 0)", "inset(150px 0 0 0)", "inset(70px 0 0 0)", "inset(70px 0 0 0)", "inset(0px 0 0 0)", "inset(0px 0 0 0)", "inset(0px 0 0 0)"] }}
        transition={{ duration: 1.8, times: [0, 0.18, 0.3, 0.48, 0.6, 0.78, 0.88, 1], ease: "easeOut" }}
        style={{ margin: "-6px 12px 0", background: "#FFFDF6", padding: "18px 18px 22px", boxShadow: "0 1px 0 rgba(0,0,0,.06), 0 10px 24px rgba(0,0,0,.14)", fontFamily: "var(--font-type)", fontSize: 13, color: "#333", maskImage: "linear-gradient(#000 0 0)", position: "relative" }}
      >
        <div style={{ fontWeight: 700, letterSpacing: 2, marginBottom: 12, textAlign: "left" }}>RECEIPT</div>
        {lines.map(([k, v], i) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "4px 0", borderTop: i === 2 ? "1px dashed #bbb" : undefined, fontWeight: i === 2 ? 700 : 400 }}>
            <span>{k}</span>
            <span style={{ textAlign: "right", whiteSpace: "nowrap" }}>{v}</span>
          </div>
        ))}
        <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -10 }} transition={{ ...SPRING, delay: 2 }} style={{ position: "absolute", right: 12, top: 12, background: "#FFFDF6", color: accent, border: `2px solid ${accent}`, borderRadius: 6, padding: "2px 8px", fontWeight: 900, letterSpacing: 2, fontFamily: "var(--font-display)" }}>
          PAID
        </motion.div>
        <svg viewBox="0 0 216 8" preserveAspectRatio="none" style={{ position: "absolute", left: 0, bottom: -7, width: "100%", height: 8 }}>
          <path d={`M0 0 ${Array.from({ length: 18 }, (_, i) => `L${i * 12 + 6} 8 L${i * 12 + 12} 0`).join(" ")} Z`} fill="#FFFDF6" />
        </svg>
      </motion.div>
    </div>
  );
}

/** 3. A wax seal drops and presses; a check draws itself and ripples spread. */
export function SealMark({ amount, accent }: PaidProps) {
  return (
    <svg viewBox="0 0 200 200" width={200} height={200} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      {[0, 1, 2].map((i) => (
        <motion.circle key={i} cx={100} cy={100} r={56} fill="none" stroke={accent} strokeWidth={2} initial={{ scale: 1, opacity: 0 }} animate={{ scale: [1, 1.9], opacity: [0.5, 0] }} transition={{ delay: 0.55 + i * 0.22, duration: 1.1, ease: "easeOut" }} style={{ transformOrigin: "100px 100px" }} />
      ))}
      <motion.g initial={{ y: -90, scale: 1.3, opacity: 0 }} animate={{ y: 0, scale: [1.3, 0.88, 1], opacity: 1 }} transition={{ duration: 0.6, times: [0, 0.75, 1], ease: "easeIn" }} style={{ transformOrigin: "100px 100px" }}>
        <path d="M100 38 C 124 36, 150 46, 158 70 C 168 96, 160 128, 140 146 C 118 166, 82 166, 62 148 C 40 128, 34 96, 44 72 C 52 50, 76 40, 100 38 Z" fill={accent} />
        <circle cx={100} cy={100} r={44} fill="none" stroke="#00000022" strokeWidth={4} />
        <circle cx={100} cy={100} r={50} fill="none" stroke="#ffffff33" strokeWidth={2} />
        <motion.path d="M78 101 L94 117 L124 84" fill="none" stroke="#fff" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.65, duration: 0.45, ease: "easeOut" }} />
      </motion.g>
      <motion.text x={100} y={192} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--ink)" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} style={{ fontFamily: "var(--font-display)" }}>
        {amount} paid
      </motion.text>
    </svg>
  );
}

/** 4. A round postmark with the date presses down; wavy cancel lines sweep across. */
export function PostmarkMark({ amount, accent, date }: PaidProps) {
  const ink = "#1F3A8A";
  return (
    <svg viewBox="0 0 280 180" width={280} height={180} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <rect x={10} y={20} width={260} height={140} rx={8} fill="#FFFDF6" style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,.1))" }} />
      <rect x={196} y={34} width={58} height={70} fill={accent} opacity={0.9} />
      <path d="M225 58 C 213 49, 206 60, 215 68 L225 76 L235 68 C 244 60, 237 49, 225 58 Z" fill="#fff" />
      {[0, 1, 2, 3].map((i) => (
        <motion.path
          key={i}
          d={`M24 ${66 + i * 14} q 12 -7 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0`}
          fill="none"
          stroke={ink}
          strokeWidth={2.5}
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0.9 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.5 + i * 0.07, duration: 0.5, ease: "easeOut" }}
        />
      ))}
      <motion.g initial={{ scale: 1.8, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 0.92, rotate: -8 }} transition={{ duration: 0.25, ease: [0.5, 0, 0.75, 0] }} style={{ transformOrigin: "84px 88px" }}>
        <circle cx={84} cy={88} r={50} fill="#FFFDF6" stroke={ink} strokeWidth={3} />
        <circle cx={84} cy={88} r={40} fill="none" stroke={ink} strokeWidth={1.2} />
        <path id="pm-arc" d="M44 88 A 40 40 0 0 1 124 88" fill="none" />
        <text fill={ink} fontSize={10} fontWeight={800} letterSpacing={2.5} style={{ fontFamily: "var(--font-display)" }}>
          <textPath href="#pm-arc" startOffset="50%" textAnchor="middle">KINDLY SENT</textPath>
        </text>
        <text x={84} y={92} textAnchor="middle" fill={ink} fontSize={13} fontWeight={800} style={{ fontFamily: "var(--font-display)" }}>{date.toUpperCase()}</text>
        <text x={84} y={110} textAnchor="middle" fill={ink} fontSize={11} fontWeight={700} letterSpacing={1.5} style={{ fontFamily: "var(--font-display)" }}>{amount === "FREE" ? "FREE" : `PAID ${amount}`}</text>
      </motion.g>
    </svg>
  );
}

/* ---------- more in the postmark family ---------- */

const POST_INK = "#1F3A8A";
const ENV = "#FFFDF6";
const font = { fontFamily: "var(--font-display)" } as const;

/** The round date stamp, centred on cx, cy. */
function RoundPostmark({ cx, cy, date, amount, ink = POST_INK, r = 46, top = "KINDLY SENT", id }: { cx: number; cy: number; date: string; amount: string; ink?: string; r?: number; top?: string; id: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={ink} strokeWidth={3} />
      <circle cx={cx} cy={cy} r={r - 10} fill="none" stroke={ink} strokeWidth={1.2} />
      <path id={id} d={`M${cx - r + 8} ${cy} A ${r - 8} ${r - 8} 0 0 1 ${cx + r - 8} ${cy}`} fill="none" />
      <text fill={ink} fontSize={9.5} fontWeight={800} letterSpacing={2.4} style={font}>
        <textPath href={`#${id}`} startOffset="50%" textAnchor="middle">{top}</textPath>
      </text>
      <text x={cx} y={cy + 5} textAnchor="middle" fill={ink} fontSize={13} fontWeight={800} style={font}>{date.toUpperCase()}</text>
      <text x={cx} y={cy + 22} textAnchor="middle" fill={ink} fontSize={10} fontWeight={700} letterSpacing={1.5} style={font}>PAID {amount}</text>
    </g>
  );
}

function Waves({ x, y, n = 4, len = 8, ink = POST_INK, delay = 0.5 }: { x: number; y: number; n?: number; len?: number; ink?: string; delay?: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <motion.path
          key={i}
          d={`M${x} ${y + i * 13} ${Array.from({ length: len }, () => "q 12 -7 24 0").join(" ")}`}
          fill="none" stroke={ink} strokeWidth={2.5} strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ delay: delay + i * 0.07, duration: 0.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
}

function HeartStamp({ x, y, accent }: { x: number; y: number; accent: string }) {
  return (
    <g>
      <rect x={x} y={y} width={58} height={70} fill="#fff" />
      <rect x={x + 5} y={y + 5} width={48} height={60} fill={accent} />
      <path d={`M${x + 29} ${y + 26} c -12 -9 -19 2 -10 10 l10 8 l10 -8 c 9 -8 2 -19 -10 -10 Z`} fill="#fff" />
    </g>
  );
}

/** 5. An airmail envelope: striped border, PAR AVION label, then the postmark. */
export function AirmailMark({ amount, accent, to, date }: PaidProps) {
  const stripes = Array.from({ length: 26 }, (_, i) => i);
  return (
    <svg viewBox="0 0 280 180" width={280} height={180} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <motion.g initial={{ y: 30, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 16 }} style={{ transformOrigin: "140px 90px" }}>
        <clipPath id="am-env"><rect x={10} y={20} width={260} height={140} rx={6} /></clipPath>
        <g clipPath="url(#am-env)">
          <rect x={10} y={20} width={260} height={140} fill={ENV} />
          {stripes.map((i) => (
            <path key={i} d={`M${i * 22 - 20} 20 l14 0 l-10 140 l-14 0 Z`} fill={i % 2 ? "#D7262E" : POST_INK} />
          ))}
          <rect x={20} y={30} width={240} height={120} rx={3} fill={ENV} />
        </g>
        <rect x={30} y={40} width={72} height={24} rx={3} fill={POST_INK} />
        <text x={66} y={50} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={800} letterSpacing={1.5} style={font}>PAR AVION</text>
        <text x={66} y={60} textAnchor="middle" fill="#fff" fontSize={8} fontWeight={800} letterSpacing={1.5} style={font}>AIRMAIL</text>
        <text x={50} y={128} fill="#555" fontSize={20} style={{ fontFamily: "var(--font-hand)" }}>{to}</text>
        <path d="M48 134 H170" stroke="#00000022" />
        <HeartStamp x={190} y={38} accent={accent} />
      </motion.g>
      <Waves x={96} y={74} n={3} len={5} delay={0.7} />
      <motion.g initial={{ scale: 1.8, opacity: 0, rotate: -20 }} animate={{ scale: 1, opacity: 0.92, rotate: -10 }} transition={{ delay: 0.45, duration: 0.25, ease: [0.5, 0, 0.75, 0] }} style={{ transformOrigin: "196px 96px" }}>
        <RoundPostmark id="am-arc" cx={196} cy={96} r={40} date={date} amount={amount} />
      </motion.g>
    </svg>
  );
}

/** 6. A postcard: the address writes itself, then the postmark lands on the stamp. */
export function PostcardMark({ amount, accent, to, date }: PaidProps) {
  return (
    <svg viewBox="0 0 280 180" width={280} height={180} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <motion.g initial={{ rotateY: 90, opacity: 0 }} animate={{ rotateY: 0, opacity: 1 }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} style={{ transformOrigin: "140px 90px" }}>
        <rect x={10} y={16} width={260} height={150} rx={4} fill="#FBF6EA" style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,.12))" }} />
        <path d="M140 30 V152" stroke="#00000020" strokeWidth={1.5} />
        <text x={24} y={40} fill="#999" fontSize={8} fontWeight={700} letterSpacing={2} style={font}>POST CARD</text>
        {[0, 1, 2].map((i) => <rect key={i} x={24} y={62 + i * 18} width={96 - i * 18} height={5} rx={2.5} fill="#00000014" />)}
        {[0, 1, 2].map((i) => <path key={i} d={`M154 ${112 + i * 18} H256`} stroke="#00000022" />)}
        <HeartStamp x={198} y={26} accent={accent} />
      </motion.g>
      <motion.text x={156} y={108} fill="#2B2B2B" fontSize={22} style={{ fontFamily: "var(--font-hand)" }} initial={{ clipPath: "inset(0 100% 0 0)" }} animate={{ clipPath: "inset(0 0% 0 0)" }} transition={{ delay: 0.45, duration: 0.7, ease: "linear" }}>
        For {to}
      </motion.text>
      <motion.g initial={{ scale: 1.9, opacity: 0, rotate: -24 }} animate={{ scale: 1, opacity: 0.9, rotate: -12 }} transition={{ delay: 1.15, duration: 0.24, ease: [0.5, 0, 0.75, 0] }} style={{ transformOrigin: "200px 64px" }}>
        <RoundPostmark id="pc-arc" cx={200} cy={64} r={38} date={date} amount={amount} />
      </motion.g>
    </svg>
  );
}

/** 7. A wooden rubber stamp comes down, squashes, lifts, and leaves the postmark behind. */
export function StamperMark({ amount, accent, date }: PaidProps) {
  return (
    <svg viewBox="0 0 280 200" width={280} height={200} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <rect x={10} y={40} width={260} height={140} rx={8} fill={ENV} style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,.1))" }} />
      <HeartStamp x={196} y={54} accent={accent} />
      <motion.g initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 0.92, scale: 1 }} transition={{ delay: 0.62, duration: 0.15 }} style={{ transformOrigin: "110px 112px" }}>
        <RoundPostmark id="st-arc" cx={110} cy={112} r={46} date={date} amount={amount} />
        <Waves x={160} y={92} n={4} len={4} delay={0.7} />
      </motion.g>
      <motion.g
        initial={{ y: -160, opacity: 0 }}
        animate={{ y: [-160, -12, -4, -12, -170], opacity: [0, 1, 1, 1, 0], scaleY: [1, 1, 0.9, 1, 1] }}
        transition={{ duration: 1.3, times: [0, 0.4, 0.5, 0.62, 1], ease: "easeInOut" }}
        style={{ transformOrigin: "110px 60px" }}
      >
        <path d="M96 -6 Q96 -26 110 -26 Q124 -26 124 -6 L120 26 H100 Z" fill="#B07A47" />
        <circle cx={110} cy={-30} r={14} fill="#8B5A2B" />
        <rect x={62} y={26} width={96} height={22} rx={5} fill="#8B5A2B" />
        <rect x={58} y={48} width={104} height={12} rx={3} fill="#2B2B2B" />
      </motion.g>
    </svg>
  );
}

/** 8. A cancelling machine: the date dial and a THANK YOU flag roll across from the right. */
export function MachineMark({ amount, accent, date }: PaidProps) {
  return (
    <svg viewBox="0 0 280 180" width={280} height={180} aria-label={`Paid ${amount}`} style={{ overflow: "visible" }}>
      <rect x={10} y={20} width={260} height={140} rx={8} fill={ENV} style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,.1))" }} />
      <HeartStamp x={198} y={34} accent={accent} />
      <clipPath id="mc-reveal">
        <motion.rect x={0} y={0} height={200} initial={{ width: 0, x: 280 }} animate={{ width: 280, x: 0 }} transition={{ delay: 0.25, duration: 0.9, ease: [0.3, 0, 0.2, 1] }} />
      </clipPath>
      <g clipPath="url(#mc-reveal)" opacity={0.92}>
        <RoundPostmark id="mc-arc" cx={160} cy={74} r={40} date={date} amount={amount} />
        <rect x={24} y={46} width={92} height={56} rx={3} fill="none" stroke={POST_INK} strokeWidth={2.5} />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M28 ${54 + i * 11} q 7 -4 14 0 t 14 0 t 14 0 t 14 0 t 14 0 t 14 0`} fill="none" stroke={POST_INK} strokeWidth={1.5} opacity={0.35} />)}
        <text x={70} y={72} textAnchor="middle" fill={POST_INK} fontSize={15} fontWeight={900} letterSpacing={1} style={font}>THANK</text>
        <text x={70} y={90} textAnchor="middle" fill={POST_INK} fontSize={15} fontWeight={900} letterSpacing={1} style={font}>YOU</text>
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M24 ${118 + i * 10} ${Array.from({ length: 9 }, () => "q 12 -6 24 0").join(" ")}`} fill="none" stroke={POST_INK} strokeWidth={2} strokeLinecap="round" />)}
      </g>
      <motion.g initial={{ x: 260, opacity: 1 }} animate={{ x: -20, opacity: [1, 1, 0] }} transition={{ delay: 0.25, duration: 0.9, ease: [0.3, 0, 0.2, 1] }}>
        <rect x={0} y={30} width={10} height={120} rx={5} fill="#3A3F45" />
        <rect x={-6} y={24} width={22} height={8} rx={3} fill="#2B2F34" />
      </motion.g>
    </svg>
  );
}

export const PAID_MARKS = [
  { id: "stamp", name: "Postage stamp", Mark: StampMark },
  { id: "receipt", name: "Receipt", Mark: ReceiptMark },
  { id: "seal", name: "Wax seal", Mark: SealMark },
  { id: "postmark", name: "Postmark", Mark: PostmarkMark },
  { id: "airmail", name: "Airmail", Mark: AirmailMark },
  { id: "postcard", name: "Postcard", Mark: PostcardMark },
  { id: "stamper", name: "Rubber stamp", Mark: StamperMark },
  { id: "machine", name: "Cancelling machine", Mark: MachineMark },
] as const;
