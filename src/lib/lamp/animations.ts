/*
 * The card lamp's animations, for the admin page preview. A line-for-line
 * copy of firmware/lamp/anims.py (which is what the lamp itself runs):
 * change one, change the other.
 *
 * Each frame function takes t (seconds since the animation started) and
 * returns 12 colours (Payment also takes the dollars). LED 0 is the bottom of the ring; height(i) counts up
 * both sides to the top (LED 6). Every animation starts and ends dark.
 */

export type Rgb = readonly [number, number, number];

export const N = 12;

const OFF: Rgb = [0, 0, 0];
const RED: Rgb = [229, 72, 77];
const ROSE: Rgb = [255, 128, 140];
const PAPER: Rgb = [255, 236, 220];
const BUTTER: Rgb = [247, 196, 80];
const SAGE: Rgb = [110, 190, 120];
const SKY: Rgb = [70, 150, 255];
const INK: Rgb = [0, 113, 227];
const GREEN: Rgb = [48, 209, 88];
const FLAME: Rgb = [255, 150, 40];
const WHITE: Rgb = [255, 255, 255];

const clamp = (x: number, lo = 0, hi = 1) => (x < lo ? lo : x > hi ? hi : x);
const ease = (x: number) => {
  x = clamp(x);
  return x * x * (3 - 2 * x);
};
const mix = (a: Rgb, b: Rgb, t: number): Rgb => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const add = (a: Rgb, b: Rgb, t = 1): Rgb => [a[0] + b[0] * t, a[1] + b[1] * t, a[2] + b[2] * t];
const scale = (a: Rgb, t: number): Rgb => [a[0] * t, a[1] * t, a[2] * t];
const height = (i: number) => Math.min(i, N - i);
const behind = (p: number, i: number) => (((p - i) % N) + N) % N;
const around = (i: number, p: number) => {
  const k = behind(i, p);
  return Math.min(k, N - k);
};
const env = (t: number, d: number, fade = 0.8) => ease(t / fade) * ease((d - t) / fade);
const hash01 = (n: number) => (Math.imul(n, 2654435761) >>> 0) / 4294967296;
const leds = (f: (i: number) => Rgb) => Array.from({ length: N }, (_, i) => f(i));

function sealed(t: number) {
  const fade = 1 - ease((t - 4.0) / 1.0);
  return leds((i) => {
    const h = height(i);
    let c: Rgb;
    if (t < 1.4) c = scale(PAPER, clamp(ease(t / 1.4) * 7 - h) * 0.55);
    else c = mix(scale(PAPER, 0.55), RED, clamp(ease((t - 1.4) / 0.9) * 4 - (6 - h)) * 0.85);
    if (t > 2.3) {
      const s = Math.sin(Math.PI * clamp((t - 2.3) / 1.6) * 2) ** 2;
      if (i === N / 2) c = add(c, WHITE, s * 0.45);
      else if (i === N / 2 - 1 || i === N / 2 + 1) c = add(c, ROSE, s * 0.5);
    }
    return scale(c, fade);
  });
}

function heartbeat(t: number) {
  const e = env(t, 4.0, 0.4);
  const u = t % 1.2;
  const beat = Math.max(Math.exp(-(((u - 0.15) / 0.08) ** 2)), 0.7 * Math.exp(-(((u - 0.42) / 0.08) ** 2)));
  return leds((i) => {
    const shape = i === 0 ? 0.8 : 0.35 + 0.65 * clamp(1 - Math.abs(height(i) - 4.5) / 2.5);
    let c = add(scale(RED, 0.18), RED, beat * shape);
    c = add(c, ROSE, beat * beat * shape * 0.4);
    return scale(c, e);
  });
}

const CONFETTI = [RED, BUTTER, SKY, SAGE, ROSE];

function confetti(t: number) {
  const e = env(t, 4.5, 0.4);
  return leds((i) => {
    let c = OFF;
    for (let k = 0; k < 3; k++) {
      const n = i * 3 + k;
      const x = t - (0.2 + hash01(n + 7) * 3.6);
      if (x >= 0 && x < 1.2) c = add(c, CONFETTI[Math.floor(hash01(n + 91) * 5)], Math.exp(-x * 3) * clamp(x / 0.05));
    }
    return scale(c, e);
  });
}

function airmail(t: number) {
  const p = 6 + 24 * ease(t / 3.2);
  const head = ease(t / 0.3);
  const trail = head * (1 - clamp((t - 3.0) / 0.6));
  const letter = head * (1 - clamp((t - 3.1) / 0.3));
  const mark = Math.sin(Math.PI * clamp((t - 3.1) / 0.9));
  return leds((i) => {
    const b = behind(p, i);
    let c = scale(i % 2 === 0 ? RED : SKY, clamp(1 - b / 5) ** 2 * trail);
    c = add(c, WHITE, clamp(1 - Math.min(b, N - b)) ** 2 * letter);
    return add(c, RED, clamp(1 - around(i, 6) / 2) * mark);
  });
}

function bloom(t: number) {
  const fade = 1 - ease((t - 4.3) / 1.2);
  const o = ease((t - 1.2) / 1.8);
  return leds((i) => {
    const h = height(i);
    if (h < 3) return scale(scale(SAGE, clamp(ease(t / 1.2) * 4 - h) * 0.6), fade);
    const k = clamp(o * 4 - (6 - h));
    const sway = 0.85 + 0.15 * Math.sin(2 * Math.PI * (t * 0.8 - h / 6));
    return scale(scale(mix(ROSE, RED, (h - 3) / 3), k * sway), fade);
  });
}

