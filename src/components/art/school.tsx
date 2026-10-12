import { anim, Falling, Frame, Kicker, LEAF, pivot, r1, starPath, Title, Twinkles } from "./kit";
import type { ArtMap, ArtProps } from "./kit";

// Covers for the "school" group. Register each one in ART by its design id.

/* ------------------------------------------------------------------ teachers */

function Apple({ d }: ArtProps) {
  const books = [{ y: 520, w: 290, c: "#3D6FB6" }, { y: 484, w: 254, c: "#E2A63B" }, { y: 448, w: 272, c: "#4E8A5B" }];
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={96} fill={d.ink}>For my favourite</Kicker>
      <Title y={160} fill={d.ink}>Teacher</Title>
      <ellipse cx={250} cy={560} rx={170} ry={12} fill={d.ink} opacity={0.1} />
      {books.map((b, i) => (
        <g key={i}>
          <rect x={250 - b.w / 2} y={b.y} width={b.w} height={36} rx={6} fill={b.c} />
          <rect x={250 + b.w / 2 - 30} y={b.y + 6} width={22} height={24} rx={3} fill="#FFF8EC" />
          <line x1={250 - b.w / 2 + 18} x2={250 + b.w / 2 - 46} y1={b.y + 18} y2={b.y + 18} stroke="#fff" strokeOpacity={0.4} strokeWidth={3} strokeLinecap="round" />
        </g>
      ))}
      <path d="M250 300 C 214 280, 160 296, 160 360 C 160 420, 210 454, 250 444 C 290 454, 340 420, 340 360 C 340 296, 286 280, 250 300 Z" fill={d.accent} />
      <g style={anim("ks-glow", 3.2, { vars: { "--lo": "0.25", "--hi": "0.55" } })}>
        <ellipse cx={204} cy={340} rx={13} ry={26} fill="#fff" transform="rotate(20 204 340)" />
      </g>
      <path d="M250 302 C 250 290, 252 278, 258 266" stroke="#6B4226" strokeWidth={7} strokeLinecap="round" fill="none" />
      <g style={anim("ks-sway", 3.6, { ...pivot(256, 282), vars: { "--amp": "9deg" } })}>
        <path d={LEAF} transform="translate(284 270) rotate(62) scale(1.2)" fill="#5E9B4C" />
      </g>
      <Twinkles color="#E2A63B" pts={[{ x: 140, y: 270, r: 11 }, { x: 370, y: 300, r: 9 }, { x: 352, y: 238, r: 6 }]} />
    </>
  );
}

function Chalk({ d }: ArtProps) {
  return (
    <>
      <Kicker y={92} fill={d.ink}>To my teacher</Kicker>
      <rect x={50} y={124} width={400} height={440} rx={12} fill="#A86B3C" />
      <rect x={66} y={140} width={368} height={408} rx={4} fill={d.accent} />
      <ellipse cx={170} cy={480} rx={80} ry={22} fill="#fff" opacity={0.05} />
      <ellipse cx={340} cy={200} rx={70} ry={18} fill="#fff" opacity={0.05} />
      <path d="M150 360 L200 210 L250 360 M168 306 H232 M290 285 H370 M330 245 V325" pathLength={1} strokeDasharray="1 1" stroke="#F7F5EE" strokeOpacity={0.92} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" style={anim("ks-school-draw", 6, { ease: "linear" })} />
      <Title y={470} size={54} fill="#F7F5EE">Thank you</Title>
      <rect x={60} y={562} width={380} height={14} rx={4} fill="#8C5730" />
      <rect x={300} y={552} width={44} height={10} rx={4} fill="#F7F5EE" />
      <rect x={120} y={546} width={70} height={16} rx={4} fill="#3B3B3B" />
      <rect x={120} y={546} width={70} height={7} rx={3} fill="#C9A27A" />
    </>
  );
}

// Cursive loops along y = 360, every 40px, heights varying.
const SQUIGGLE = [44, 30, 50, 34, 46, 28, 40].reduce((p, h, k) => {
  const x = 80 + k * 40;
  return `${p} C ${x + 30} 360, ${x + 40} ${360 - h}, ${x + 26} ${358 - h} C ${x + 12} ${356 - h}, ${x + 10} 350, ${x + 40} 360`;
}, "M80 360") + " C 352 362, 362 358, 370 356";

