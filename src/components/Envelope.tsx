"use client";

import { motion } from "motion/react";
import type { Design } from "@/lib/designs";

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + 255 * amount)));
  return `#${[(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => f(c).toString(16).padStart(2, "0")).join("")}`;
}

/**
 * The back of an envelope: the card sits between the inside and the front
 * pocket, and the flap folds over the top. Size comes from --w (card width).
 */
export function Envelope({
  design,
  width,
  flapOpen,
  seal,
  sealLetter,
  children,
}: {
  design: Design;
  width: number;
  flapOpen: boolean;
  seal: boolean;
  sealLetter: string;
  children?: React.ReactNode;
}) {
  const base = design.envelope;
  return (
    <div className="ks-env" style={{ ["--w" as string]: `${width}px` }}>
      <div className="ks-env-back" style={{ background: shade(base, -0.1) }} />
      {children}
      <div className="ks-env-pocket">
        <svg viewBox="0 0 152 108" preserveAspectRatio="none">
          <path d="M0 0 L74 60 L0 108 Z" fill={shade(base, -0.02)} />
          <path d="M152 0 L78 60 L152 108 Z" fill={shade(base, -0.02)} />
          <path d="M0 108 L76 52 L152 108 Z" fill={base} />
        </svg>
      </div>
      <motion.div
        className="ks-env-flap"
        initial={false}
        animate={{ rotateX: flapOpen ? 180 : 0, zIndex: flapOpen ? 1 : 4 }}
        transition={{ rotateX: { duration: 0.7, ease: [0.65, 0, 0.35, 1] }, zIndex: { delay: flapOpen ? 0.35 : 0.3 } }}
        style={{ transformPerspective: width * 3 }}
      >
        <svg viewBox="0 0 152 67" preserveAspectRatio="none">
          <path d="M0 0 H152 L82 63 Q76 68 70 63 Z" fill={shade(base, 0.03)} />
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
