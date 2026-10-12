import { anim, Falling, Frame, HEART, Kicker, pivot, r1, scatter, starPath, Title, Twinkles, W } from "./kit";
import type { ArtMap, ArtProps } from "./kit";

// Covers for the "celebrate" group. Register each one in ART by its design id.

const SPRINKLES = ["#4AA3FF", "#FFC53D", "#34C759", "#AF52DE", "#FF7A59"];

function Bloom({ x, y, r, c, mid = "#F6D776" }: { x: number; y: number; r: number; c: string; mid?: string }) {
  return (
    <g>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        return <circle key={i} cx={r1(x + Math.cos(a) * r)} cy={r1(y + Math.sin(a) * r)} r={r * 0.8} fill={c} />;
      })}
      <circle cx={x} cy={y} r={r * 0.6} fill={mid} />
    </g>
  );
}

/* ------------------------------------------------------------------ birthday */

function Cupcake({ d }: ArtProps) {
  const tiers = [{ cy: 380, rx: 104, ry: 36 }, { cy: 338, rx: 82, ry: 32 }, { cy: 300, rx: 58, ry: 28 }];
  return (
    <>
      <Frame color={d.ink} />
      <circle cx={250} cy={186} r={44} fill="#FFD27A" style={anim("ks-glow", 1.8, { vars: { "--lo": "0.2", "--hi": "0.45" } })} />
      <g style={anim("ks-flicker", 1.4, { origin: "50% 100%" })}>
        <path d="M250 154 C 234 180, 236 204, 250 206 C 264 204, 266 180, 250 154 Z" fill="#FFB020" />
        <path d="M250 178 C 243 190, 244 202, 250 203 C 256 202, 257 190, 250 178 Z" fill="#FFF1C2" />
      </g>
      <rect x={243} y={208} width={14} height={66} rx={4} fill="#fff" />
      {[218, 236, 254].map((y) => <rect key={y} x={243} y={y} width={14} height={7} fill={d.accent} />)}
      <path d="M154 396 L346 396 L322 524 H178 Z" fill={d.accent} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={182 + i * 27} y1={400} x2={192 + i * 23} y2={520} stroke="#fff" strokeOpacity={0.35} strokeWidth={3} />)}
      {tiers.map((t, i) => <ellipse key={i} cx={250} cy={t.cy} rx={t.rx} ry={t.ry} fill={i % 2 ? "#FFE3EC" : "#FFD1E0"} />)}
      <ellipse cx={250} cy={270} rx={26} ry={16} fill="#FFE3EC" />
      {scatter(21, 5).map((s, i) => {
        const t = tiers[i % 3];
        const x = r1(250 + ((s.x / W) * 2 - 1) * t.rx * 0.75);
        const y = r1(t.cy + (s.r - 0.5) * 22);
        return <rect key={i} x={x - 5} y={y - 1.5} width={10} height={3} rx={1.5} fill={SPRINKLES[i % 5]} transform={`rotate(${r1(s.q * 180)} ${x} ${y})`} />;
      })}
      <ellipse cx={250} cy={530} rx={130} ry={12} fill={d.ink} opacity={0.12} />
      <Twinkles color="#FFB020" pts={[{ x: 186, y: 160, r: 10 }, { x: 318, y: 146, r: 13 }, { x: 330, y: 220, r: 7 }]} />
      <Kicker y={590} fill={d.ink}>Make a wish</Kicker>
      <Title y={648} size={56} fill={d.ink}>Happy birthday</Title>
    </>
  );
}

