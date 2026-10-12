import { anim, Falling, Frame, HEART, Kicker, pivot, r1, scatter, starPath, Title, Twinkles, type ArtMap, type ArtProps } from "./kit";

// Covers for the "seasons" group. Register each one in ART by its design id.

const BULBS = ["#FF5A5F", "#FFC53D", "#5BC0EB", "#F7F2E4", "#B98CFF"];
const qpt = (a: number[], c: number[], b: number[], t: number) => ({
  x: r1((1 - t) ** 2 * a[0] + 2 * t * (1 - t) * c[0] + t * t * b[0]),
  y: r1((1 - t) ** 2 * a[1] + 2 * t * (1 - t) * c[1] + t * t * b[1]),
});

function XmasTree({ d }: ArtProps) {
  const garlands = [[[188, 250], [250, 276], [312, 240]], [[155, 340], [250, 372], [347, 326]], [[128, 440], [250, 476], [372, 424]]];
  const lights = garlands.flatMap((g, k) => Array.from({ length: 4 + k }, (_, i) => qpt(g[0], g[1], g[2], (i + 0.5) / (4 + k))));
  const dur = 3;
  return (
    <>
      <Falling n={26} seed={17} dur={[9, 15]}>{(_, r) => <circle r={r1(1.5 + r * 2.5)} fill="#fff" opacity={0.75} />}</Falling>
      <path d="M30 520 Q250 478 470 520 V540 H30 Z" fill="#fff" opacity={0.9} />
      <rect x={232} y={456} width={36} height={44} rx={4} fill="#7A4A2A" />
      <path d="M250 290 L395 462 Q250 480 105 462 Z" fill="#1F6B43" />
      <path d="M250 210 L355 350 Q250 366 145 350 Z" fill="#2A8452" />
      <path d="M250 150 L320 260 Q250 272 180 260 Z" fill="#35995F" />
      {garlands.map((g, i) => <path key={i} d={`M${g[0].join(" ")} Q${g[1].join(" ")} ${g[2].join(" ")}`} stroke={d.accent} strokeWidth={2.5} fill="none" opacity={0.7} />)}
      {lights.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={7} fill={BULBS[i % BULBS.length]} style={anim("ks-seasons-blink", dur, { delay: -r1(((lights.length - i) * dur) / lights.length) })} />
      ))}
      <circle cx={250} cy={140} r={46} fill="#FFE7A3" style={anim("ks-glow", 2.6, { vars: { "--lo": "0.12", "--hi": "0.4" } })} />
      <path d={starPath(250, 142, 28, 12)} fill={d.accent} style={anim("ks-beat", 2.6)} />
      <Kicker y={588} fill={d.ink}>Wishing you a</Kicker>
      <Title y={644} size={50} fill={d.ink} serif italic>Merry Christmas</Title>
    </>
  );
}