function ink(t: number) {
  const p = 12 * ease(t / 2.2);
  const nib = ease(t / 0.25) * (1 - ease((t - 2.0) / 0.4));
  const dry = 1 - ease((t - 2.4) / 1.1);
  return leds((i) => add(scale(INK, clamp(p - i) * 0.7 * dry), WHITE, clamp(1 - around(i, p)) ** 2 * nib));
}

const BURSTS = [
  [0.1, 6, BUTTER],
  [1.5, 2, RED],
  [2.9, 9, SKY],
] as const;

function fireworks(t: number) {
  const e = env(t, 5.0, 0.4);
  return leds((i) => {
    let c = OFF;
    for (const [t0, pos, col] of BURSTS) {
      const x = t - t0;
      if (x < 0 || x > 2) continue;
      const d = around(i, pos);
      c = add(c, col, clamp(1 - Math.abs(d - x * 4) / 1.2) * Math.exp(-x * 1.6));
      c = add(c, WHITE, clamp(1 - d) * Math.exp(-x * 8));
    }
    return scale(c, e);
  });
}

const LAPS = [GREEN, BUTTER, SKY, ROSE];

function payment(t: number, n = 5) {
  n = clamp(n, 0.01, 48);
  const pulse = Math.sin(Math.PI * clamp(t / 1.2)) ** 2;
  const step = Math.min(0.16, 2.6 / Math.ceil(n));
  const lit = clamp((t - 1.3) / step, 0, n);
  const lap = Math.min(Math.floor(lit / 12), Math.floor((n - 0.0001) / 12));
  const m = lit - 12 * lap;
  const glint = lit < n ? 0.5 * clamp((t - 1.3) / 0.15) : 0; // a sparkle on the LED being counted
  const fade = 1 - ease((t - 5.6) / 0.9);
  return leds((i) => {
    let c = lap > 0 ? scale(LAPS[(((lap - 1) % 4) + 4) % 4], 0.25) : OFF;
    c = mix(c, LAPS[lap % 4], clamp(m - i));
    c = add(c, WHITE, clamp(1 - Math.abs(m - 0.5 - i)) * glint);
    c = add(c, GREEN, pulse * 0.8);
    return scale(c, fade);
  });
}

function returned(t: number) {
  const p = 6 - 18 * ease(t / 3.0);
  const head = ease(t / 0.3) * (1 - ease((t - 2.6) / 0.8));
  return leds((i) => {
    const b = behind(i, p);
    const c = scale(ROSE, clamp(1 - b / 4) ** 2 * 0.7 * head);
    return add(c, WHITE, clamp(1 - Math.min(b, N - b)) ** 2 * 0.6 * head);
  });
}

function candles(t: number) {
  return leds((i) => {
    const on = clamp((t - 0.2 - 0.2 * i) / 0.15);
    const tb = 4.6 + ((Math.cos(Math.PI / 2 + (i * 2 * Math.PI) / N) + 1) / 2) * 0.8;
    const o = clamp((t - tb) / 0.12);
    const f = 0.5 + 0.5 * Math.sin(2 * Math.PI * (t * (2.5 + 2 * hash01(i + 3)) + hash01(i + 11)));
    const c = scale(mix(BUTTER, FLAME, f * 0.6), on * (1 - o) * (0.75 + 0.25 * f));
    return add(c, WHITE, Math.sin(Math.PI * clamp((t - tb) / 0.7)) * 0.1);
  });
}

/** The idle glow ("Glow"). Runs forever without looping back, so it never snaps. */
export function glow(t: number) {
  return leds((i) =>
    scale(mix(RED, ROSE, 0.5 + 0.5 * Math.sin(2 * Math.PI * (i / N - t / 10))), 0.12 + 0.06 * Math.sin(2 * Math.PI * (t / 7 + (i / N) * 2))),
  );
}

export const dark = (): Rgb[] => leds(() => OFF);

export const LAMP_ANIMS = {
  sealed: { name: "Sealed with love", blurb: "Card stock fills the ring, the red flap folds down and the wax seal glows twice.", seconds: 5, frame: sealed },
  heartbeat: { name: "Heartbeat", blurb: "The ring beats red, lub-dub, three times, like the heart in the logo.", seconds: 4, frame: heartbeat },
  confetti: { name: "Confetti", blurb: "Pops of every envelope colour all over the ring.", seconds: 4.5, frame: confetti },
  airmail: { name: "Airmail", blurb: "A letter flies round twice with a red and blue trail, lands at the top and gets a postmark.", seconds: 4, frame: airmail },
  bloom: { name: "Bloom", blurb: "A sage stem grows, then rose petals open from the top and sway.", seconds: 5.5, frame: bloom },
  ink: { name: "Fresh ink", blurb: "A pen nib writes a blue line round the ring, then the ink dries.", seconds: 3.5, frame: ink },
  fireworks: { name: "Fireworks", blurb: "Three bursts in butter, red and sky, spreading both ways round.", seconds: 5, frame: fireworks },
  payment: { name: "Payment", blurb: "A green pulse, then one light per dollar from the sale. Cents light the next one partly.", seconds: 6.5, frame: payment },
  returned: { name: "Return to sender", blurb: "A rose letter flies backwards round the ring and fades out.", seconds: 3.5, frame: returned },
  candles: { name: "Candles", blurb: "Twelve candles light one by one and flicker, then a puff blows them out.", seconds: 7, frame: candles },
} as const satisfies Record<string, { name: string; blurb: string; seconds: number; frame: (t: number, n?: number) => Rgb[] }>;

/** Animations that show the sale's amount (the lamp gets it in dollars). */
export const TAKES_AMOUNT: readonly string[] = ["payment"];

export type LampAnim = keyof typeof LAMP_ANIMS;
export const LAMP_ANIM_IDS = Object.keys(LAMP_ANIMS) as LampAnim[];