function GiftBox({ d }: ArtProps) {
  return (
    <>
      <Kicker y={112} fill={d.ink}>Just for you</Kicker>
      <Title y={180} size={64} fill={d.ink}>Surprise!</Title>
      <ellipse cx={250} cy={528} rx={140} ry={14} fill={d.ink} opacity={0.12} />
      <ellipse cx={250} cy={334} rx={96} ry={16} fill="#FFE58A" style={anim("ks-glow", 3.2, { vars: { "--lo": "0.3", "--hi": "0.9" } })} />
      <rect x={144} y={332} width={212} height={192} rx={8} fill="#3FB8A5" />
      <rect x={232} y={332} width={36} height={192} fill={d.accent} />
      <rect x={144} y={332} width={212} height={14} fill="#000" opacity={0.08} />
      <g style={anim("ks-celebrate-hop", 3.2, { origin: "250px 334px", box: "view-box" })}>
        <rect x={130} y={290} width={240} height={46} rx={8} fill="#52CBB7" />
        <rect x={232} y={290} width={36} height={46} fill={d.accent} />
        <path d="M250 292 C 214 236, 166 262, 196 286 C 210 296, 236 296, 250 292 Z" fill={d.accent} />
        <path d="M250 292 C 286 236, 334 262, 304 286 C 290 296, 264 296, 250 292 Z" fill={d.accent} />
        <path d="M244 294 l-26 40 l14 -2 l6 12 Z M256 294 l26 40 l-14 -2 l-6 12 Z" fill={d.accent} opacity={0.85} />
        <circle cx={250} cy={290} r={13} fill="#C83A46" />
      </g>
      <Twinkles color="#F2B705" pts={[{ x: 130, y: 250, r: 13 }, { x: 372, y: 236, r: 16 }, { x: 98, y: 360, r: 9 }, { x: 404, y: 380, r: 11 }, { x: 250, y: 222, r: 8 }]} />
    </>
  );
}

function Dino({ d }: ArtProps) {
  const green = "#7CC46A";
  return (
    <>
      <Falling n={14} seed={19} dur={[7, 11]}>{(i) => <rect x={-5} y={-3} width={10} height={6} rx={2} fill={SPRINKLES[i % 5]} />}</Falling>
      <g style={anim("ks-sway", 1.3, { ...pivot(160, 430), vars: { "--amp": "9deg" } })}>
        <path d="M168 400 C 120 410, 80 390, 58 340 C 90 376, 130 392, 176 460 Z" fill={green} />
      </g>
      {[200, 250, 290].map((x, i) => <path key={i} d={`M${x - 18} ${322 - i * 4} l18 -30 l18 32 Z`} fill={d.accent} />)}
      <rect x={180} y={450} width={36} height={56} rx={14} fill="#6AB35A" />
      <rect x={270} y={450} width={36} height={56} rx={14} fill="#6AB35A" />
      <ellipse cx={240} cy={408} rx={104} ry={88} fill={green} />
      <ellipse cx={262} cy={428} rx={58} ry={56} fill="#D5EDB6" />
      <ellipse cx={300} cy={404} rx={12} ry={22} fill="#6AB35A" transform="rotate(-30 300 404)" />
      <ellipse cx={240} cy={512} rx={130} ry={10} fill={d.ink} opacity={0.12} />
      <g style={anim("ks-bob", 2.6, { origin: "50% 100%" })}>
        {/* Neck: from the shoulders up to the head, which sits a little higher. */}
        <path d="M290 352 C 296 318, 306 290, 322 262" stroke={green} strokeWidth={56} strokeLinecap="round" fill="none" />
        <g transform="translate(0 -40)">
        <circle cx={326} cy={286} r={58} fill={green} />
        <ellipse cx={366} cy={304} rx={46} ry={34} fill={green} />
        <circle cx={392} cy={294} r={3} fill={d.ink} />
        <circle cx={334} cy={268} r={9} fill={d.ink} />
        <circle cx={337} cy={265} r={3} fill="#fff" />
        <circle cx={316} cy={300} r={9} fill="#FF9FB2" opacity={0.7} />
        <path d="M352 318 q18 14 36 -2" stroke={d.ink} strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M296 238 L322 142 L354 232 Z" fill={d.accent} />
        <path d="M304 210 L344 202 L348 214 L302 222 Z M313 178 L334 174 L338 186 L310 190 Z" fill="#FFC53D" />
        <circle cx={322} cy={140} r={13} fill="#4AA3FF" />
        </g>
      </g>
      <Kicker y={590} fill={d.ink}>Have a roarsome</Kicker>
      <Title y={642} fill={d.ink}>Birthday</Title>
    </>
  );
}