function Gingerbread({ d }: ArtProps) {
  const icing = "#FFF8EE";
  const zig = (x: number, y: number, w: number) => `M${x - w / 2} ${y} l${w / 6} -6 l${w / 6} 6 l${w / 6} -6 l${w / 6} 6 l${w / 6} -6 l${w / 6} 6`;
  return (
    <>
      <Frame color={d.accent} opacity={0.35} />
      <Twinkles color={d.accent} pts={[{ x: 110, y: 160, r: 10 }, { x: 395, y: 150, r: 13 }, { x: 400, y: 420, r: 9 }, { x: 96, y: 440, r: 8 }]} />
      <ellipse cx={250} cy={500} rx={120} ry={12} fill={d.ink} opacity={0.08} />
      <g stroke={d.accent} strokeLinecap="round" fill="none">
        <line x1={228} y1={400} x2={205} y2={482} strokeWidth={42} />
        <line x1={272} y1={400} x2={295} y2={482} strokeWidth={42} />
        <line x1={210} y1={292} x2={150} y2={346} strokeWidth={36} />
        <line x1={250} y1={282} x2={250} y2={392} strokeWidth={106} />
      </g>
      <g style={anim("ks-sway", 1.6, { ...pivot(290, 292), vars: { "--amp": "14deg" } })}>
        <line x1={290} y1={292} x2={352} y2={232} stroke={d.accent} strokeWidth={36} strokeLinecap="round" />
        <path d={zig(342, 248, 26)} stroke={icing} strokeWidth={3} fill="none" transform="rotate(-44 342 248)" />
      </g>
      <circle cx={250} cy={208} r={58} fill={d.accent} />
      <g stroke={icing} strokeWidth={3.5} fill="none" strokeLinecap="round">
        <path d="M228 226 Q250 246 272 226" />
        <path d={zig(160, 334, 26)} transform="rotate(48 160 334)" />
        <path d={zig(207, 470, 30)} />
        <path d={zig(293, 470, 30)} />
      </g>
      <circle cx={230} cy={198} r={6} fill={icing} />
      <circle cx={270} cy={198} r={6} fill={icing} />
      <circle cx={214} cy={222} r={8} fill="#F08A8A" opacity={0.6} />
      <circle cx={286} cy={222} r={8} fill="#F08A8A" opacity={0.6} />
      {[300, 338, 376].map((y, i) => <circle key={y} cx={250} cy={y} r={9} fill={["#D93A3A", "#3E9B5A", "#D93A3A"][i]} stroke={icing} strokeWidth={2.5} />)}
      <Kicker y={574} fill={d.ink}>Freshly baked</Kicker>
      <Title y={636} size={48} fill={d.ink}>Season&apos;s eatings</Title>
    </>
  );
}

function Menorah({ d }: ArtProps) {
  const gold = "#D4A73A";
  const cups = Array.from({ length: 9 }, (_, i) => ({ x: 250 + (i - 4) * 44, y: i === 4 ? 340 : 390 }));
  return (
    <>
      <Kicker y={104} fill={d.ink}>Wishing you light</Kicker>
      <Title y={166} size={52} fill={d.ink}>Happy Hanukkah</Title>
      <g stroke={gold} strokeWidth={10} fill="none" strokeLinecap="round">
        {[1, 2, 3, 4].map((k) => <path key={k} d={`M${250 - 44 * k} 396 A${44 * k} ${r1(35 * k)} 0 0 0 ${250 + 44 * k} 396`} />)}
        <line x1={250} y1={344} x2={250} y2={540} />
      </g>
      <path d="M200 556 Q250 528 300 556 Z" fill={gold} />
      <rect x={180} y={552} width={140} height={12} rx={6} fill={gold} />
      {cups.map((c, i) => (
        <g key={i}>
          <circle cx={c.x} cy={c.y - 68} r={22} fill="#FFD27A" style={anim("ks-glow", 1.8, { delay: -i * 0.3, vars: { "--lo": "0.15", "--hi": "0.4" } })} />
          <g style={anim("ks-flicker", 1.2 + (i % 3) * 0.2, { origin: "50% 100%", delay: -i * 0.37 })}>
            <path d={`M${c.x} ${c.y - 86} C${c.x - 12} ${c.y - 66}, ${c.x - 11} ${c.y - 52}, ${c.x} ${c.y - 50} C${c.x + 11} ${c.y - 52}, ${c.x + 12} ${c.y - 66}, ${c.x} ${c.y - 86} Z`} fill="#FFB020" />
            <path d={`M${c.x} ${c.y - 70} C${c.x - 5} ${c.y - 62}, ${c.x - 5} ${c.y - 54}, ${c.x} ${c.y - 53} C${c.x + 5} ${c.y - 54}, ${c.x + 5} ${c.y - 62}, ${c.x} ${c.y - 70} Z`} fill="#FFF1C2" />
          </g>
          <rect x={c.x - 7} y={c.y - 48} width={14} height={48} rx={3} fill={i % 2 ? "#FFFFFF" : "#8DB3E8"} />
          <rect x={c.x - 16} y={c.y} width={32} height={10} rx={3} fill={gold} />
        </g>
      ))}
      <rect x={70} y={570} width={360} height={8} rx={4} fill={d.ink} opacity={0.15} />
      <Twinkles color={d.accent} pts={[{ x: 70, y: 250, r: 9 }, { x: 430, y: 236, r: 12 }, { x: 420, y: 480, r: 8 }]} />
    </>
  );
}

