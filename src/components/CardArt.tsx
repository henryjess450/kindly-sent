import type { Design } from "@/lib/designs";

// Each cover is drawn by hand as SVG on a 500 x 700 card (5 x 7 inches).
// Solid colours only, so they print and email cleanly.

const W = 500;
const H = 700;

function Title({ children, y, size = 58, fill }: { children: React.ReactNode; y: number; size?: number; fill: string }) {
  return (
    <text
      x={W / 2}
      y={y}
      textAnchor="middle"
      fill={fill}
      style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size, letterSpacing: -size * 0.03 }}
    >
      {children}
    </text>
  );
}

function Kicker({ children, y, fill }: { children: React.ReactNode; y: number; fill: string }) {
  return (
    <text
      x={W / 2}
      y={y}
      textAnchor="middle"
      fill={fill}
      opacity={0.7}
      style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 17, letterSpacing: 3.5, textTransform: "uppercase" }}
    >
      {children}
    </text>
  );
}

function starPath(cx: number, cy: number, outer: number, inner: number, points = 5) {
  let d = "";
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    d += `${i === 0 ? "M" : "L"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  }
  return d + "Z";
}

// Same "random" layout every render, so server and browser agree.
function scatter(n: number, seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  return Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * H, r: rnd() }));
}

function Balloon({ x, y, fill, tilt }: { x: number; y: number; fill: string; tilt: number }) {
  return (
    <g transform={`rotate(${tilt} ${x} ${y + 90})`}>
      <path d={`M${x} ${y + 92} q-6 14 0 14 q6 0 0 -14`} fill={fill} />
      <ellipse cx={x} cy={y} rx={60} ry={74} fill={fill} />
      <ellipse cx={x - 24} cy={y - 30} rx={11} ry={20} fill="#fff" opacity={0.35} transform={`rotate(-24 ${x - 24} ${y - 30})`} />
    </g>
  );
}

function Balloons({ d }: { d: Design }) {
  return (
    <>
      <path d="M160 300 C 190 380, 230 420, 250 470" stroke={d.ink} strokeWidth={2} fill="none" opacity={0.55} />
      <path d="M250 250 C 240 330, 260 400, 250 470" stroke={d.ink} strokeWidth={2} fill="none" opacity={0.55} />
      <path d="M345 320 C 320 390, 270 430, 250 470" stroke={d.ink} strokeWidth={2} fill="none" opacity={0.55} />
      <Balloon x={160} y={210} fill="#4AA3FF" tilt={-8} />
      <Balloon x={345} y={232} fill="#FFC53D" tilt={9} />
      <Balloon x={252} y={150} fill={d.accent} tilt={0} />
      <path d="M250 470 l-16 12 l2 -18 Z M250 470 l16 12 l-2 -18 Z" fill={d.accent} />
      <Kicker y={556} fill={d.ink}>It&apos;s your day</Kicker>
      <Title y={622} fill={d.ink}>Happy birthday</Title>
    </>
  );
}

function Cake({ d }: { d: Design }) {
  return (
    <>
      <Kicker y={92} fill={d.ink}>Close your eyes</Kicker>
      <Title y={156} fill={d.ink}>Make a wish</Title>
      <g className="ks-flicker" style={{ transformOrigin: "250px 300px" }}>
        <path d="M250 262 C 236 284, 238 304, 250 306 C 262 304, 264 284, 250 262 Z" fill="#FFB020" />
        <path d="M250 282 C 244 292, 245 302, 250 303 C 255 302, 256 292, 250 282 Z" fill="#FFF1C2" />
      </g>
      <rect x={243} y={308} width={14} height={62} rx={4} fill="#fff" />
      <rect x={243} y={322} width={14} height={8} fill={d.accent} />
      <rect x={243} y={344} width={14} height={8} fill={d.accent} />
      <rect x={150} y={370} width={200} height={84} rx={14} fill="#fff" />
      <path d="M150 384 q0 -14 14 -14 h172 q14 0 14 14 v10 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-11 18 -21 0 Z" fill={d.accent} />
      <rect x={110} y={454} width={280} height={100} rx={16} fill="#fff" />
      <path d="M110 470 q0 -16 16 -16 h248 q16 0 16 16 v12 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 Z" fill={d.accent} />
      <ellipse cx={250} cy={566} rx={180} ry={18} fill={d.ink} opacity={0.12} />
      <rect x={70} y={552} width={360} height={10} rx={5} fill={d.ink} opacity={0.85} />
    </>
  );
}

function Sprig({ d }: { d: Design }) {
  const leaves = [
    { x: 236, y: 470, a: -50 }, { x: 266, y: 432, a: 46 }, { x: 228, y: 388, a: -42 },
    { x: 262, y: 346, a: 40 }, { x: 238, y: 302, a: -36 }, { x: 258, y: 262, a: 30 },
  ];
  return (
    <>
      <path d="M250 540 C 240 460, 262 380, 248 240" stroke={d.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
      {leaves.map((l, i) => (
        <ellipse key={i} cx={l.x + (l.a < 0 ? -28 : 28)} cy={l.y} rx={40} ry={15} fill={i % 2 ? d.accent : "#7FAF6E"} transform={`rotate(${l.a} ${l.x} ${l.y})`} />
      ))}
      <ellipse cx={248} cy={226} rx={13} ry={22} fill="#7FAF6E" />
      <Title y={620} size={62} fill={d.ink}>Thank you</Title>
      <Kicker y={140} fill={d.ink}>Truly</Kicker>
    </>
  );
}

function BigHeart({ d }: { d: Design }) {
  return (
    <>
      <Kicker y={104} fill={d.ink}>You&apos;re my</Kicker>
      <Title y={168} size={60} fill={d.ink}>favourite</Title>
      <g className="ks-beat" style={{ transformOrigin: "250px 420px" }}>
        <path d="M250 570 C 120 480, 64 400, 100 318 C 136 240, 222 244, 250 306 C 278 244, 364 240, 400 318 C 436 400, 380 480, 250 570 Z" fill={d.accent} />
        <ellipse cx={160} cy={322} rx={18} ry={30} fill="#fff" opacity={0.3} transform="rotate(30 160 322)" />
      </g>
    </>
  );
}

function Sunrise({ d }: { d: Design }) {
  const rays = Array.from({ length: 9 }, (_, i) => -90 + (i - 4) * 20);
  return (
    <>
      <g className="ks-turn" style={{ transformOrigin: "250px 420px" }}>
        {rays.map((a) => {
          const r = (a * Math.PI) / 180;
          return (
            <line key={a} x1={250 + Math.cos(r) * 150} y1={420 + Math.sin(r) * 150} x2={250 + Math.cos(r) * 196} y2={420 + Math.sin(r) * 196} stroke={d.accent} strokeWidth={10} strokeLinecap="round" />
          );
        })}
      </g>
      <path d="M130 420 a120 120 0 0 1 240 0 Z" fill={d.accent} />
      <rect x={60} y={418} width={380} height={8} rx={4} fill={d.ink} />
      <path d="M120 458 h260 M160 488 h180 M200 518 h100" stroke={d.accent} strokeWidth={8} strokeLinecap="round" opacity={0.55} />
      <Kicker y={590} fill={d.ink}>No reason at all</Kicker>
      <Title y={648} fill={d.ink}>Just because</Title>
    </>
  );
}

function FirstSnow({ d }: { d: Design }) {
  const flakes = scatter(46, 7);
  const tree = (x: number, s: number, fill: string) => (
    <g transform={`translate(${x} ${560 - 150 * s}) scale(${s})`}>
      <path d="M0 0 L46 66 H22 L60 118 H30 L70 170 H-70 L-30 118 H-60 L-22 66 H-46 Z" fill={fill} />
      <rect x={-8} y={170} width={16} height={22} fill={fill} />
    </g>
  );
  return (
    <>
      <circle cx={380} cy={130} r={42} fill="#F4F6FB" />
      <circle cx={398} cy={118} r={40} fill={d.paper} />
      {flakes.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y * 0.82} r={1.5 + f.r * 3} fill="#fff" opacity={0.5 + f.r * 0.5} />
      ))}
      {tree(150, 1.05, "#3D5C8C")}
      {tree(260, 1.35, "#F4F6FB")}
      {tree(360, 0.85, "#3D5C8C")}
      <path d="M0 590 C 120 548, 360 566, 500 540 V700 H0 Z" fill="#F4F6FB" />
      <Title y={656} size={52} fill={d.paper}>Happy holidays</Title>
    </>
  );
}

function GoldStars({ d }: { d: Design }) {
  const small = [
    { x: 110, y: 170, r: 18 }, { x: 390, y: 200, r: 24 }, { x: 96, y: 420, r: 14 },
    { x: 404, y: 440, r: 16 }, { x: 330, y: 110, r: 11 }, { x: 170, y: 520, r: 10 },
  ];
  return (
    <>
      {small.map((s, i) => (
        <path key={i} d={starPath(s.x, s.y, s.r, s.r * 0.45)} fill={i % 2 ? d.accent : "#F2B705"} className="ks-twinkle" style={{ animationDelay: `${i * 0.4}s`, transformOrigin: `${s.x}px ${s.y}px` }} />
      ))}
      <path d={starPath(250, 320, 150, 64)} fill="#F2B705" strokeLinejoin="round" stroke="#F2B705" strokeWidth={16} />
      <path d="M150 498 h200 l-20 26 l20 26 h-200 l20 -26 Z" fill={d.accent} />
      <text x={250} y={532} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18, letterSpacing: 3 }}>
        CONGRATULATIONS
      </text>
      <Title y={630} size={64} fill={d.ink}>You did it</Title>
    </>
  );
}

function Tulip({ d }: { d: Design }) {
  return (
    <>
      <path d="M250 560 C 250 470, 246 400, 250 330" stroke={d.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d="M248 520 C 200 500, 176 450, 180 400 C 214 424, 238 470, 248 520 Z" fill={d.accent} />
      <path d="M252 480 C 296 462, 318 420, 316 376 C 284 398, 262 436, 252 480 Z" fill={d.accent} opacity={0.75} />
      <path d="M250 340 C 214 336, 196 300, 200 248 L 226 274 L 250 236 L 274 274 L 300 248 C 304 300, 286 336, 250 340 Z" fill="#D98E8E" />
      <path d="M250 340 C 236 320, 232 290, 250 236 C 268 290, 264 320, 250 340 Z" fill="#C97474" />
      <rect x={150} y={560} width={200} height={3} rx={1.5} fill={d.ink} opacity={0.25} />
      <text x={250} y={636} textAnchor="middle" fill={d.ink} style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 44 }}>
        Thinking of you
      </text>
    </>
  );
}

const ART: Record<string, (p: { d: Design }) => React.ReactNode> = {
  balloons: Balloons,
  cake: Cake,
  thanks: Sprig,
  heart: BigHeart,
  sun: Sunrise,
  snow: FirstSnow,
  stars: GoldStars,
  tulip: Tulip,
};

export function CardArt({ design, className }: { design: Design; className?: string }) {
  const Art = ART[design.id] ?? Balloons;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={className} role="img" aria-label={`${design.name} card`} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={design.paper} />
      <Art d={design} />
    </svg>
  );
}
