import type { CSSProperties, ReactNode } from "react";

// Shared drawing kit for card covers. Every cover is drawn by hand as SVG on a 500 x 700 card (5 x 7 inches) and
// every one moves. Loops start and end in the same pose, so nothing snaps.

export const W = 500;
export const H = 700;

export type AnimOpts = { delay?: number; origin?: string; ease?: string; box?: "fill-box" | "view-box"; vars?: Record<string, string> };
export function anim(name: string, dur: number, o: AnimOpts = {}): CSSProperties {
  return {
    animation: `${name} ${dur}s ${o.ease ?? "ease-in-out"} ${o.delay ?? 0}s infinite`,
    transformBox: o.box ?? "fill-box",
    transformOrigin: o.origin ?? "center",
    ...(o.vars as CSSProperties),
  };
}
/** Rotation around a fixed point on the card, e.g. a string's knot. */
export const pivot = (x: number, y: number) => ({ box: "view-box" as const, origin: `${x}px ${y}px` });

export function Title({ children, y, size = 58, fill, serif, italic, weight = 700 }: { children: ReactNode; y: number; size?: number; fill: string; serif?: boolean; italic?: boolean; weight?: number }) {
  return (
    <text
      x={W / 2}
      y={y}
      textAnchor="middle"
      fill={fill}
      style={{
        fontFamily: serif ? "var(--font-serif)" : "var(--font-display)",
        fontWeight: serif ? 500 : weight,
        fontStyle: italic ? "italic" : "normal",
        fontSize: size,
        letterSpacing: serif ? -size * 0.01 : -size * 0.035,
      }}
    >
      {children}
    </text>
  );
}

export function Kicker({ children, y, fill }: { children: ReactNode; y: number; fill: string }) {
  return (
    <text x={W / 2} y={y} textAnchor="middle" fill={fill} opacity={0.72} style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: 4 }}>
      {String(children).toUpperCase()}
    </text>
  );
}

export function Frame({ color, inset = 22, opacity = 0.18 }: { color: string; inset?: number; opacity?: number }) {
  return <rect x={inset} y={inset} width={W - inset * 2} height={H - inset * 2} rx={10} fill="none" stroke={color} strokeWidth={1.5} opacity={opacity} />;
}

/** Server and browser can disagree in the last digit of trig results; round so they match. */
export const r1 = (n: number) => Math.round(n * 10) / 10;

export function starPath(cx: number, cy: number, outer: number, inner: number, points = 5) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
}

export const HEART = "M0 10 C -16 -2, -16 -16, -7 -18 C -2 -19, 0 -15, 0 -12 C 0 -15, 2 -19, 7 -18 C 16 -16, 16 -2, 0 10 Z";
export const LEAF = "M0 -20 C 12 -12, 13 6, 0 20 C -13 6, -12 -12, 0 -20 Z";

// Same "random" layout every render, so server and browser agree.
export function scatter(n: number, seed: number) {
  let s = seed;
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
  return Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, r: rnd(), q: rnd() }));
}

/** Things that fall from above the card to below it, forever. */
export function Falling({ n, seed, dur = [7, 12], children }: { n: number; seed: number; dur?: [number, number]; children: (i: number, r: number) => ReactNode }) {
  return (
    <>
      {scatter(n, seed).map((p, i) => {
        const d = r1(dur[0] + p.r * (dur[1] - dur[0]));
        return (
          <g key={i} transform={`translate(${p.x.toFixed(0)} 0)`}>
            <g style={anim("ks-fall", d, { ease: "linear", delay: -r1(p.q * d), vars: { "--dx": `${r1((p.r - 0.5) * 80)}px`, "--spin": `${p.q > 0.5 ? 360 : -360}deg` } })}>{children(i, p.r)}</g>
          </g>
        );
      })}
    </>
  );
}

export function Twinkles({ pts, color }: { pts: { x: number; y: number; r: number }[]; color: string }) {
  return (
    <>
      {pts.map((p, i) => (
        <path key={i} d={starPath(p.x, p.y, p.r, p.r * 0.28, 4)} fill={color} style={anim("ks-twinkle", 2.4 + (i % 3) * 0.6, { delay: -i * 0.7 })} />
      ))}
    </>
  );
}


export type ArtProps = { d: import("@/lib/designs").Design };
export type ArtMap = Record<string, (p: ArtProps) => ReactNode>;