function Disco({ d }: ArtProps) {
  const cx = 250, cy = 270, R = 118;
  const spots = scatter(30, 9).filter((p) => Math.hypot(p.x - cx, p.y * 0.72 - cy) > R + 30 && p.y * 0.72 > 50).slice(0, 12);
  const pts = spots.map((p) => ({ x: r1(p.x), y: r1(p.y * 0.72), r: r1(6 + p.r * 10) }));
  const tiles = ["#E9EEF8", "#A9B2C8", "#CBD3E6", "#8790A8"];
  return (
    <>
      <defs>
        <clipPath id="disco-ball"><circle cx={cx} cy={cy} r={R} /></clipPath>
        <pattern id="disco-tiles" width={64} height={32} patternUnits="userSpaceOnUse">
          {[0, 1, 2, 3].map((c) => [0, 1].map((rw) => <rect key={`${c}${rw}`} x={c * 16 + 1} y={rw * 16 + 1} width={14} height={14} rx={2} fill={c === 2 && rw === 1 ? d.accent : tiles[(c + rw * 2) % 4]} />))}
        </pattern>
        <radialGradient id="disco-shade" cx="38%" cy="34%" r="70%">
          <stop offset="0.45" stopColor="#000" stopOpacity={0} />
          <stop offset="1" stopColor="#000" stopOpacity={0.55} />
        </radialGradient>
      </defs>
      <line x1={cx} y1={30} x2={cx} y2={cy - R} stroke={d.ink} strokeOpacity={0.6} strokeWidth={2} />
      <rect x={cx - 12} y={cy - R - 12} width={24} height={16} rx={3} fill="#8790A8" />
      <g clipPath="url(#disco-ball)">
        <rect x={cx - R} y={cy - R} width={R * 2} height={R * 2} fill="#3B3F55" />
        <g style={anim("ks-celebrate-slide", 3.2, { ease: "linear", vars: { "--sx": "-64px" } })}>
          <rect x={cx - R - 6} y={cy - R} width={R * 2 + 76} height={R * 2} fill="url(#disco-tiles)" />
        </g>
        <circle cx={cx} cy={cy} r={R} fill="url(#disco-shade)" />
      </g>
      <path d={starPath(208, 222, 22, 5, 4)} fill="#fff" style={anim("ks-twinkle", 1.6)} />
      <Twinkles color={d.accent} pts={pts.filter((_, i) => i % 2 === 0)} />
      <Twinkles color="#7FE3FF" pts={pts.filter((_, i) => i % 2 === 1)} />
      {[{ x: 150, c: d.accent }, { x: 250, c: "#7FE3FF" }, { x: 350, c: "#FFD45C" }].map((s, i) => (
        <ellipse key={i} cx={s.x} cy={486} rx={46} ry={10} fill={s.c} style={anim("ks-glow", 1.8, { delay: -i * 0.6, vars: { "--lo": "0.15", "--hi": "0.7" } })} />
      ))}
      <Kicker y={570} fill={d.ink}>It&apos;s your birthday</Kicker>
      <Title y={636} size={62} fill={d.ink}>Let&apos;s party</Title>
    </>
  );
}

/* ------------------------------------------------------------------ anniversary */

function Swan() {
  return (
    <>
      <path d="M136 434 L100 404 L148 452 Z" fill="#F1F4F7" />
      <ellipse cx={192} cy={440} rx={66} ry={30} fill="#fff" />
      <path d="M150 432 C 176 410, 216 414, 236 436 C 206 446, 172 448, 150 432 Z" fill="#E4EAF0" />
      <path d="M232 430 C 206 392, 148 362, 160 300 C 170 254, 228 254, 238 296" stroke="#fff" strokeWidth={17} fill="none" strokeLinecap="round" />
      <circle cx={238} cy={302} r={13} fill="#fff" />
      <path d="M246 300 L256 314 L242 312 Z" fill="#F29B38" />
      <circle cx={234} cy={298} r={2.6} fill="#1F3B4D" />
    </>
  );
}

