import type { ReactNode } from "react";
import type { Design } from "@/lib/designs";
import { anim, Falling, Frame, H, HEART, Kicker, LEAF, pivot, r1, scatter, starPath, Title, Twinkles, W } from "./art/kit";
import { EXTRA_ART } from "./art";

// The original 21 covers live here; newer ones are in ./art, one file per occasion group.

/* ------------------------------------------------------------------ birthday */

function Balloon({ x, y, fill }: { x: number; y: number; fill: string }) {
  return (
    <>
      <path d={`M${x} ${y + 76} C ${x - 10} ${y + 160}, ${250 + (x - 250) * 0.3} ${y + 220}, 250 470`} stroke="#00000055" strokeWidth={2} fill="none" />
      <path d={`M${x} ${y + 74} l-7 12 h14 Z`} fill={fill} />
      <ellipse cx={x} cy={y} rx={60} ry={75} fill={fill} />
      <ellipse cx={x - 24} cy={y - 30} rx={11} ry={21} fill="#fff" opacity={0.38} transform={`rotate(-24 ${x - 24} ${y - 30})`} />
    </>
  );
}

function Balloons({ d }: { d: Design }) {
  const bits = scatter(16, 3);
  return (
    <>
      {bits.map((b, i) => (
        <g key={i} transform={`rotate(${r1(b.r * 180)} ${r1(b.x)} ${r1(b.y * 0.62)})`}>
          <rect x={r1(b.x)} y={r1(b.y * 0.62)} width={8} height={4} rx={2} fill={["#4AA3FF", "#FFC53D", d.accent, "#34C759"][i % 4]} style={anim("ks-twinkle", 3, { delay: -r1(b.q * 3) })} />
        </g>
      ))}
      <g style={anim("ks-sway", 5.2, { ...pivot(250, 470), vars: { "--amp": "3deg" } })}><Balloon x={158} y={210} fill="#4AA3FF" /></g>
      <g style={anim("ks-sway", 4.4, { ...pivot(250, 470), delay: -1.6, vars: { "--amp": "3.5deg" } })}><Balloon x={345} y={232} fill="#FFC53D" /></g>
      <g style={anim("ks-sway", 6, { ...pivot(250, 470), delay: -3, vars: { "--amp": "2.5deg" } })}><Balloon x={252} y={150} fill={d.accent} /></g>
      <path d="M250 470 l-18 12 l2 -20 Z M250 470 l18 12 l-2 -20 Z" fill={d.accent} />
      <circle cx={250} cy={470} r={5} fill={d.accent} />
      <Kicker y={566} fill={d.ink}>It&apos;s your day</Kicker>
      <Title y={630} fill={d.ink}>Happy birthday</Title>
    </>
  );
}

function Cake({ d }: { d: Design }) {
  const sprinkles = scatter(22, 11);
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={100} fill={d.ink}>Close your eyes</Kicker>
      <Title y={164} fill={d.ink}>Make a wish</Title>
      <circle cx={250} cy={286} r={46} fill="#FFD27A" style={anim("ks-glow", 1.8, { vars: { "--lo": "0.18", "--hi": "0.4" } })} />
      <g style={anim("ks-flicker", 1.4, { origin: "50% 100%" })}>
        <path d="M250 254 C 234 280, 236 304, 250 306 C 264 304, 266 280, 250 254 Z" fill="#FFB020" />
        <path d="M250 278 C 243 290, 244 302, 250 303 C 256 302, 257 290, 250 278 Z" fill="#FFF1C2" />
      </g>
      <rect x={243} y={308} width={14} height={62} rx={4} fill="#fff" />
      {[318, 336, 354].map((y) => <rect key={y} x={243} y={y} width={14} height={7} fill={d.accent} />)}
      <rect x={150} y={370} width={200} height={84} rx={14} fill="#fff" />
      <path d="M150 384 q0 -14 14 -14 h172 q14 0 14 14 v10 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-12 18 -25 0 q-11 18 -21 0 Z" fill={d.accent} />
      <rect x={110} y={454} width={280} height={100} rx={16} fill="#fff" />
      <path d="M110 470 q0 -16 16 -16 h248 q16 0 16 16 v12 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 q-14 20 -28 0 Z" fill={d.accent} />
      {sprinkles.map((s, i) => (
        <rect key={i} x={r1(126 + s.x * 0.48)} y={r1(i % 2 ? 412 + s.y * 0.04 : 500 + s.y * 0.06)} width={9} height={3} rx={1.5} fill={["#4AA3FF", "#FFC53D", "#34C759", "#AF52DE"][i % 4]} transform={`rotate(${r1(s.r * 180)} ${r1(126 + s.x * 0.48)} ${i % 2 ? 412 : 500})`} />
      ))}
      <ellipse cx={250} cy={566} rx={180} ry={16} fill={d.ink} opacity={0.1} />
      <rect x={70} y={552} width={360} height={10} rx={5} fill={d.ink} opacity={0.85} />
      <Twinkles color="#FFB020" pts={[{ x: 196, y: 250, r: 9 }, { x: 306, y: 232, r: 12 }, { x: 318, y: 300, r: 7 }]} />
    </>
  );
}