function Diya({ d }: ArtProps) {
  const cols = ["#E8457A", "#2BB3A3", d.accent, "#FFD25A"];
  return (
    <>
      <g style={anim("ks-spin", 48, { ...pivot(250, 380), ease: "linear" })}>
        {Array.from({ length: 12 }, (_, i) => (
          <ellipse key={i} cx={250} cy={262} rx={18} ry={34} fill={cols[i % 2 ? 0 : 1]} opacity={0.85} transform={`rotate(${i * 30} 250 380)`} />
        ))}
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={250} cy={218} r={5} fill={cols[2 + (i % 2)]} transform={`rotate(${i * 15} 250 380)`} />
        ))}
        <circle cx={250} cy={380} r={92} fill="none" stroke="#FFD25A" strokeWidth={3} strokeDasharray="4 10" strokeLinecap="round" />
      </g>
      <circle cx={340} cy={326} r={46} fill="#FFD27A" style={anim("ks-glow", 2, { vars: { "--lo": "0.18", "--hi": "0.45" } })} />
      <g style={anim("ks-flicker", 1.3, { origin: "50% 100%" })}>
        <path d="M340 290 C 324 318, 326 342, 340 346 C 354 342, 356 318, 340 290 Z" fill="#FFB020" />
        <path d="M340 314 C 333 326, 334 340, 340 342 C 346 340, 347 326, 340 314 Z" fill="#FFF1C2" />
      </g>
      <path d="M160 384 C 182 452, 300 458, 334 396 L 358 366 C 330 378, 300 390, 250 392 C 210 392, 184 388, 160 384 Z" fill="#C0582A" />
      <path d="M164 386 C 200 394, 300 396, 350 372" stroke="#8E3A18" strokeWidth={4} fill="none" strokeLinecap="round" />
      {[200, 230, 260, 290].map((x, i) => <circle key={x} cx={x} cy={420 + (i % 2) * 6} r={5} fill="#FFD25A" />)}
      <Twinkles color={d.accent} pts={[{ x: 90, y: 110, r: 10 }, { x: 410, y: 140, r: 13 }, { x: 70, y: 520, r: 8 }, { x: 430, y: 560, r: 9 }]} />
      <Kicker y={590} fill={d.ink}>Light, love &amp; sweets</Kicker>
      <Title y={648} fill={d.ink}>Happy Diwali</Title>
    </>
  );
}

function Burst({ x, y, r, c, delay }: { x: number; y: number; r: number; c: string; delay: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g style={anim("ks-seasons-burst", 3.3, { ease: "ease-out", delay })}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i * Math.PI) / 6;
          const [cx, sy] = [Math.cos(a), Math.sin(a)];
          return (
            <g key={i}>
              <line x1={r1(cx * r * 0.35)} y1={r1(sy * r * 0.35)} x2={r1(cx * r * 0.85)} y2={r1(sy * r * 0.85)} stroke={c} strokeWidth={4} strokeLinecap="round" />
              <circle cx={r1(cx * r)} cy={r1(sy * r)} r={4} fill={c} />
            </g>
          );
        })}
      </g>
    </g>
  );
}