function Swans({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} opacity={0.2} />
      <path d="M30 470 C 140 456, 360 484, 470 466 V530 C 360 540, 140 522, 30 534 Z" fill="#BFDDE4" />
      {[0, 1, 2].map((i) => (
        <ellipse key={i} cx={250} cy={478 + i * 18} rx={170 - i * 30} ry={6} fill="none" stroke="#fff" strokeWidth={2.5} style={anim("ks-celebrate-ripple", 4, { delay: -i * 1.3 })} />
      ))}
      <g style={anim("ks-drift", 7, { vars: { "--dx": "12px" } })}>
        <g style={anim("ks-float", 3.4, { vars: { "--rise": "-5px" } })}>
          <Swan />
          <g transform="translate(500 0) scale(-1 1)"><Swan /></g>
        </g>
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${236 + i * 14} 250) scale(${0.8 + i * 0.2})`}>
          <path d={HEART} fill={d.accent} style={anim("ks-rise", 5, { ease: "ease-out", delay: -i * 1.7, vars: { "--h": "-170px" } })} />
        </g>
      ))}
      <Kicker y={582} fill={d.ink}>Happy</Kicker>
      <Title y={644} size={56} fill={d.ink} serif italic>Anniversary</Title>
    </>
  );
}

function LoveLetter({ d }: ArtProps) {
  const hearts = [{ x: 200, s: 1.1 }, { x: 250, s: 1.6 }, { x: 300, s: 1.2 }, { x: 226, s: 0.8 }, { x: 278, s: 0.9 }];
  return (
    <>
      <path d="M120 330 L250 226 L380 330 Z" fill="#F0DCCB" />
      <rect x={146} y={262} width={208} height={150} rx={4} fill="#fff" />
      {[290, 310, 330].map((y) => <line key={y} x1={170} y1={y} x2={330} y2={y} stroke={d.accent} strokeOpacity={0.3} strokeWidth={3} strokeLinecap="round" />)}
      {hearts.map((h, i) => (
        <g key={i} transform={`translate(${h.x} 300) scale(${h.s})`}>
          <path d={HEART} fill={i % 2 ? "#F48FA4" : d.accent} style={anim("ks-rise", 5.5, { ease: "ease-out", delay: -i * 1.1, vars: { "--h": `${-Math.round(220 / h.s)}px` } })} />
        </g>
      ))}
      <path d="M120 330 L250 424 L380 330 V500 H120 Z" fill="#FFF6EE" />
      <path d="M120 500 L222 408 M380 500 L278 408" stroke="#E8D6C6" strokeWidth={2} />
      <g transform="translate(250 428) scale(1.3)"><path d={HEART} fill={d.accent} /></g>
      <ellipse cx={250} cy={512} rx={140} ry={10} fill={d.ink} opacity={0.1} />
      <Title y={586} size={52} fill={d.ink} serif italic>Still falling</Title>
      <Title y={642} size={52} fill={d.ink} serif italic>for you</Title>
    </>
  );
}

function Flute({ x, tilt, amp, delay }: { x: number; tilt: number; amp: string; delay: number }) {
  const bubbles = [{ x: -8, y: -110 }, { x: 6, y: -120 }, { x: 0, y: -130 }, { x: -4, y: -116 }];
  return (
    <g transform={`translate(${x} 520) rotate(${tilt})`}>
      <g style={anim("ks-sway", 3.2, { origin: "50% 100%", delay, vars: { "--amp": amp } })}>
        <path d="M-26 -230 C -28 -170, -16 -110, 0 -96 C 16 -110, 28 -170, 26 -230 Z" fill="#ffffff" fillOpacity={0.18} stroke="#fff" strokeWidth={3} />
        <path d="M-24 -192 C -24 -150, -14 -112, 0 -102 C 14 -112, 24 -150, 24 -192 Z" fill="#F6D776" />
        {bubbles.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r={2.4} fill="#fff" style={anim("ks-rise", 2.2, { ease: "linear", delay: -i * 0.55, vars: { "--h": "-80px" } })} />
        ))}
        <path d="M-16 -222 C -18 -180, -12 -140, -4 -120" stroke="#fff" strokeOpacity={0.6} strokeWidth={3} fill="none" strokeLinecap="round" />
        <rect x={-2.5} y={-98} width={5} height={96} fill="#fff" />
        <ellipse cx={0} cy={0} rx={28} ry={6} fill="#fff" />
      </g>
    </g>
  );
}

function Toast({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.45} />
      <Flute x={178} tilt={14} amp="-4deg" delay={0} />
      <Flute x={322} tilt={-14} amp="4deg" delay={0} />
      <path d={starPath(250, 262, 26, 7, 4)} fill={d.accent} style={anim("ks-twinkle", 3.2)} />
      <Twinkles color={d.accent} pts={[{ x: 120, y: 150, r: 10 }, { x: 380, y: 130, r: 14 }, { x: 250, y: 120, r: 8 }, { x: 96, y: 330, r: 7 }, { x: 410, y: 320, r: 9 }]} />
      <Kicker y={590} fill={d.ink}>Cheers, my love</Kicker>
      <Title y={648} size={56} fill={d.ink} serif italic>Here&apos;s to us</Title>
    </>
  );
}

/* ------------------------------------------------------------------ wedding */

function WeddingCake({ d }: ArtProps) {
  const tiers = [{ x: 140, y: 410, w: 220, h: 100 }, { x: 170, y: 330, w: 160, h: 80 }, { x: 200, y: 262, w: 100, h: 68 }];
  const scallop = (x: number, y: number, w: number) => `M${x} ${y} ` + Array.from({ length: Math.round(w / 20) }, () => "q10 14 20 0").join(" ");
  return (
    <>
      <Falling n={16} seed={33} dur={[9, 14]}>{(i) => <ellipse rx={7} ry={4} fill={i % 2 ? d.accent : "#F2C4CE"} opacity={0.8} />}</Falling>
      <rect x={120} y={510} width={260} height={12} rx={6} fill="#E5D9CC" />
      <rect x={236} y={522} width={28} height={20} fill="#E5D9CC" />
      {tiers.map((t, i) => (
        <g key={i}>
          <rect x={t.x} y={t.y} width={t.w} height={t.h} rx={8} fill="#FFFDF9" stroke="#E5D9CC" strokeWidth={2} />
          <path d={scallop(t.x, t.y + 14, t.w)} fill="none" stroke="#F2C4CE" strokeWidth={3} />
          {Array.from({ length: Math.round(t.w / 20) + 1 }, (_, k) => <circle key={k} cx={t.x + k * 20} cy={t.y + t.h - 6} r={3.5} fill="#EFE3D3" />)}
        </g>
      ))}
      <Bloom x={156} y={414} r={10} c={d.accent} />
      <Bloom x={344} y={420} r={9} c="#F2C4CE" />
      <Bloom x={180} y={334} r={8} c="#F2C4CE" />
      <Bloom x={320} y={336} r={9} c={d.accent} />
      <g style={anim("ks-sway", 4.6, { ...pivot(250, 262), vars: { "--amp": "3deg" } })}>
        <path d="M228 254 q-14 -16 -8 -30 M272 254 q14 -16 8 -30" stroke="#7FA37A" strokeWidth={3} fill="none" />
        <Bloom x={226} y={244} r={11} c="#F2C4CE" />
        <Bloom x={274} y={244} r={11} c="#F2C4CE" />
        <Bloom x={250} y={232} r={14} c={d.accent} />
      </g>
      <Kicker y={590} fill={d.ink}>Here&apos;s to your</Kicker>
      <Title y={648} size={50} fill={d.ink} serif italic>Happily ever after</Title>
    </>
  );
}

function JustMarried({ d }: ArtProps) {
  const flags = Array.from({ length: 9 }, (_, i) => ({ x: 50 + i * 50, y: r1(70 + Math.sin((i / 8) * Math.PI) * 30) }));
  const cans = [{ x: 386, y: 462 }, { x: 416, y: 474 }, { x: 446, y: 458 }];
  return (
    <>
      <g style={anim("ks-sway", 5, { ...pivot(250, 40), vars: { "--amp": "1.2deg" } })}>
        <path d={`M30 60 ${flags.map((f) => `L${f.x} ${f.y}`).join(" ")} L470 60`} stroke={d.ink} strokeOpacity={0.4} strokeWidth={2} fill="none" />
        {flags.map((f, i) => <path key={i} d={`M${f.x - 14} ${f.y} h28 l-14 26 Z`} fill={[d.accent, "#F7C948", "#7FB3D5"][i % 3]} />)}
      </g>
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(${352 + (i % 2) * 26} 380) scale(${0.8 + (i % 3) * 0.2})`}>
          <path d={HEART} fill={d.accent} style={anim("ks-rise", 4.4, { ease: "ease-out", delay: -i * 1.1, vars: { "--h": "-200px" } })} />
        </g>
      ))}
      <defs><clipPath id="justmarried-road"><rect x={30} y={480} width={440} height={20} /></clipPath></defs>
      <rect x={30} y={478} width={440} height={4} fill={d.ink} opacity={0.5} />
      <g clipPath="url(#justmarried-road)">
        <g style={anim("ks-celebrate-slide", 0.8, { ease: "linear", vars: { "--sx": "60px" } })}>
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-30 + i * 60} y={490} width={30} height={4} rx={2} fill={d.ink} opacity={0.3} />)}
        </g>
      </g>
      {cans.map((c, i) => (
        <g key={i} style={anim("ks-sway", 0.9, { ...pivot(330, 430), delay: -i * 0.3, vars: { "--amp": "5deg" } })}>
          <path d={`M330 430 Q ${(330 + c.x) / 2} ${c.y + 8} ${c.x} ${c.y}`} stroke={d.ink} strokeOpacity={0.5} strokeWidth={1.5} fill="none" />
          <rect x={c.x} y={c.y - 9} width={22} height={18} rx={3} fill="#C9CED6" />
          <rect x={c.x + 3} y={c.y - 9} width={2} height={18} fill="#fff" opacity={0.6} />
        </g>
      ))}
      <g style={anim("ks-celebrate-bounce", 0.8)}>
        <path d="M168 386 C 176 340, 200 328, 238 328 C 280 328, 294 344, 304 386 Z" fill="#5B8DB8" />
        <path d="M184 384 C 190 352, 206 342, 232 342 V384 Z M244 342 C 270 342, 282 354, 288 384 H244 Z" fill="#DDEEF8" />
        <rect x={120} y={380} width={216} height={60} rx={24} fill="#5B8DB8" />
        <circle cx={128} cy={404} r={7} fill="#FFE58A" />
        <g transform="translate(330 412)"><path d={HEART} fill={d.accent} /></g>
      </g>
      {[176, 290].map((x) => (
        <g key={x}>
          <circle cx={x} cy={452} r={24} fill="#2E3440" />
          <g style={anim("ks-spin", 0.8, { ease: "linear", ...pivot(x, 452) })}>
            <circle cx={x} cy={452} r={10} fill="#C9CED6" />
            <path d={`M${x - 10} 452 H${x + 10} M${x} 442 V462`} stroke="#2E3440" strokeWidth={3} />
          </g>
        </g>
      ))}
      <Kicker y={590} fill={d.ink}>Hip hip hooray</Kicker>
      <Title y={648} size={58} fill={d.ink}>Just married</Title>
    </>
  );
}