function PartyHat({ d }: { d: Design }) {
  return (
    <>
      <Falling n={26} seed={21} dur={[6, 10]}>
        {(i) => <rect x={-5} y={-3} width={10} height={6} rx={2} fill={["#2F6FEB", "#FF5A4E", "#FFC53D", "#34C759"][i % 4]} />}
      </Falling>
      {[{ x: 70, c: "#FF5A4E" }, { x: 430, c: "#FFC53D" }].map((s, i) => (
        <path key={i} d={`M${s.x} 40 q 24 30 0 60 q -24 30 0 60 q 24 30 0 60 q -24 30 0 60`} stroke={s.c} strokeWidth={8} fill="none" strokeLinecap="round" style={anim("ks-sway", 3.6, { origin: "50% 0%", delay: -i * 1.2, vars: { "--amp": "5deg" } })} />
      ))}
      <g style={anim("ks-bob", 3.2, { origin: "50% 100%" })}>
        <path d="M250 150 L340 420 H160 Z" fill={d.accent} />
        <clipPath id="hatclip"><path d="M250 150 L340 420 H160 Z" /></clipPath>
        <g clipPath="url(#hatclip)">
          {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M120 ${220 + i * 52} L380 ${180 + i * 52} v18 L120 ${238 + i * 52} Z`} fill="#fff" opacity={0.85} />)}
        </g>
        <rect x={150} y={412} width={200} height={22} rx={11} fill="#FFC53D" />
        <circle cx={250} cy={146} r={26} fill="#FF5A4E" />
        <circle cx={240} cy={138} r={8} fill="#fff" opacity={0.4} />
      </g>
      <Kicker y={540} fill={d.ink}>Another trip around the sun</Kicker>
      <Title y={612} fill={d.ink}>Let&apos;s celebrate</Title>
    </>
  );
}

/* ------------------------------------------------------------------ love */

function BigHeart({ d }: { d: Design }) {
  const small = [{ x: 120, s: 1.2 }, { x: 380, s: 1.6 }, { x: 330, s: 1 }, { x: 170, s: 1.4 }];
  return (
    <>
      {small.map((h, i) => (
        <g key={i} transform={`translate(${h.x} 560) scale(${h.s})`}>
          <path d={HEART} fill={d.accent} opacity={0.5} style={anim("ks-rise", 5 + i, { ease: "ease-out", delay: -i * 1.4, vars: { "--h": "-300px" } })} />
        </g>
      ))}
      <Kicker y={104} fill={d.ink}>You&apos;re my</Kicker>
      <Title y={168} size={62} fill={d.ink} serif italic>favourite</Title>
      <g style={anim("ks-beat", 2.4, { origin: "250px 420px", box: "view-box" })}>
        <path d="M250 570 C 120 480, 64 400, 100 318 C 136 240, 222 244, 250 306 C 278 244, 364 240, 400 318 C 436 400, 380 480, 250 570 Z" fill={d.accent} />
        <ellipse cx={160} cy={322} rx={18} ry={30} fill="#fff" opacity={0.3} transform="rotate(30 160 322)" />
      </g>
      <Title y={640} size={62} fill={d.ink} serif italic>person</Title>
    </>
  );
}

function HeartsAloft({ d }: { d: Design }) {
  const hs = scatter(9, 41);
  return (
    <>
      <Frame color={d.ink} opacity={0.25} />
      {hs.map((h, i) => {
        const s = r1(1.4 + h.r * 1.8);
        const dur = r1(8 + h.q * 5);
        return (
          <g key={i} transform={`translate(${r1(60 + h.x * 0.76)} 700)`}>
            <g style={anim("ks-rise", dur, { ease: "linear", delay: -r1(h.q * dur), vars: { "--h": "-640px" } })}>
              <path d={`M0 ${10 * s} q -6 18 0 36 q 6 18 0 30`} stroke={d.ink} strokeOpacity={0.35} strokeWidth={1.4} fill="none" />
              <g transform={`scale(${s})`}>
                <g style={anim("ks-sway", 3, { origin: "50% 100%", delay: -i, vars: { "--amp": "8deg" } })}>
                  <path d={HEART} fill={i % 3 === 0 ? "#FFFFFF" : d.accent} />
                </g>
              </g>
            </g>
          </g>
        );
      })}
      <Title y={330} size={78} fill={d.ink} serif italic>I love you</Title>
      <Kicker y={378} fill={d.ink}>More than words</Kicker>
    </>
  );
}

function Rings({ d }: { d: Design }) {
  return (
    <>
      <Frame color={d.accent} inset={26} opacity={0.5} />
      <Frame color={d.accent} inset={34} opacity={0.25} />
      {[-1, 1].map((side) => (
        <g key={side} transform={`translate(${250 + side * 150} 230) scale(${side} 1)`}>
          <g style={anim("ks-sway", 6, { origin: "50% 100%", delay: side, vars: { "--amp": "3deg" } })}>
            <path d="M0 160 C -8 100, 6 40, 30 -10" stroke="#8FA88A" strokeWidth={3} fill="none" />
            {[0, 1, 2, 3, 4].map((i) => <ellipse key={i} cx={(i % 2 ? 14 : -10) + i * 6} cy={140 - i * 34} rx={14} ry={6} fill="#8FA88A" transform={`rotate(${i % 2 ? -40 : 40} ${(i % 2 ? 14 : -10) + i * 6} ${140 - i * 34})`} />)}
          </g>
        </g>
      ))}
      <g style={anim("ks-float", 4.5, { vars: { "--rise": "-8px" } })}>
        <circle cx={212} cy={320} r={66} fill="none" stroke={d.accent} strokeWidth={14} />
        <circle cx={288} cy={320} r={66} fill="none" stroke="#D9BE5C" strokeWidth={14} />
        <path d="M 245 263 A 66 66 0 0 1 278 320" stroke={d.accent} strokeWidth={14} fill="none" />
        <path d={starPath(250, 238, 18, 7, 4)} fill="#FFFFFF" stroke={d.accent} strokeWidth={2} />
      </g>
      <Twinkles color={d.accent} pts={[{ x: 140, y: 250, r: 10 }, { x: 362, y: 260, r: 13 }, { x: 330, y: 410, r: 8 }]} />
      <Title y={520} size={50} fill={d.ink} serif italic>Happily</Title>
      <Title y={576} size={50} fill={d.ink} serif italic>ever after</Title>
    </>
  );
}

/* ------------------------------------------------------------------ thanks */

function Sprig({ d }: { d: Design }) {
  const leaves = [
    { x: 236, y: 470, a: -50 }, { x: 266, y: 432, a: 46 }, { x: 228, y: 388, a: -42 },
    { x: 262, y: 346, a: 40 }, { x: 238, y: 302, a: -36 }, { x: 258, y: 262, a: 30 },
  ];
  return (
    <>
      <Frame color={d.accent} />
      <Kicker y={120} fill={d.ink}>Truly</Kicker>
      <g style={anim("ks-sway", 5, pivot(250, 540))}>
        <path d="M250 540 C 240 460, 262 380, 248 240" stroke={d.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
        {leaves.map((l, i) => (
          <g key={i} style={anim("ks-sway", 3.4, { ...pivot(l.x, l.y), delay: -i * 0.5, vars: { "--amp": "6deg" } })}>
            <ellipse cx={l.x + (l.a < 0 ? -28 : 28)} cy={l.y} rx={40} ry={15} fill={i % 2 ? d.accent : "#7FAF6E"} transform={`rotate(${l.a} ${l.x} ${l.y})`} />
          </g>
        ))}
        <ellipse cx={248} cy={226} rx={13} ry={22} fill="#7FAF6E" />
      </g>
      <Title y={624} size={64} fill={d.ink} serif italic>Thank you</Title>
    </>
  );
}

function Flower({ x, y, r, color, center }: { x: number; y: number; r: number; color: string; center: string }) {
  return (
    <g>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i * Math.PI) / 3;
        return <circle key={i} cx={r1(x + Math.cos(a) * r)} cy={r1(y + Math.sin(a) * r)} r={r * 0.85} fill={color} />;
      })}
      <circle cx={x} cy={y} r={r * 0.7} fill={center} />
    </g>
  );
}

function Bouquet({ d }: { d: Design }) {
  const flowers = [
    { x: 250, y: 220, r: 30, c: d.accent, sx: 250, sy: 470 },
    { x: 172, y: 270, r: 24, c: "#F2CC8F", sx: 236, sy: 470 },
    { x: 330, y: 262, r: 26, c: "#E9A6A6", sx: 264, sy: 470 },
    { x: 206, y: 176, r: 20, c: "#81B29A", sx: 244, sy: 470 },
    { x: 300, y: 172, r: 20, c: "#F2CC8F", sx: 256, sy: 470 },
  ];
  return (
    <>
      {flowers.map((f, i) => (
        <g key={i} style={anim("ks-sway", 4 + i * 0.5, { ...pivot(f.sx, f.sy), delay: -i, vars: { "--amp": "2.5deg" } })}>
          <path d={`M${f.sx} ${f.sy} Q ${(f.sx + f.x) / 2} ${f.y + 120}, ${f.x} ${f.y}`} stroke="#5E8C61" strokeWidth={4} fill="none" />
          <ellipse cx={(f.sx + f.x) / 2 + 14} cy={f.y + 110} rx={18} ry={7} fill="#81B29A" transform={`rotate(-30 ${(f.sx + f.x) / 2 + 14} ${f.y + 110})`} />
          <Flower x={f.x} y={f.y} r={f.r} color={f.c} center="#3D2418" />
        </g>
      ))}
      <path d="M170 360 L330 360 L280 520 H220 Z" fill="#F4E1C1" />
      <path d="M170 360 L250 400 L330 360 L300 440 L250 420 L200 440 Z" fill="#E8CFA6" />
      <path d="M226 470 q24 -18 48 0 q-24 18 -48 0 Z M250 470 l-22 34 M250 470 l22 34" stroke={d.accent} strokeWidth={5} fill={d.accent} />
      <Title y={604} size={54} fill={d.ink} serif italic>Thank you</Title>
      <Kicker y={646} fill={d.ink}>So very much</Kicker>
    </>
  );
}

/* ------------------------------------------------------------------ congrats */

function GoldStars({ d }: { d: Design }) {
  const small = [
    { x: 110, y: 170, r: 18 }, { x: 390, y: 200, r: 24 }, { x: 96, y: 420, r: 14 },
    { x: 404, y: 440, r: 16 }, { x: 330, y: 110, r: 11 }, { x: 170, y: 520, r: 10 },
  ];
  return (
    <>
      {small.map((s, i) => (
        <path key={i} d={starPath(s.x, s.y, s.r, s.r * 0.45)} fill={i % 2 ? d.accent : "#F2B705"} style={anim("ks-twinkle", 2.8, { delay: -i * 0.45 })} />
      ))}
      <g style={anim("ks-sway", 5, { vars: { "--amp": "6deg" } })}>
        <path d={starPath(250, 320, 150, 64)} fill="#F2B705" strokeLinejoin="round" stroke="#F2B705" strokeWidth={16} />
        <path d={starPath(250, 320, 96, 40)} fill="#FFD860" />
      </g>
      <path d="M100 498 h300 l-22 26 l22 26 h-300 l22 -26 Z" fill={d.accent} />
      <text x={250} y={530} textAnchor="middle" fill="#fff" style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 16, letterSpacing: 2.5 }}>CONGRATULATIONS</text>
      <Title y={630} size={64} fill={d.ink}>You did it</Title>
    </>
  );
}

function CapToss({ d }: { d: Design }) {
  return (
    <>
      <Falling n={22} seed={77} dur={[7, 11]}>
        {(i) => <rect x={-4} y={-3} width={8} height={6} rx={1.5} fill={i % 2 ? d.accent : "#E5E5E5"} />}
      </Falling>
      <g style={anim("ks-toss", 4, { origin: "250px 300px", box: "view-box" })}>
        <path d="M250 220 L380 270 L250 320 L120 270 Z" fill="#000000" />
        <path d="M250 228 L370 270 L250 312 L130 270 Z" fill="#1B1B1B" />
        <path d="M180 296 V350 Q250 384 320 350 V296 L250 320 Z" fill="#111" />
        <circle cx={250} cy={270} r={7} fill={d.accent} />
        <g style={anim("ks-sway", 1.6, { ...pivot(250, 270), vars: { "--amp": "14deg" } })}>
          <path d="M250 270 Q 300 290 312 330" stroke={d.accent} strokeWidth={4} fill="none" />
          <rect x={304} y={328} width={16} height={34} rx={4} fill={d.accent} />
        </g>
      </g>
      <Kicker y={500} fill={d.ink}>The hard work paid off</Kicker>
      <Title y={572} size={60} fill={d.ink}>Way to go,</Title>
      <Title y={636} size={60} fill={d.accent}>graduate</Title>
    </>
  );
}

/* ------------------------------------------------------------------ holidays */

function FirstSnow({ d }: { d: Design }) {
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
      {tree(150, 1.05, "#3D5C8C")}
      {tree(260, 1.35, "#F4F6FB")}
      {tree(360, 0.85, "#3D5C8C")}
      <path d="M0 590 C 120 548, 360 566, 500 540 V700 H0 Z" fill="#F4F6FB" />
      <Falling n={40} seed={7} dur={[8, 14]}>{(_, r) => <circle r={r1(1.6 + r * 3)} fill="#fff" opacity={r1(0.6 + r * 0.4)} />}</Falling>
      <Title y={656} size={52} fill={d.paper}>Happy holidays</Title>
    </>
  );
}

function Ornament({ d }: { d: Design }) {
  return (
    <>
      <Frame color={d.accent} opacity={0.5} />
      <Falling n={24} seed={13} dur={[10, 16]}>{(_, r) => <circle r={r1(1.4 + r * 2.4)} fill="#fff" opacity={0.7} />}</Falling>
      <g style={anim("ks-sway", 3.8, { ...pivot(250, 22), vars: { "--amp": "6deg" } })}>
        <line x1={250} y1={22} x2={250} y2={178} stroke={d.accent} strokeWidth={2} />
        <rect x={228} y={176} width={44} height={30} rx={6} fill={d.accent} />
        <circle cx={250} cy={330} r={128} fill="#C8102E" />
        <path d="M128 300 Q250 260 372 300 L374 330 Q250 290 126 330 Z" fill={d.accent} />
        <path d="M130 372 Q250 332 370 372 L364 398 Q250 360 136 398 Z" fill={d.accent} />
        {[170, 210, 250, 290, 330].map((x) => <circle key={x} cx={x} cy={350 - Math.abs(x - 250) * 0.1} r={6} fill="#F6EFD9" />)}
        <ellipse cx={196} cy={260} rx={22} ry={40} fill="#fff" opacity={0.25} transform="rotate(30 196 260)" />
      </g>
      <Title y={568} size={56} fill={d.ink} serif italic>Merry &amp; bright</Title>
      <Kicker y={614} fill={d.ink}>Season&apos;s greetings</Kicker>
    </>
  );
}

function TwinkleLights({ d }: { d: Design }) {
  const colors = ["#FFB703", "#FB5607", "#3A86FF", "#06D6A0", "#FF006E"];
  const bulbs = Array.from({ length: 9 }, (_, i) => {
    const x = 40 + i * 52;
    const y = r1(120 + Math.sin((i / 8) * Math.PI) * 70);
    return { x, y, c: colors[i % colors.length] };
  });
  const bulbs2 = Array.from({ length: 8 }, (_, i) => {
    const x = 66 + i * 52;
    const y = r1(330 + Math.sin((i / 7) * Math.PI) * 60);
    return { x, y, c: colors[(i + 2) % colors.length] };
  });
  const row = (bs: typeof bulbs, k: number) => (
    <>
      <path d={`M0 ${bs[0].y - 30} ${bs.map((b) => `Q ${b.x - 26} ${b.y + 12} ${b.x} ${b.y - 8}`).join(" ")} T 500 ${bs[0].y - 30}`} stroke="#3A3A44" strokeWidth={3} fill="none" />
      {bs.map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y}) rotate(${(i % 2 ? 1 : -1) * 12})`}>
          <circle cy={18} r={22} fill={b.c} style={anim("ks-glow", 1.6, { delay: -((i + k) % 3) * 0.55, vars: { "--lo": "0.08", "--hi": "0.4" } })} />
          <rect x={-6} y={-8} width={12} height={10} rx={2} fill="#55555F" />
          <path d="M0 2 C -12 10, -12 30, 0 36 C 12 30, 12 10, 0 2 Z" fill={b.c} style={anim("ks-glow", 1.6, { delay: -((i + k) % 3) * 0.55, vars: { "--lo": "0.55", "--hi": "1" } })} />
        </g>
      ))}
    </>
  );
  return (
    <>
      {row(bulbs, 0)}
      {row(bulbs2, 1)}
      <Title y={548} size={52} fill={d.ink}>Warmest wishes</Title>
      <Kicker y={598} fill={d.ink}>This holiday season</Kicker>
    </>
  );
}