function Pencil({ d }: ArtProps) {
  return (
    <>
      {[240, 280, 320, 360, 400, 440].map((y) => <line key={y} x1={40} x2={460} y1={y} y2={y} stroke="#7FA7D9" strokeOpacity={0.4} strokeWidth={1.5} />)}
      <line x1={64} x2={64} y1={200} y2={470} stroke="#E07A7A" strokeOpacity={0.6} strokeWidth={2} />
      <path d={SQUIGGLE} pathLength={1} strokeDasharray="1 1" stroke={d.ink} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" style={anim("ks-school-draw", 7, { ease: "linear" })} />
      <g transform="translate(80 360)">
        <g style={anim("ks-school-write", 7, { ease: "linear", vars: { "--dx": "290px" } })}>
          <g transform="rotate(25)">
            <rect x={-14} y={-192} width={28} height={22} rx={6} fill="#F29CA3" />
            <rect x={-15} y={-174} width={30} height={14} rx={2} fill="#B9B9B9" />
            <rect x={-14} y={-160} width={28} height={116} fill={d.accent} />
            <rect x={-4} y={-160} width={8} height={116} fill="#000" opacity={0.08} />
            <path d="M-14 -44 L14 -44 L4 -12 L-4 -12 Z" fill="#F2C894" />
            <path d="M-4 -12 L4 -12 L0 0 Z" fill={d.ink} />
          </g>
        </g>
      </g>
      <Kicker y={540} fill={d.ink}>You helped me</Kicker>
      <Title y={604} size={48} fill={d.ink}>write my story</Title>
    </>
  );
}

const LAND = [
  "M20 -70 C 40 -95, 80 -90, 90 -60 C 100 -30, 70 -10, 60 10 C 50 40, 30 30, 28 0 C 26 -30, 0 -45, 20 -70 Z",
  "M130 -20 C 150 -40, 190 -30, 200 0 C 210 30, 180 70, 160 90 C 140 70, 150 40, 135 20 C 120 5, 115 -5, 130 -20 Z",
  "M150 -100 C 170 -112, 210 -100, 222 -80 C 200 -70, 170 -72, 150 -100 Z",
  "M60 60 C 80 50, 102 70, 95 96 C 80 106, 58 90, 60 60 Z",
];

function Globe({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <clipPath id="globe-clip"><circle cx={250} cy={280} r={120} /></clipPath>
      <circle cx={250} cy={280} r={120} fill={d.accent} />
      <g clipPath="url(#globe-clip)">
        <g transform="translate(130 280)">
          <g style={anim("ks-school-slide", 16, { ease: "linear", vars: { "--dx": "-240px" } })}>
            {[-240, 0, 240].map((o) => <g key={o} transform={`translate(${o} 0)`}>{LAND.map((p) => <path key={p} d={p} fill="#7FBF6A" />)}</g>)}
          </g>
        </g>
        <circle cx={300} cy={300} r={140} fill="none" stroke="#000" strokeOpacity={0.12} strokeWidth={60} />
      </g>
      <ellipse cx={208} cy={226} rx={20} ry={34} fill="#fff" opacity={0.3} transform="rotate(35 208 226)" />
      <g transform="rotate(20 250 280)">
        <path d="M250 144 A 136 136 0 0 1 250 416" stroke="#C99A3B" strokeWidth={9} fill="none" strokeLinecap="round" />
        <circle cx={250} cy={144} r={7} fill="#C99A3B" />
      </g>
      <path d="M204 408 Q 238 428 250 452" stroke="#C99A3B" strokeWidth={9} fill="none" strokeLinecap="round" />
      <rect x={243} y={450} width={14} height={42} fill="#8A6A2E" />
      <ellipse cx={250} cy={498} rx={72} ry={15} fill="#8A6A2E" />
      <Twinkles color={d.accent} pts={[{ x: 92, y: 160, r: 10 }, { x: 410, y: 210, r: 12 }, { x: 400, y: 420, r: 7 }]} />
      <Kicker y={574} fill={d.ink}>You made the world bigger</Kicker>
      <Title y={638} fill={d.ink}>Thank you</Title>
    </>
  );
}

function Cloud({ x, y, s }: { x: number; y: number; s: number }) {
  return <path transform={`translate(${x} ${y}) scale(${s})`} d="M-60 20 a 26 26 0 0 1 10 -50 a 34 34 0 0 1 62 -10 a 28 28 0 0 1 48 26 a 22 22 0 0 1 0 44 h-120 a 20 20 0 0 1 0 -10 Z" fill="#fff" />;
}

