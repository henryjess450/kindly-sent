"use client";

import { useEffect, useRef } from "react";
import type { Effect } from "@/lib/designs";

type P = { x: number; y: number; vx: number; vy: number; r: number; rot: number; vr: number; color: string; life: number; shape: number };

const PALETTES: Record<Effect, string[]> = {
  confetti: ["#FF5A4E", "#4AA3FF", "#FFC53D", "#34C759", "#AF52DE"],
  hearts: ["#E5383B", "#FF6B81", "#FFB3B8"],
  snow: ["#FFFFFF"],
  sparkle: ["#F2B705", "#FFD860", "#FFFFFF"],
  petals: ["#F7C6C7", "#FFFFFF", "#E8A0A8"],
  leaves: ["#C8553D", "#F28F3B", "#E0A458", "#8C4A2F"],
  none: [],
};

/** Full-screen celebration drawn on one canvas. Stops on its own, except snow. */
export function Particles({ effect, play }: { effect: Effect; play: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!play || effect === "none") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    addEventListener("resize", resize);
    const colors = PALETTES[effect];
    const pick = () => colors[Math.floor(Math.random() * colors.length)];
    const W = () => innerWidth;
    const H = () => innerHeight;
    const ps: P[] = [];
    const make = (burst: boolean): P => {
      if (effect === "confetti" && burst) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
        const s = 9 + Math.random() * 9;
        return { x: W() / 2, y: H() * 0.62, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 5 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, color: pick(), life: 1, shape: Math.random() < 0.5 ? 0 : 1 };
      }
      if (effect === "hearts") return { x: Math.random() * W(), y: H() + 20, vx: (Math.random() - 0.5) * 0.6, vy: -(1 + Math.random() * 1.6), r: 8 + Math.random() * 12, rot: (Math.random() - 0.5) * 0.6, vr: 0, color: pick(), life: 1, shape: 2 };
      if (effect === "sparkle") return { x: Math.random() * W(), y: Math.random() * H(), vx: 0, vy: 0, r: 4 + Math.random() * 9, rot: 0, vr: 0.02, color: pick(), life: 0, shape: 3 };
      // snow, petals, gentle confetti rain
      return { x: Math.random() * W(), y: -20, vx: (Math.random() - 0.5) * 0.8, vy: 0.8 + Math.random() * 1.6, r: effect === "snow" ? 1.5 + Math.random() * 3 : effect === "leaves" ? 7 + Math.random() * 6 : 5 + Math.random() * 5, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.08, color: pick(), life: 1, shape: effect === "snow" ? 4 : effect === "petals" ? 5 : 1 };
    };
    if (effect === "confetti") for (let i = 0; i < 110; i++) ps.push(make(true));
    const start = performance.now();
    const spawnFor = effect === "snow" ? Infinity : effect === "confetti" ? 1400 : 7000;
    let raf = 0;
    let t = 0;

    const heart = (r: number) => {
      ctx.beginPath();
      ctx.moveTo(0, r * 0.35);
      ctx.bezierCurveTo(-r, -r * 0.3, -r * 0.5, -r, 0, -r * 0.45);
      ctx.bezierCurveTo(r * 0.5, -r, r, -r * 0.3, 0, r * 0.35);
      ctx.fill();
    };
    const star = (r: number) => {
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.25 : r;
        const a = (Math.PI / 4) * i;
        ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    };

    const frame = (now: number) => {
      t++;
      const elapsed = now - start;
      if (elapsed < spawnFor) {
        const rate = effect === "snow" ? 0.6 : effect === "hearts" ? 0.18 : effect === "sparkle" ? 0.25 : effect === "petals" || effect === "leaves" ? 0.2 : 0.3;
        if (Math.random() < rate) ps.push(make(false));
      }
      ctx.clearRect(0, 0, W(), H());
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        if (p.shape === 3) {
          p.life += 0.02;
          if (p.life > 2) { ps.splice(i, 1); continue; }
        } else {
          if (effect === "confetti") { p.vy += 0.22; p.vx *= 0.985; p.vy = Math.min(p.vy, 4.5); }
          p.x += p.vx + (p.shape >= 4 ? Math.sin((t + i * 7) / 40) * 0.5 : 0);
          p.y += p.vy;
          p.rot += p.vr;
          if (p.y > H() + 40 || p.y < -60) { ps.splice(i, 1); continue; }
        }
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.shape === 3 ? Math.sin((p.life / 2) * Math.PI) : p.shape === 4 ? 0.85 : 1;
        if (p.shape === 0) ctx.fillRect(-p.r / 2, -p.r, p.r, p.r * 2 * Math.abs(Math.cos(t / 10 + i)));
        else if (p.shape === 1) { ctx.beginPath(); ctx.ellipse(0, 0, p.r * 0.6, p.r * 0.6 * Math.abs(Math.sin(t / 12 + i)) + 1, 0, 0, Math.PI * 2); ctx.fill(); }
        else if (p.shape === 2) heart(p.r);
        else if (p.shape === 3) star(p.r);
        else if (p.shape === 4) { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
        else { ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      }
      if (ps.length || elapsed < spawnFor) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      removeEventListener("resize", resize);
    };
  }, [effect, play]);

  return <canvas ref={ref} aria-hidden style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }} />;
}