function FallingLeaves({ d }: { d: Design }) {
  const colors = ["#C8553D", "#F28F3B", "#E0A458", "#8C4A2F"];
  return (
    <>
      <Frame color={d.ink} />
      <Falling n={18} seed={5} dur={[9, 14]}>
        {(i, r) => (
          <g transform={`scale(${r1(0.8 + r * 0.9)})`}>
            <path d={LEAF} fill={colors[i % 4]} />
            <path d="M0 -16 V18" stroke="#00000033" strokeWidth={1.5} />
          </g>
        )}
      </Falling>
      <Title y={330} size={64} fill={d.ink} serif italic>Grateful</Title>
      <Title y={392} size={64} fill={d.ink} serif italic>for you</Title>
      <Kicker y={446} fill={d.accent}>Happy Thanksgiving</Kicker>
    </>
  );
}

function Pumpkin({ d }: { d: Design }) {
  return (
    <>
      {[{ x: 110, y: 130 }, { x: 380, y: 100 }, { x: 330, y: 190 }].map((b, i) => (
        <g key={i} transform={`translate(${b.x} ${b.y})`}>
          <g style={anim("ks-float", 3 + i, { delay: -i, vars: { "--rise": "-14px" } })}>
            <path d="M0 0 q -14 -14 -32 -6 q 8 4 6 12 q 10 -6 18 2 q 4 -8 8 -8 q 4 0 8 8 q 8 -8 18 -2 q -2 -8 6 -12 q -18 -8 -32 6 Z" fill="#0B0910" style={anim("ks-flap", 0.5, { origin: "50% 60%" })} />
          </g>
        </g>
      ))}
      <g transform="translate(250 400)">
      <g style={anim("ks-sway", 4, { origin: "50% 100%", vars: { "--amp": "2deg" } })}>
        <path d="M-6 -118 q 4 -28 26 -36" stroke="#5E8C61" strokeWidth={9} fill="none" strokeLinecap="round" />
        <ellipse rx={150} ry={118} fill={d.accent} />
        <ellipse rx={96} ry={118} fill="#FF9505" />
        <ellipse rx={40} ry={118} fill={d.accent} />
        <g style={anim("ks-glow", 1.3, { vars: { "--lo": "0.6", "--hi": "1" } })}>
          <path d="M-74 -30 l28 -34 l28 34 Z M18 -30 l28 -34 l28 34 Z" fill="#FFE066" />
          <path d="M-90 26 q90 70 180 0 l-24 8 l-12 -14 l-16 16 l-16 -16 l-16 16 l-16 -16 l-16 16 l-16 -16 l-12 14 Z" fill="#FFE066" />
        </g>
      </g>
      </g>
      <Title y={604} size={56} fill={d.ink}>Happy Halloween</Title>
    </>
  );
}