function Wheel({ x }: { x: number }) {
  return (
    <g transform={`translate(${x} 440)`}>
      <g style={anim("ks-spin", 1.4, { ease: "linear" })}>
        <circle r={30} fill="#2B2B2B" />
        <circle r={13} fill="#C9CDD3" />
        {[0, 60, 120].map((a) => <rect key={a} x={-2} y={-12} width={4} height={24} fill="#6B7078" transform={`rotate(${a})`} />)}
      </g>
    </g>
  );
}

function Bus({ d }: ArtProps) {
  return (
    <>
      <g style={anim("ks-drift", 9, { vars: { "--dx": "30px" } })}><Cloud x={120} y={150} s={0.9} /></g>
      <g style={anim("ks-drift", 11, { delay: -4, vars: { "--dx": "-26px" } })}><Cloud x={380} y={210} s={0.7} /></g>
      <rect x={0} y={470} width={500} height={60} fill="#8A9099" />
      <g transform="translate(0 498)">
        <g style={anim("ks-school-slide", 1.2, { ease: "linear", vars: { "--dx": "-80px" } })}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <rect key={i} x={i * 80} y={-3} width={40} height={6} rx={3} fill="#fff" />)}
        </g>
      </g>
      <g style={anim("ks-float", 0.9, { vars: { "--rise": "-4px" } })}>
        <rect x={80} y={290} width={300} height={150} rx={18} fill={d.accent} />
        <rect x={360} y={356} width={60} height={84} rx={12} fill={d.accent} />
        {[0, 1, 2, 3].map((i) => <rect key={i} x={102 + i * 60} y={310} width={46} height={40} rx={6} fill="#CFE6F5" />)}
        <rect x={348} y={310} width={22} height={46} rx={5} fill="#CFE6F5" />
        <rect x={80} y={376} width={340} height={8} fill="#2B2B2B" />
        <rect x={76} y={420} width={350} height={14} rx={6} fill="#2B2B2B" />
        <circle cx={412} cy={398} r={7} fill="#FFF3C4" />
        <path d="M128 440 a32 32 0 0 1 64 0 M308 440 a32 32 0 0 1 64 0" fill="#2B2B2B" />
      </g>
      <Wheel x={160} />
      <Wheel x={340} />
      <Kicker y={590} fill={d.ink}>Back to school</Kicker>
      <Title y={646} size={42} fill={d.ink}>Have a great year</Title>
    </>
  );
}

function Crayons({ d }: ArtProps) {
  const cols = ["#E5383B", "#F48C06", "#F2C40C", "#3FA34D", "#3A86FF", "#8E5BD9"];
  return (
    <>
      <Kicker y={104} fill={d.ink}>You colour our world</Kicker>
      <Title y={170} fill={d.ink}>Thank you</Title>
      {cols.map((c, i) => (
        <g key={c} transform={`translate(${156 + i * 34} 0)`}>
          <g style={anim("ks-school-pop", 3.6, { delay: i * 0.6, vars: { "--rise": "-36px" } })}>
            <path d="M0 290 Q 0 274, 8 256 L 18 256 Q 26 274, 26 290 Z" fill={c} />
            <rect x={0} y={288} width={26} height={180} rx={3} fill={c} />
            <rect x={0} y={318} width={26} height={60} fill="#000" opacity={0.12} />
            <line x1={4} x2={22} y1={348} y2={348} stroke="#fff" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
          </g>
        </g>
      ))}
      <ellipse cx={250} cy={540} rx={130} ry={10} fill={d.ink} opacity={0.12} />
      <path d="M136 380 Q 250 412 364 380 L 356 532 H 144 Z" fill={d.accent} />
      <path d="M190 430 Q 250 446 310 430 L 306 486 Q 250 500 194 486 Z" fill="#F2C40C" />
      <path d="M210 466 q10 -16 20 0 t20 0 t20 0 t20 0" stroke={d.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
      <path d="M150 600 q25 -26 50 0 t50 0 t50 0 t50 0" pathLength={1} strokeDasharray="1 1" stroke="#E5383B" strokeWidth={6} strokeLinecap="round" fill="none" style={anim("ks-school-draw", 6, { ease: "linear" })} />
    </>
  );
}

/* ------------------------------------------------------------------ graduation */

function Diploma({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.3} />
      <g style={anim("ks-float", 5, { vars: { "--rise": "-10px" } })}>
        <g transform="rotate(-14 250 320)">
          <rect x={120} y={290} width={260} height={60} fill="#FBF6E6" />
          <rect x={120} y={290} width={260} height={10} fill="#000" opacity={0.05} />
          <ellipse cx={380} cy={320} rx={12} ry={30} fill="#EFE6CC" />
          <ellipse cx={120} cy={320} rx={12} ry={30} fill="#EFE6CC" />
          <path d="M120 304 a8 10 0 1 1 -1 18 a4 5 0 1 1 1 -9" stroke="#C9B98E" strokeWidth={2.5} fill="none" />
          <rect x={236} y={288} width={28} height={64} fill={d.accent} />
          <g style={anim("ks-sway", 3.2, { ...pivot(250, 340), vars: { "--amp": "5deg" } })}>
            <path d="M246 340 L222 420 L236 412 L244 426 L254 344 Z M254 340 L284 414 L270 410 L264 424 L246 344 Z" fill={d.accent} />
          </g>
          <path d="M250 320 C 214 290, 196 312, 214 330 C 226 340, 244 330, 250 320 Z M250 320 C 286 290, 304 312, 286 330 C 274 340, 256 330, 250 320 Z" fill={d.accent} />
          <circle cx={250} cy={320} r={9} fill="#9E1C2B" />
        </g>
      </g>
      <Twinkles color="#E2B33B" pts={[{ x: 110, y: 200, r: 14 }, { x: 390, y: 190, r: 10 }, { x: 400, y: 430, r: 13 }, { x: 96, y: 420, r: 8 }, { x: 250, y: 160, r: 7 }]} />
      <Kicker y={546} fill={d.ink}>Congratulations</Kicker>
      <Title y={610} size={44} fill={d.ink}>You did it, grad</Title>
    </>
  );
}