function Fireworks({ d }: ArtProps) {
  const sky = "#0B1022";
  const wins = scatter(18, 29);
  const towers = [[50, 450], [90, 420], [130, 470], [170, 400], [210, 440], [250, 380], [290, 430], [330, 410], [370, 455], [410, 425], [450, 465]];
  return (
    <>
      <Twinkles color="#FFF6E0" pts={[{ x: 70, y: 80, r: 6 }, { x: 250, y: 60, r: 5 }, { x: 430, y: 90, r: 7 }, { x: 410, y: 300, r: 5 }]} />
      <Burst x={150} y={170} r={80} c="#FF5A6E" delay={0} />
      <Burst x={340} y={140} r={95} c={d.accent} delay={-1.1} />
      <Burst x={290} y={300} r={70} c="#5BD1FF" delay={-2.2} />
      <Burst x={120} y={320} r={55} c="#B98CFF" delay={-0.6} />
      {towers.map(([x, y], i) => <rect key={i} x={x - 20} y={y} width={40} height={560 - y} fill={sky} />)}
      <path d="M225 380 Q245 340 265 380 Z" fill={sky} />
      {wins.map((w, i) => (
        <rect key={i} x={r1(40 + w.x * 0.8)} y={r1(480 + w.y * 0.08)} width={6} height={8} fill={d.accent} style={anim("ks-glow", 3 + (i % 4), { delay: -r1(w.q * 4), vars: { "--lo": "0.3", "--hi": "0.95" } })} />
      ))}
      <rect x={30} y={556} width={440} height={6} fill={sky} />
      <Kicker y={604} fill={d.ink}>Here&apos;s to you</Kicker>
      <Title y={652} size={52} fill={d.ink}>Happy New Year</Title>
    </>
  );
}