/* ------------------------------------------------------------------ just because */

function Sunrise({ d }: { d: Design }) {
  const rays = Array.from({ length: 18 }, (_, i) => i * 20);
  return (
    <>
      <clipPath id="sky"><rect width={500} height={420} /></clipPath>
      <g clipPath="url(#sky)">
        <g style={anim("ks-spin", 40, { origin: "250px 420px", box: "view-box", ease: "linear" })}>
          {rays.map((a) => {
            const r = (a * Math.PI) / 180;
            return <line key={a} x1={r1(250 + Math.cos(r) * 150)} y1={r1(420 + Math.sin(r) * 150)} x2={r1(250 + Math.cos(r) * 196)} y2={r1(420 + Math.sin(r) * 196)} stroke={d.accent} strokeWidth={10} strokeLinecap="round" />;
          })}
        </g>
        <path d="M130 420 a120 120 0 0 1 240 0 Z" fill={d.accent} style={anim("ks-float", 6, { vars: { "--rise": "-8px" } })} />
      </g>
      <rect x={60} y={418} width={380} height={8} rx={4} fill={d.ink} />
      {[{ y: 458, w: 260 }, { y: 488, w: 180 }, { y: 518, w: 100 }].map((l, i) => (
        <line key={i} x1={250 - l.w / 2} x2={250 + l.w / 2} y1={l.y} y2={l.y} stroke={d.accent} strokeWidth={8} strokeLinecap="round" opacity={0.55} style={anim("ks-drift", 4, { delay: -i * 1.2, vars: { "--dx": `${(i % 2 ? -1 : 1) * 18}px` } })} />
      ))}
      <Kicker y={590} fill={d.ink}>No reason at all</Kicker>
      <Title y={648} fill={d.ink}>Just because</Title>
    </>
  );
}