function Tassel({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <path d="M150 290 L150 360 Q 250 404 350 360 L350 290 L250 330 Z" fill="#2E3650" />
      <path d="M250 196 L424 258 L250 320 L76 258 Z" fill={d.ink} />
      <path d="M250 196 L424 258 L250 320 L76 258 Z" fill="none" stroke="#fff" strokeOpacity={0.12} strokeWidth={3} />
      <g style={anim("ks-sway", 3.4, { ...pivot(250, 258), vars: { "--amp": "7deg" } })}>
        <path d="M250 258 Q 330 258 392 272 L 394 372" stroke={d.accent} strokeWidth={5} fill="none" strokeLinecap="round" />
        <rect x={386} y={366} width={16} height={14} rx={3} fill={d.accent} />
        <path d="M384 380 L404 380 L410 446 L378 446 Z" fill={d.accent} />
        {[384, 390, 396, 402].map((x) => <line key={x} x1={x + 1} x2={x + 1} y1={392} y2={444} stroke="#000" strokeOpacity={0.12} strokeWidth={2} />)}
      </g>
      <circle cx={250} cy={258} r={10} fill={d.accent} />
      <Twinkles color={d.accent} pts={[{ x: 100, y: 150, r: 12 }, { x: 380, y: 140, r: 9 }, { x: 110, y: 420, r: 10 }]} />
      <Kicker y={530} fill={d.ink}>Congrats</Kicker>
      <Title y={598} fill={d.ink}>Graduate</Title>
    </>
  );
}

function ClassAct({ d }: ArtProps) {
  return (
    <>
      <Falling n={24} seed={57} dur={[6, 11]}>
        {(i) => (i % 3 === 0 ? <path d={starPath(0, 0, 9, 4)} fill={d.accent} /> : <rect x={-5} y={-3} width={10} height={6} rx={2} fill={["#FF6B6B", "#4ECDC4", "#FFFFFF", d.accent][i % 4]} />)}
      </Falling>
      <g style={anim("ks-beat", 2.6, { origin: "250px 290px", box: "view-box" })}>
        <path d={starPath(250, 290, 130, 56)} fill={d.accent} stroke="#fff" strokeOpacity={0.3} strokeWidth={4} strokeLinejoin="round" />
      </g>
      <g transform="translate(110 170)"><g style={anim("ks-sway", 4, { vars: { "--amp": "12deg" } })}><path d={starPath(0, 0, 40, 17)} fill="#FF6B6B" /></g></g>
      <g transform="translate(395 420)"><g style={anim("ks-sway", 3.4, { delay: -1.2, vars: { "--amp": "-12deg" } })}><path d={starPath(0, 0, 32, 14)} fill="#4ECDC4" /></g></g>
      <Title y={560} size={76} fill={d.ink}>Class act</Title>
      <Kicker y={606} fill={d.ink}>Take a bow, graduate</Kicker>
    </>
  );
}