const egg = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx} ${cy - ry} C${cx + rx * 0.85} ${cy - ry}, ${cx + rx} ${cy + ry * 0.15}, ${cx + rx} ${cy + ry * 0.3} C${cx + rx} ${cy + ry * 0.8}, ${cx + rx * 0.5} ${cy + ry}, ${cx} ${cy + ry} C${cx - rx * 0.5} ${cy + ry}, ${cx - rx} ${cy + ry * 0.8}, ${cx - rx} ${cy + ry * 0.3} C${cx - rx} ${cy + ry * 0.15}, ${cx - rx * 0.85} ${cy - ry}, ${cx} ${cy - ry} Z`;

function Easter({ d }: ArtProps) {
  const grass = "M30 580 V496 " + Array.from({ length: 22 }, (_, i) => `L${r1(40 + i * 20)} ${i % 2 ? 498 : 478}`).join(" ") + " L470 496 V580 Q250 606 30 580 Z";
  return (
    <>
      <Twinkles color={d.accent} pts={[{ x: 110, y: 110, r: 10 }, { x: 390, y: 96, r: 13 }, { x: 420, y: 300, r: 8 }, { x: 80, y: 320, r: 9 }]} />
      <Kicker y={196} fill={d.ink}>Hoppy spring</Kicker>
      <Title y={262} fill={d.ink}>Happy Easter</Title>
      <ellipse cx={250} cy={520} rx={230} ry={50} fill="#A7D18F" />
      <g style={anim("ks-seasons-peek", 4.5)}>
        <ellipse cx={262} cy={540} rx={36} ry={30} fill="#FFD84D" />
        <circle cx={262} cy={500} r={30} fill="#FFD84D" />
        <circle cx={252} cy={494} r={4} fill={d.ink} />
        <circle cx={272} cy={494} r={4} fill={d.ink} />
        <path d="M256 504 L268 504 L262 513 Z" fill="#F08A24" />
      </g>
      <clipPath id="easter-a"><path d={egg(170, 420, 70, 92)} /></clipPath>
      <clipPath id="easter-b"><path d={egg(350, 436, 62, 82)} /></clipPath>
      <g style={anim("ks-seasons-wobble", 3.6, pivot(170, 512))}>
        <path d={egg(170, 420, 70, 92)} fill={d.accent} />
        <g clipPath="url(#easter-a)">
          <path d="M90 388 l20 -16 l20 16 l20 -16 l20 16 l20 -16 l20 16 l20 -16 l20 16 v18 l-20 -16 l-20 16 l-20 -16 l-20 16 l-20 -16 l-20 16 l-20 -16 l-20 16 Z" fill="#FFF8EE" />
          <rect x={90} y={450} width={160} height={14} fill="#FFD84D" />
        </g>
      </g>
      <path d={egg(350, 436, 62, 82)} fill="#8EC5E8" />
      <g clipPath="url(#easter-b)">
        {[0, 1, 2, 3, 4, 5].map((i) => <circle key={i} cx={300 + (i % 3) * 50} cy={i < 3 ? 410 : 460} r={9} fill="#FFF8EE" />)}
        <rect x={280} y={428} width={140} height={10} fill="#B98CFF" />
      </g>
      <path d={grass} fill="#7DB46C" />
      {[90, 410].map((x, i) => (
        <g key={x} style={anim("ks-sway", 3.2, { ...pivot(x, 500), delay: -i, vars: { "--amp": "5deg" } })}>
          <line x1={x} y1={500} x2={x} y2={450} stroke="#5E9A4E" strokeWidth={3} />
          {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={x} cy={438} r={7} fill="#FFF8EE" transform={`rotate(${a} ${x} 450)`} />)}
          <circle cx={x} cy={450} r={5} fill="#FFD84D" />
        </g>
      ))}
    </>
  );
}

function Lantern({ x, top, cy, rx, ry, delay }: { x: number; top: number; cy: number; rx: number; ry: number; delay: number }) {
  const gold = "#E8B43A";
  const bot = cy + ry + 6;
  return (
    <g style={anim("ks-sway", 4.2, { ...pivot(x, top), delay, vars: { "--amp": "4deg" } })}>
      <line x1={x} y1={top} x2={x} y2={cy - ry} stroke="#5A3A1A" strokeWidth={2} />
      <rect x={r1(x - rx * 0.45)} y={cy - ry - 10} width={r1(rx * 0.9)} height={16} rx={4} fill={gold} />
      <ellipse cx={x} cy={cy} rx={rx} ry={ry} fill="#D62828" />
      <ellipse cx={x} cy={cy} rx={r1(rx * 0.55)} ry={ry} fill="none" stroke="#A81E1E" strokeWidth={2.5} />
      <ellipse cx={x} cy={cy} rx={r1(rx * 0.15)} ry={ry} fill="none" stroke="#A81E1E" strokeWidth={2.5} />
      <ellipse cx={r1(x - rx * 0.6)} cy={cy - 12} rx={8} ry={20} fill="#fff" opacity={0.25} />
      <circle cx={x} cy={cy} r={r1(rx * 0.22)} fill={gold} />
      <rect x={r1(x - rx * 0.45)} y={cy + ry - 6} width={r1(rx * 0.9)} height={14} rx={4} fill={gold} />
      <g style={anim("ks-sway", 2.2, { ...pivot(x, bot), delay: delay - 0.5, vars: { "--amp": "8deg" } })}>
        <circle cx={x} cy={bot + 6} r={5} fill={gold} />
        {[-6, -2, 2, 6].map((o) => <line key={o} x1={x + o / 2} y1={bot + 10} x2={x + o} y2={bot + 58} stroke={gold} strokeWidth={2.5} strokeLinecap="round" />)}
      </g>
    </g>
  );
}

function Lunar({ d }: ArtProps) {
  return (
    <>
      <path d="M30 90 Q250 170 470 90" stroke="#5A3A1A" strokeWidth={2.5} fill="none" />
      <Lantern x={120} top={116} cy={250} rx={56} ry={46} delay={-0.8} />
      <Lantern x={380} top={116} cy={240} rx={56} ry={46} delay={-2.4} />
      <Lantern x={250} top={130} cy={330} rx={72} ry={60} delay={0} />
      <Twinkles color="#E8B43A" pts={[{ x: 60, y: 400, r: 9 }, { x: 440, y: 380, r: 11 }, { x: 180, y: 440, r: 7 }]} />
      <Kicker y={520} fill={d.ink}>Luck &amp; joy to you</Kicker>
      <Title y={584} size={54} fill={d.ink}>Happy Lunar</Title>
      <Title y={640} size={54} fill={d.ink}>New Year</Title>
    </>
  );
}

const MAPLE: [number, number][] = [[0, -100], [18, -66], [34, -74], [30, -30], [62, -50], [72, -64], [80, -42], [100, -38], [84, -12], [96, -2], [60, 14], [66, 34], [30, 30], [8, 40], [8, 82]];
const maple = (s: number, ox = 0, oy = 0) => {
  const pts = [...MAPLE, ...MAPLE.slice(1).reverse().map(([x, y]) => [-x, y] as [number, number])];
  return pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(ox + x * s)} ${r1(oy + y * s)}`).join(" ") + " Z";
};