function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-60 20 a 26 26 0 0 1 10 -50 a 34 34 0 0 1 62 -10 a 28 28 0 0 1 48 26 a 22 22 0 0 1 0 44 h-120 a 20 20 0 0 1 0 -10 Z" fill={fill} />
    </g>
  );
}

function Rainbow({ d }: { d: Design }) {
  const arcs = ["#FF595E", "#FFCA3A", "#8AC926", "#1982C4", "#6A4C93"];
  return (
    <>
      <g style={anim("ks-float", 6, { vars: { "--rise": "-6px" } })}>
        {arcs.map((c, i) => <path key={c} d={`M${90 + i * 22} 420 A ${160 - i * 22} ${160 - i * 22} 0 0 1 ${410 - i * 22} 420`} stroke={c} strokeWidth={22} fill="none" />)}
      </g>
      <g style={anim("ks-drift", 7, { vars: { "--dx": "22px" } })}><Cloud x={100} y={410} s={1.1} fill="#FFFFFF" /></g>
      <g style={anim("ks-drift", 8, { delay: -3, vars: { "--dx": "-22px" } })}><Cloud x={400} y={410} s={1} fill="#FFFFFF" /></g>
      <g style={anim("ks-drift", 9, { delay: -2, vars: { "--dx": "26px" } })}><Cloud x={360} y={140} s={0.6} fill="#FFFFFF" /></g>
      <Twinkles color={d.accent} pts={[{ x: 110, y: 180, r: 11 }, { x: 250, y: 140, r: 8 }, { x: 420, y: 250, r: 9 }]} />
      <Title y={566} size={62} fill={d.ink}>Hello,</Title>
      <Title y={630} size={62} fill={d.ink} serif italic>sunshine</Title>
    </>
  );
}