/* ------------------------------------------------------------------ new baby */

function Rattle({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.4} />
      <Twinkles color={d.accent} pts={[{ x: 110, y: 170, r: 14 }, { x: 392, y: 150, r: 18 }, { x: 90, y: 360, r: 9 }, { x: 410, y: 380, r: 11 }, { x: 330, y: 80, r: 8 }]} />
      <g style={anim("ks-celebrate-shake", 2.4, pivot(250, 516))}>
        <circle cx={250} cy={516} r={26} fill="none" stroke="#8ECAE6" strokeWidth={12} />
        <rect x={238} y={370} width={24} height={124} rx={12} fill="#8ECAE6" />
        <path d="M250 378 C 222 352, 206 380, 226 388 Z M250 378 C 278 352, 294 380, 274 388 Z" fill="#F28FAD" />
        <circle cx={250} cy={378} r={8} fill="#E0708F" />
        <circle cx={250} cy={276} r={84} fill={d.accent} />
        <path d="M168 258 C 220 240, 280 240, 332 258 L333 296 C 280 278, 220 278, 167 296 Z" fill="#fff" opacity={0.85} />
        {[194, 250, 306].map((x) => <circle key={x} cx={x} cy={x === 250 ? 264 : 270} r={6} fill="#8ECAE6" />)}
        {[{ x: 214, y: 212 }, { x: 286, y: 212 }, { x: 250, y: 330 }, { x: 200, y: 324 }, { x: 300, y: 324 }].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={5} fill="#fff" opacity={0.7} />)}
        <ellipse cx={210} cy={226} rx={14} ry={24} fill="#fff" opacity={0.3} transform="rotate(30 210 226)" />
      </g>
      <Kicker y={596} fill={d.ink}>Welcome</Kicker>
      <Title y={652} size={58} fill={d.ink} serif italic>Little one</Title>
    </>
  );
}