function RoadAhead({ d }: ArtProps) {
  const rays = Array.from({ length: 9 }, (_, i) => (Math.PI * (190 + i * 20)) / 180);
  return (
    <>
      <Kicker y={92} fill={d.ink}>The road ahead is yours</Kicker>
      <Title y={156} fill={d.ink}>Go get it</Title>
      <clipPath id="roadahead-sky"><rect x={0} y={0} width={500} height={392} /></clipPath>
      <g clipPath="url(#roadahead-sky)">
        {rays.map((a, i) => (
          <line key={i} x1={r1(250 + Math.cos(a) * 88)} y1={r1(392 + Math.sin(a) * 88)} x2={r1(250 + Math.cos(a) * 130)} y2={r1(392 + Math.sin(a) * 130)} stroke={d.accent} strokeWidth={9} strokeLinecap="round" style={anim("ks-glow", 2.8, { delay: -i * 0.35, vars: { "--lo": "0.3", "--hi": "1" } })} />
        ))}
        <g style={anim("ks-float", 6, { vars: { "--rise": "-10px" } })}><circle cx={250} cy={400} r={66} fill="#F9B233" /></g>
      </g>
      <path d="M40 392 Q 150 360 250 392 Q 360 356 460 392 V 640 H 40 Z" fill="#9CC98A" />
      <rect x={40} y={390} width={420} height={250} fill="#8DBF7A" />
      <path d="M150 640 C 190 560, 330 560, 290 480 C 265 432, 230 420, 247 392 L 253 392 C 244 420, 290 436, 316 480 C 360 560, 270 590, 350 640 Z" fill="#6E6A66" />
      <path d="M250 640 C 270 600, 330 540, 303 480 C 280 436, 240 420, 250 394" stroke="#FFF4D6" strokeWidth={4} strokeDasharray="14 16" fill="none" style={anim("ks-school-dash", 1.6, { ease: "linear", vars: { "--o": "30px" } })} />
      <Frame color={d.ink} />
    </>
  );
}

function BookStack({ d }: ArtProps) {
  const books = [
    { y: 520, w: 300, x: 0, c: "#C8553D" }, { y: 478, w: 260, x: 14, c: d.accent },
    { y: 440, w: 280, x: -10, c: "#E2A63B" }, { y: 404, w: 236, x: 6, c: "#3F7A4F" },
  ];
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={96} fill={d.ink}>All that hard work</Kicker>
      <Title y={160} fill={d.ink}>Paid off</Title>
      <ellipse cx={250} cy={566} rx={170} ry={12} fill={d.ink} opacity={0.1} />
      {books.map((b, i) => (
        <g key={i}>
          <rect x={250 - b.w / 2 + b.x} y={b.y} width={b.w} height={i === 0 ? 42 : 38} rx={6} fill={b.c} />
          <rect x={250 + b.w / 2 + b.x - 30} y={b.y + 6} width={22} height={i === 0 ? 30 : 26} rx={3} fill="#FFF8EC" />
          <rect x={250 - b.w / 2 + b.x + 24} y={b.y} width={10} height={i === 0 ? 42 : 38} fill="#000" opacity={0.12} />
        </g>
      ))}
      <g style={anim("ks-bob", 3.4, { origin: "50% 100%" })}>
        <path d="M196 352 L196 394 Q 250 414 304 394 L304 352 L250 374 Z" fill="#2E3650" />
        <path d="M250 296 L352 334 L250 372 L148 334 Z" fill={d.ink} />
        <path d="M250 334 Q 300 336 330 344 L 332 392" stroke="#E2B33B" strokeWidth={4} fill="none" strokeLinecap="round" />
        <path d="M325 390 L339 390 L343 422 L321 422 Z" fill="#E2B33B" />
        <circle cx={250} cy={334} r={7} fill="#E2B33B" />
      </g>
      <Twinkles color="#E2B33B" pts={[{ x: 110, y: 260, r: 12 }, { x: 392, y: 250, r: 10 }, { x: 410, y: 360, r: 7 }, { x: 96, y: 370, r: 8 }]} />
    </>
  );
}

export const ART: ArtMap = {
  apple: Apple,
  chalk: Chalk,
  pencil: Pencil,
  globe: Globe,
  bus: Bus,
  crayons: Crayons,
  diploma: Diploma,
  tassel: Tassel,
  classact: ClassAct,
  roadahead: RoadAhead,
  bookstack: BookStack,
};