/* ------------------------------------------------------------------ new baby */

function Mobile({ d }: { d: Design }) {
  const charms = [
    { x: 130, len: 120, shape: "moon" },
    { x: 210, len: 190, shape: "star" },
    { x: 290, len: 150, shape: "cloud" },
    { x: 370, len: 210, shape: "heart" },
  ];
  return (
    <>
      <Frame color={d.accent} />
      <g style={anim("ks-sway", 6, { ...pivot(250, 60), vars: { "--amp": "3deg" } })}>
        <line x1={250} y1={30} x2={250} y2={80} stroke={d.ink} strokeWidth={2} />
        <path d="M110 92 Q250 64 390 92" stroke={d.ink} strokeWidth={5} fill="none" strokeLinecap="round" />
        {charms.map((c, i) => (
          <g key={i} style={anim("ks-sway", 3 + i * 0.4, { ...pivot(c.x, 88), delay: -i * 0.8, vars: { "--amp": "7deg" } })}>
            <line x1={c.x} y1={86} x2={c.x} y2={86 + c.len} stroke={d.ink} strokeWidth={1.5} opacity={0.6} />
            <g transform={`translate(${c.x} ${86 + c.len + 24})`}>
              {c.shape === "moon" && <><circle r={30} fill="#F2CC8F" /><circle cx={14} cy={-10} r={26} fill={d.paper} /></>}
              {c.shape === "star" && <path d={starPath(0, 0, 36, 15)} fill={d.accent} />}
              {c.shape === "cloud" && <Cloud x={0} y={-4} s={0.62} fill="#BFD9EC" />}
              {c.shape === "heart" && <path d={HEART} transform="scale(2.4)" fill="#E9A6A6" />}
            </g>
          </g>
        ))}
      </g>
      <Title y={540} size={54} fill={d.ink}>Hello,</Title>
      <Title y={600} size={54} fill={d.ink} serif italic>little one</Title>
      <Kicker y={646} fill={d.ink}>Welcome to the world</Kicker>
    </>
  );
}