function Lamb({ d }: ArtProps) {
  const wool = [{ x: 220, y: 360 }, { x: 260, y: 350 }, { x: 300, y: 362 }, { x: 330, y: 390 }, { x: 300, y: 410 }, { x: 255, y: 414 }, { x: 215, y: 400 }];
  const stars = scatter(14, 61).map((p) => ({ x: r1(40 + p.x * 0.84), y: r1(40 + p.y * 0.36), r: r1(4 + p.r * 8) }));
  return (
    <>
      <path d="M392 90 a46 46 0 1 0 40 72 a38 38 0 1 1 -40 -72 Z" fill={d.accent} />
      <Twinkles color={d.accent} pts={stars.filter((s) => !(s.x > 340 && s.y < 200))} />
      <g style={anim("ks-float", 5, { vars: { "--rise": "-8px" } })}>
        <g fill="#DCE4F5">
          <circle cx={170} cy={452} r={44} /><circle cx={236} cy={430} r={56} /><circle cx={310} cy={440} r={50} /><circle cx={360} cy={462} r={36} />
          <rect x={120} y={450} width={280} height={46} rx={23} />
        </g>
        <g style={anim("ks-celebrate-breathe", 4.2, { origin: "50% 100%" })}>
          {wool.map((w, i) => <circle key={i} cx={w.x} cy={w.y} r={34} fill={i % 2 ? "#FFFFFF" : "#F3EFE6"} />)}
          <ellipse cx={268} cy={388} rx={66} ry={38} fill="#FFFFFF" />
        </g>
        <ellipse cx={176} cy={398} rx={40} ry={32} fill="#EBDCD2" />
        <ellipse cx={150} cy={404} rx={12} ry={22} fill="#D9C3B6" transform="rotate(30 150 404)" />
        <circle cx={172} cy={370} r={16} fill="#fff" /><circle cx={190} cy={366} r={14} fill="#F3EFE6" />
        <path d="M160 398 q8 7 16 0 M184 398 q8 7 16 0" stroke="#5B4B5E" strokeWidth={3} fill="none" strokeLinecap="round" />
        <path d="M176 414 q5 4 10 0" stroke="#5B4B5E" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        <circle cx={160} cy={410} r={6} fill="#F4A6B6" opacity={0.6} />
      </g>
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${200 + i * 18} 330)`}>
          <text fill={d.ink} style={{ ...anim("ks-rise", 4.5, { ease: "ease-out", delay: -i * 1.5, vars: { "--h": "-90px" } }), fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 18 + i * 4 }}>z</text>
        </g>
      ))}
      <Kicker y={586} fill={d.ink}>Sweet dreams</Kicker>
      <Title y={648} size={62} fill={d.ink} serif italic>Little lamb</Title>
    </>
  );
}

export const ART: ArtMap = {
  cupcake: Cupcake,
  giftbox: GiftBox,
  dino: Dino,
  disco: Disco,
  swans: Swans,
  loveletter: LoveLetter,
  toast: Toast,
  weddingcake: WeddingCake,
  justmarried: JustMarried,
  rattle: Rattle,
  lamb: Lamb,
};
