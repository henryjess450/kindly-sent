"use client";

import { useEffect, useRef } from "react";
import { LAMP_ANIMS, N, dark, glow, type LampAnim, type Rgb } from "@/lib/lamp/animations";

/** Dark gap between replays. Every animation starts and ends dark, so the loop is seamless. */
const GAP_S = 0.9;

type Show = LampAnim | "glow" | "off" | "none" | LampAnim[];

/**
 * A drawing of the LED ring, playing the same frames the lamp does. LED 0
 * sits at the bottom. Pass a list to play several in turn.
 */
export function LampRing({ anim, size = 120 }: { anim: Show; size?: number }) {
  const dots = useRef<(HTMLSpanElement | null)[]>([]);
  const key = Array.isArray(anim) ? anim.join(",") : anim;

  useEffect(() => {
    const paint = (frame: Rgb[]) =>
      frame.forEach((c, i) => {
        const el = dots.current[i];
        if (!el) return;
        const [r, g, b] = c.map((v) => Math.min(255, Math.round(v)));
        const lit = r + g + b > 6;
        el.style.background = lit ? `rgb(${r} ${g} ${b})` : "";
        el.style.boxShadow = lit ? `0 0 ${Math.round(size / 8)}px rgb(${r} ${g} ${b} / ${Math.min(1, (r + g + b) / 300)})` : "";
      });
    const list = key.split(",") as (LampAnim | "glow" | "off" | "none")[];
    if (list[0] === "off" || list[0] === "none") return paint(dark());
    const anims = list.filter((a): a is LampAnim => a in LAMP_ANIMS);
    const total = anims.reduce((s, a) => s + LAMP_ANIMS[a].seconds + GAP_S, 0);
    // The idle glow is dim on purpose (LEDs are bright); lift it so it shows on a screen.
    const screenGlow = (t: number) => glow(t).map((c) => c.map((v) => v * 2.5) as unknown as Rgb);
    const frameAt = (t: number) => {
      if (list[0] === "glow") return screenGlow(t);
      let u = t % total;
      for (const a of anims) {
        const d = LAMP_ANIMS[a].seconds;
        if (u < d) return LAMP_ANIMS[a].frame(u);
        u -= d + GAP_S;
        if (u < 0) break;
      }
      return dark();
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return paint(list[0] === "glow" ? screenGlow(0) : LAMP_ANIMS[anims[0]].frame(LAMP_ANIMS[anims[0]].seconds * 0.45));
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      paint(frameAt((now - start) / 1000));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [key, size]);

  const dot = Math.max(7, Math.round(size / 9));
  const radius = size / 2 - dot / 2 - Math.max(4, size / 14);
  return (
    <div aria-hidden className="lamp-ring" style={{ width: size, height: size }}>
      {Array.from({ length: N }, (_, i) => {
        const a = Math.PI / 2 + (i * 2 * Math.PI) / N;
        return (
          <span
            key={i}
            ref={(el) => {
              dots.current[i] = el;
            }}
            style={{ width: dot, height: dot, left: size / 2 + radius * Math.cos(a) - dot / 2, top: size / 2 + radius * Math.sin(a) - dot / 2 }}
          />
        );
      })}
      <style>{`
        .lamp-ring { position: relative; flex-shrink: 0; border-radius: 50%; background: radial-gradient(circle at 50% 35%, #2a2a2e, #141416 70%); box-shadow: inset 0 1px 0 rgba(255,255,255,.08), 0 10px 30px rgba(0,0,0,.18); }
        .lamp-ring span { position: absolute; border-radius: 50%; background: #2c2c30; border: 1px solid rgba(255,255,255,.07); transition: none; }
      `}</style>
    </div>
  );
}