/* ------------------------------------------------------------------ get well */

function Tea({ d }: { d: Design }) {
  return (
    <>
      <Frame color={d.ink} />
      {[210, 250, 290].map((x, i) => (
        <path key={x} d={`M${x} 250 q -16 -30 0 -60 q 16 -30 0 -60`} stroke={d.ink} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" fill="none" style={anim("ks-steam", 3.6, { delay: -i * 1.2, origin: "50% 100%" })} />
      ))}
      <path d="M150 270 H350 V400 Q350 470 280 470 H220 Q150 470 150 400 Z" fill={d.accent} />
      <path d="M350 300 q 56 0 56 46 q 0 46 -56 46" stroke={d.accent} strokeWidth={18} fill="none" />
      <ellipse cx={250} cy={272} rx={100} ry={14} fill="#B07D4F" />
      <g style={anim("ks-sway", 3, { ...pivot(300, 272), vars: { "--amp": "6deg" } })}>
        <path d="M300 272 Q 318 300 314 340" stroke="#ffffff" strokeWidth={2} fill="none" />
        <rect x={300} y={338} width={30} height={26} rx={3} fill="#FBF6EE" />
        <path d={HEART} transform="translate(315 352) scale(0.55)" fill={d.accent} />
      </g>
      <ellipse cx={250} cy={486} rx={150} ry={16} fill={d.ink} opacity={0.12} />
      <Title y={582} size={54} fill={d.ink}>Feel better</Title>
      <Title y={640} size={54} fill={d.ink} serif italic>soon</Title>
    </>
  );
}

