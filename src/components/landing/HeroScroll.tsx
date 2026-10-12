"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useMotionTemplate } from "motion/react";
import { CardArt } from "../CardArt";
import { CardMessage } from "../Card3D";
import { getDesign } from "@/lib/designs";
import { useViewport } from "@/lib/useViewport";

const design = getDesign("balloons")!;
const content = {
  recipientName: "Maya",
  senderName: "Love, Dad",
  font: "hand",
  message: "Happy 9th birthday, kiddo.\n\nI wrote this in October so I wouldn't forget a single thing about how proud of you I am.",
};

/** The card opens as you scroll, pinned in place while it happens. */
export function HeroScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const vp = useViewport();
  const book = vp.w >= 760;
  const w = book ? Math.min(330, (vp.w - 120) / 2, (vp.h - 200) / 1.4) : Math.min(300, vp.w - 80, (vp.h - 220) / 1.4);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  const headOpacity = useTransform(p, [0, 0.16], [1, 0]);
  const headY = useTransform(p, [0, 0.16], [0, -40]);
  const cardY = useTransform(p, [0, 0.2], [vp.h * 0.3, 0]);
  const cardScale = useTransform(p, [0, 0.2], [0.78, 1]);
  const cardTilt = useTransform(p, [0, 0.2], [14, 0]);
  const cover = useTransform(p, [0.24, 0.62], [0, -180]);
  const shift = useTransform(p, [0.24, 0.62], [0, book ? 50 : 0]);
  const shiftPct = useMotionTemplate`translateX(${shift}%)`;
  const capOpacity = useTransform(p, [0.66, 0.8], [0, 1]);
  const capY = useTransform(p, [0.66, 0.8], [24, 0]);

  return (
    <section ref={ref} style={{ height: "320vh", position: "relative" }}>
      <div style={{ position: "sticky", top: 52, height: "calc(100vh - 52px)", overflow: "hidden", display: "grid", placeItems: "center" }}>
        <motion.div style={{ opacity: headOpacity, y: headY, position: "absolute", top: "9vh", left: 0, right: 0, textAlign: "center", padding: "0 22px", zIndex: 2 }}>
          <h1 className="display display-xl">Say it on the day.</h1>
          <p className="lede" style={{ maxWidth: 600, margin: "18px auto 28px" }}>
            Write a card whenever it comes to you. Pick the exact minute it should arrive. We seal it and deliver it on time.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/send" className="btn btn-brand">Write a card</Link>
            <a href="#cards" className="btn btn-ghost">See the cards</a>
          </div>
        </motion.div>

        <motion.div style={{ y: cardY, scale: cardScale, rotateX: cardTilt, transformPerspective: 1600, marginTop: "6vh", visibility: vp.ready ? "visible" : "hidden" }}>
          <div className="ks-card-stage" style={{ ["--w" as string]: `${w}px` }}>
            <motion.div className={`ks-card mode-${book ? "book" : "flip"}`} style={{ transform: shiftPct, transition: "none" }}>
              {book && (
                <div className="ks-card-inside">
                  <CardMessage design={design} content={content} />
                </div>
              )}
              <motion.div className="ks-card-cover" style={{ rotateY: cover, transition: "none" }}>
                <div className="ks-face ks-face-front"><CardArt design={design} /></div>
                <div className="ks-face ks-face-back">
                  {book ? <div className="fold" /> : <CardMessage design={design} content={content} />}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        <motion.p
          className="lede"
          style={{ opacity: capOpacity, y: capY, position: "absolute", bottom: "6vh", left: 0, right: 0, textAlign: "center", padding: "0 22px", color: "var(--ink)" }}
        >
          Written in October. <span className="muted">Opened on her birthday.</span>
        </motion.p>
      </div>
    </section>
  );
}
