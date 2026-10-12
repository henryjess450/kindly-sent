"use client";

import { useId } from "react";
import { motion } from "motion/react";
import type { Design } from "@/lib/designs";

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + 255 * amount)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
}

const isDark = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) & 255) * 0.299 + ((n >> 8) & 255) * 0.587 + (n & 255) * 0.114 < 120;
};

/** Liner patterns, drawn in the card's accent on a soft base. */
export function LinerPattern({ id, liner, accent, base }: { id: string; liner: string; accent: string; base: string }) {
  return (
    <defs>
      <pattern id={id} width={12} height={12} patternUnits="userSpaceOnUse">
        <rect width={12} height={12} fill={base} />
        {liner === "dots" && <circle cx={6} cy={6} r={1.6} fill={accent} />}
        {liner === "stripes" && <rect width={6} height={12} fill={accent} opacity={0.55} transform="rotate(35 6 6)" />}
        {liner === "confetti" && (
          <>
            <rect x={1} y={2} width={3} height={1.4} rx={0.7} fill={accent} transform="rotate(30 2 2)" />
            <rect x={7} y={7} width={3} height={1.4} rx={0.7} fill="#FFC53D" transform="rotate(-40 8 8)" />
            <circle cx={9} cy={2.5} r={0.9} fill="#4AA3FF" />
          </>
        )}
        {liner === "hearts" && <path d="M6 8.4 C 3 6.4, 3 3.6, 4.8 3.4 C 5.6 3.3, 6 4, 6 4.6 C 6 4, 6.4 3.3, 7.2 3.4 C 9 3.6, 9 6.4, 6 8.4 Z" fill={accent} />}
      </pattern>
    </defs>
  );
}

/**
 * The back of an envelope: the card sits between the inside and the front
 * pocket, and the flap folds over the top. Size comes from the card width.
 */
export function Envelope({
  design,
  width,
  flapOpen,
  seal,
  sealLetter,
  color,
  liner = "plain",
  label,
  children,
}: {
  design: Design;
  width: number;
  flapOpen: boolean;
  seal: boolean;
  sealLetter: string;
  color?: string;
  liner?: string;
  label?: string;
  children?: React.ReactNode;
}) {
  const uid = useId().replace(/:/g, "");
  const base = color || design.envelope;
  const linerBase = liner === "plain" ? shade(base, -0.14) : "#FFFFFF";
  const fill = liner === "plain" ? linerBase : `url(#${uid}-liner)`;
  return (
    <div className="ks-env" style={{ ["--w" as string]: `${width}px` }}>
      <div className="ks-env-back">
        <svg viewBox="0 0 152 108" preserveAspectRatio="none" style={{ width: "100%", height: "100%", display: "block" }}>
          <LinerPattern id={`${uid}-liner`} liner={liner} accent={design.accent} base={linerBase} />
          <rect width={152} height={108} fill={shade(base, -0.1)} />
          <path d="M6 6 H146 V70 L76 50 L6 70 Z" fill={fill} />
        </svg>
      </div>
      {children}
      <div className="ks-env-pocket">
        <svg viewBox="0 0 152 108" preserveAspectRatio="none">
          <path d="M0 0 L74 60 L0 108 Z" fill={shade(base, -0.03)} />
          <path d="M152 0 L78 60 L152 108 Z" fill={shade(base, -0.03)} />
          <path d="M0 108 L76 52 L152 108 Z" fill={base} />
        </svg>
        {label && (
          <span className="ks-env-label" style={{ color: isDark(base) ? "#F4F6FB" : "#2B2B2B" }}>
            {label}
          </span>
        )}
      </div>
      <motion.div
        className="ks-env-flap"
        initial={false}
        animate={{ rotateX: flapOpen ? 180 : 0, zIndex: flapOpen ? 1 : 4 }}
        transition={{ rotateX: { duration: 0.7, ease: [0.65, 0, 0.35, 1] }, zIndex: { delay: flapOpen ? 0.35 : 0.3 } }}
        style={{ transformPerspective: width * 3 }}
      >
        <svg viewBox="0 0 152 67" preserveAspectRatio="none" className="ks-flap-face">
          <path d="M0 0 H152 L82 63 Q76 68 70 63 Z" fill={shade(base, 0.03)} />
        </svg>
        <svg viewBox="0 0 152 67" preserveAspectRatio="none" className="ks-flap-face is-back">
          <LinerPattern id={`${uid}-liner2`} liner={liner} accent={design.accent} base={linerBase} />
          <path d="M0 67 H152 L82 4 Q76 -1 70 4 Z" fill={shade(base, -0.06)} />
          <path d="M8 67 H144 L80 10 Q76 6 72 10 Z" fill={liner === "plain" ? linerBase : `url(#${uid}-liner2)`} />
        </svg>
      </motion.div>
      <motion.div
        className="ks-seal"
        style={{ background: design.accent }}
        initial={false}
        animate={seal ? { scale: 1, opacity: 1, rotate: 0 } : { scale: 1.5, opacity: 0, rotate: -20 }}
        transition={seal ? { type: "spring", stiffness: 520, damping: 22 } : { duration: 0.3, ease: "easeIn" }}
      >
        {sealLetter}
      </motion.div>
    </div>
  );
}