/* ------------------------------------------------------------------ thinking of you */

function Tulip({ d }: { d: Design }) {
  return (
    <>
      <Frame color={d.ink} />
      <g style={anim("ks-sway", 6, { ...pivot(250, 560), vars: { "--amp": "3deg" } })}>
        <path d="M250 560 C 250 470, 246 400, 250 330" stroke={d.accent} strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M248 520 C 200 500, 176 450, 180 400 C 214 424, 238 470, 248 520 Z" fill={d.accent} />
        <path d="M252 480 C 296 462, 318 420, 316 376 C 284 398, 262 436, 252 480 Z" fill={d.accent} opacity={0.75} />
        <path d="M250 340 C 214 336, 196 300, 200 248 L 226 274 L 250 236 L 274 274 L 300 248 C 304 300, 286 336, 250 340 Z" fill="#D98E8E" />
        <path d="M250 340 C 236 320, 232 290, 250 236 C 268 290, 264 320, 250 340 Z" fill="#C97474" />
      </g>
      <rect x={150} y={560} width={200} height={3} rx={1.5} fill={d.ink} opacity={0.25} />
      <Title y={636} size={44} fill={d.ink} serif italic>Thinking of you</Title>
    </>
  );
}

function QuietMoon({ d }: { d: Design }) {
  const stars = scatter(26, 9).filter((s) => s.y < 420);
  return (
    <>
      {stars.map((s, i) => <circle key={i} cx={r1(s.x)} cy={r1(s.y)} r={r1(1 + s.r * 2)} fill="#fff" style={anim("ks-twinkle", r1(2 + s.q * 3), { delay: -r1(s.q * 4) })} />)}
      <g style={anim("ks-float", 7, { vars: { "--rise": "-10px" } })}>
        <circle cx={250} cy={260} r={130} fill="#F4E9C8" opacity={0.12} style={anim("ks-glow", 5, { vars: { "--lo": "0.6", "--hi": "1" } })} />
        <circle cx={250} cy={260} r={96} fill="#F4E9C8" />
        <circle cx={290} cy={232} r={84} fill={d.paper} />
      </g>
      <g style={anim("ks-drift", 10, { vars: { "--dx": "30px" } })}><Cloud x={150} y={380} s={0.9} fill="#36446B" /></g>
      <g style={anim("ks-drift", 12, { delay: -4, vars: { "--dx": "-24px" } })}><Cloud x={390} y={330} s={0.6} fill="#36446B" /></g>
      <Title y={540} size={48} fill={d.ink} serif italic>Holding you</Title>
      <Title y={594} size={48} fill={d.ink} serif italic>close</Title>
      <Kicker y={642} fill={d.ink}>Thinking of you</Kicker>
    </>
  );
}

const ART: Record<string, (p: { d: Design }) => ReactNode> = {
  balloons: Balloons, cake: Cake, party: PartyHat,
  heart: BigHeart, aloft: HeartsAloft, rings: Rings,
  thanks: Sprig, bouquet: Bouquet,
  stars: GoldStars, grad: CapToss,
  snow: FirstSnow, ornament: Ornament, lights: TwinkleLights, leaves: FallingLeaves, pumpkin: Pumpkin,
  sun: Sunrise, rainbow: Rainbow, mobile: Mobile, tea: Tea, tulip: Tulip, moon: QuietMoon,
};

export function CardArt({ design, className, still }: { design: Design; className?: string; still?: boolean }) {
  const Art = ART[design.id] ?? EXTRA_ART[design.id] ?? Balloons;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={`ks-art${still ? " is-still" : ""} ${className ?? ""}`} role="img" aria-label={`${design.name} card`} preserveAspectRatio="xMidYMid slice">
      <rect width={W} height={H} fill={design.paper} />
      <Art d={design} />
    </svg>
  );
}