function CanadaDay({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.3} />
      <Falling n={14} seed={53} dur={[9, 14]}>{(i) => <path d={maple(0.16)} fill={i % 3 ? d.accent : "#E8833A"} opacity={0.7} />}</Falling>
      <g style={anim("ks-sway", 5, { ...pivot(250, 462), vars: { "--amp": "3deg" } })}>
        <path d={maple(1.85, 250, 310)} fill={d.accent} />
        <g stroke="#fff" strokeOpacity={0.35} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M250 450 V160 M250 330 L370 250 M250 330 L130 250 M250 380 L350 350 M250 380 L150 350" />
        </g>
      </g>
      <Kicker y={570} fill={d.ink}>Coast to coast</Kicker>
      <Title y={632} size={48} fill={d.ink}>Happy Canada Day</Title>
    </>
  );
}

function Valentine({ d }: ArtProps) {
  const small = [{ x: 90, s: 1.2 }, { x: 410, s: 1.5 }, { x: 380, s: 1 }, { x: 120, s: 1.4 }];
  return (
    <>
      {small.map((h, i) => (
        <g key={i} transform={`translate(${h.x} 560) scale(${h.s})`}>
          <path d={HEART} fill={d.accent} opacity={0.45} style={anim("ks-rise", 5 + i, { ease: "ease-out", delay: -i * 1.4, vars: { "--h": "-380px" } })} />
        </g>
      ))}
      <Kicker y={96} fill={d.ink}>Sweet as can be</Kicker>
      <g style={anim("ks-bob", 4, { origin: "50% 100%" })}>
        <rect x={243} y={340} width={14} height={220} rx={7} fill="#FFF8F0" stroke={d.ink} strokeOpacity={0.15} />
        <g transform="translate(250 300) scale(8)">
          <path d={HEART} fill={d.accent} />
          <path d={HEART} transform="scale(0.68) translate(0 -2)" fill="none" stroke="#FF8FB1" strokeWidth={1.4} />
          <path d={HEART} transform="scale(0.36) translate(0 -4)" fill="none" stroke="#FF8FB1" strokeWidth={2.4} />
          <ellipse cx={-8} cy={-11} rx={2} ry={3.6} fill="#fff" opacity={0.45} transform="rotate(30 -8 -11)" />
        </g>
        <g style={anim("ks-sway", 2, { ...pivot(250, 390), vars: { "--amp": "7deg" } })}>
          <path d="M250 390 L214 470 L228 464 L238 478 Z M250 390 L286 470 L272 464 L262 478 Z" fill="#FFFFFF" stroke="#F28AB2" strokeWidth={2} />
        </g>
        <g style={anim("ks-seasons-flutter", 1.8, pivot(250, 390))}>
          <path d="M250 390 C 196 340, 170 430, 250 396 Z M250 390 C 304 340, 330 430, 250 396 Z" fill="#FFFFFF" stroke="#F28AB2" strokeWidth={2} />
          <circle cx={250} cy={392} r={10} fill="#F28AB2" />
        </g>
      </g>
      <Title y={642} size={64} fill={d.ink} serif italic>Be mine</Title>
    </>
  );
}

export const ART: ArtMap = {
  xmastree: XmasTree,
  gingerbread: Gingerbread,
  menorah: Menorah,
  diya: Diya,
  fireworks: Fireworks,
  easter: Easter,
  lunar: Lunar,
  canadaday: CanadaDay,
  valentine: Valentine,
};
