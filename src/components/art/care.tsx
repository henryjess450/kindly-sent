import { anim, pivot, Title, Kicker, Frame, r1, HEART, LEAF, scatter, Twinkles, type ArtMap, type ArtProps } from "./kit";

// Covers for the "care" group. Register each one in ART by its design id.

function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-60 20 a 26 26 0 0 1 10 -50 a 34 34 0 0 1 62 -10 a 28 28 0 0 1 48 26 a 22 22 0 0 1 0 44 h-120 a 20 20 0 0 1 0 -10 Z" fill={fill} />
    </g>
  );
}

/** A little "z" that drifts up and fades, returning while invisible. */
function Zed({ x, y, size, delay, fill }: { x: number; y: number; size: number; delay: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <text style={{ ...anim("ks-care-rise", 4.5, { delay, ease: "linear", vars: { "--dx": "26px", "--h": "-90px", "--o": "0.7" } }), fontFamily: "var(--font-display)", fontWeight: 700, fontSize: size }} fill={fill}>z</text>
    </g>
  );
}

/* ------------------------------------------------------------------ just because */

function Cactus({ d }: ArtProps) {
  const green = "#5E9E6E";
  const spines = [[226, 262], [274, 278], [222, 340], [278, 360], [238, 396], [166, 300], [334, 262]];
  return (
    <>
      <Frame color={d.ink} />
      <g style={anim("ks-sway", 6, { ...pivot(250, 430), vars: { "--amp": "2deg" } })}>
        <path d="M210 360 H180 Q150 360 150 330 V280 a16 16 0 0 1 32 0 V328 H210 Z" fill={green} />
        <path d="M290 318 H318 V250 a16 16 0 0 1 32 0 V312 Q350 352 310 352 H290 Z" fill={green} />
        <rect x={205} y={230} width={90} height={210} rx={45} fill={green} />
        {spines.map(([x, y], i) => <path key={i} d={`M${x} ${y} l ${i % 2 ? 7 : -7} -5`} stroke="#F5F0DC" strokeWidth={2.5} strokeLinecap="round" />)}
        <circle cx={236} cy={300} r={4.5} fill={d.ink} />
        <circle cx={264} cy={300} r={4.5} fill={d.ink} />
        <path d="M241 312 q9 8 18 0" stroke={d.ink} strokeWidth={3} fill="none" strokeLinecap="round" />
        <circle cx={226} cy={312} r={6} fill={d.accent} opacity={0.45} />
        <circle cx={274} cy={312} r={6} fill={d.accent} opacity={0.45} />
        <g transform="translate(250 236)">
          <g style={anim("ks-bob", 2.8, { origin: "50% 100%" })}>
            {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={r1(Math.cos((a * Math.PI) / 180) * 12)} cy={r1(-14 + Math.sin((a * Math.PI) / 180) * 12)} r={10} fill={d.accent} />)}
            <circle cx={0} cy={-14} r={7} fill="#FFD166" />
          </g>
        </g>
      </g>
      <path d="M175 430 L325 430 L310 520 H190 Z" fill="#D9774B" />
      <rect x={165} y={418} width={170} height={28} rx={7} fill="#C4643A" />
      <path d={HEART} transform="translate(250 484) scale(1.1)" fill="#FBF3E4" opacity={0.85} />
      <ellipse cx={250} cy={524} rx={100} ry={9} fill={d.ink} opacity={0.12} />
      <Kicker y={590} fill={d.ink}>Sending a</Kicker>
      <Title y={648} size={52} fill={d.ink}>(careful) hug</Title>
    </>
  );
}

function CatNap({ d }: ArtProps) {
  const fur = d.accent;
  return (
    <>
      <Frame color={d.ink} />
      <ellipse cx={260} cy={470} rx={190} ry={44} fill="#B9C3E6" />
      <ellipse cx={260} cy={462} rx={170} ry={30} fill="#CDD5F0" />
      <g style={anim("ks-care-breathe", 4.2, { origin: "50% 100%" })}>
        <ellipse cx={280} cy={410} rx={120} ry={62} fill={fur} />
        {[250, 285, 320].map((x) => <path key={x} d={`M${x} 352 q 8 22 0 40`} stroke="#C97F3C" strokeWidth={7} strokeLinecap="round" fill="none" />)}
        <path d="M134 386 L140 336 L172 366 Z M200 370 L222 334 L230 380 Z" fill={fur} />
        <circle cx={180} cy={414} r={52} fill={fur} />
        <ellipse cx={180} cy={430} rx={24} ry={16} fill="#F6D7B0" />
        <path d="M152 408 q10 8 20 0 M190 408 q10 8 20 0" stroke={d.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
        <path d="M176 426 l4 4 l4 -4 Z" fill="#D8707C" />
        <path d="M390 420 Q405 470 330 468 H240" stroke={fur} strokeWidth={22} strokeLinecap="round" fill="none" />
        <g style={anim("ks-sway", 3.4, { ...pivot(240, 468), vars: { "--amp": "9deg" } })}>
          <path d="M240 468 Q214 468 212 446" stroke="#C97F3C" strokeWidth={22} strokeLinecap="round" fill="none" />
        </g>
      </g>
      <Zed x={196} y={330} size={34} delay={0} fill={d.ink} />
      <Zed x={214} y={318} size={26} delay={-1.5} fill={d.ink} />
      <Zed x={230} y={306} size={20} delay={-3} fill={d.ink} />
      <Kicker y={588} fill={d.ink}>Just because</Kicker>
      <Title y={648} size={52} fill={d.ink} serif italic>Thinking of you</Title>
    </>
  );
}

function Whale({ d }: ArtProps) {
  const wave = (y: number) => `M-40 ${y} ${"q 25 -16 50 0 ".repeat(12)} V${y + 60} H-40 Z`;
  return (
    <>
      <g style={anim("ks-float", 5, { vars: { "--rise": "-10px" } })}>
        <g transform="translate(236 292)">
          <g style={anim("ks-care-puff", 2.6, { origin: "50% 100%", ease: "ease-out" })}>
            <path d="M0 0 V-34 M0 -34 q -18 -22 -40 -8 M0 -34 q 18 -22 40 -8" stroke="#7FB8E6" strokeWidth={7} strokeLinecap="round" fill="none" />
            <circle cx={-46} cy={-30} r={5} fill="#7FB8E6" />
            <circle cx={46} cy={-30} r={5} fill="#7FB8E6" />
          </g>
        </g>
        <path d="M345 372 Q385 352 392 312 Q418 300 432 280 Q424 322 398 334 Q384 380 345 394 Z" fill={d.accent} />
        <ellipse cx={250} cy={372} rx={112} ry={82} fill={d.accent} />
        <path d="M150 400 Q250 460 352 392 Q330 446 250 452 Q176 450 150 400 Z" fill="#CFE3F5" />
        <circle cx={196} cy={354} r={7} fill={d.ink} />
        <path d="M178 384 q16 12 34 2" stroke={d.ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <circle cx={214} cy={376} r={8} fill="#F29CB0" opacity={0.6} />
      </g>
      {[{ y: 432, c: "#9CC7EA", dx: 20 }, { y: 462, c: "#6FA7DA", dx: -24 }, { y: 492, c: d.accent, dx: 18 }].map((w, i) => (
        <path key={i} d={wave(w.y)} fill={w.c} style={anim("ks-drift", 5 + i, { delay: -i * 1.3, vars: { "--dx": `${w.dx}px` } })} />
      ))}
      <Twinkles color={d.accent} pts={[{ x: 100, y: 170, r: 10 }, { x: 400, y: 140, r: 8 }, { x: 370, y: 230, r: 6 }]} />
      <Title y={598} size={56} fill={d.ink}>Whale hello</Title>
      <Title y={650} size={56} fill={d.ink} serif italic>there</Title>
    </>
  );
}

function AirBalloon({ d }: ArtProps) {
  const shape = "M250 100 C330 100 362 172 342 244 C328 292 282 322 272 344 H228 C218 322 172 292 158 244 C138 172 170 100 250 100 Z";
  return (
    <>
      <g style={anim("ks-drift", 9, { vars: { "--dx": "26px" } })}><Cloud x={110} y={200} s={0.8} fill="#FFFFFF" /></g>
      <g style={anim("ks-drift", 11, { delay: -4, vars: { "--dx": "-30px" } })}><Cloud x={410} y={340} s={0.9} fill="#FFFFFF" /></g>
      <g style={anim("ks-float", 6, { vars: { "--rise": "-20px" } })}>
        <g style={anim("ks-sway", 5, { ...pivot(250, 110), vars: { "--amp": "2deg" } })}>
          <clipPath id="airballoon-clip"><path d={shape} /></clipPath>
          <g clipPath="url(#airballoon-clip)">
            <rect x={140} y={90} width={220} height={260} fill={d.accent} />
            <ellipse cx={250} cy={220} rx={64} ry={140} fill="#FFF4E0" />
            <ellipse cx={250} cy={220} rx={28} ry={140} fill="#F2B84B" />
          </g>
          <path d="M232 344 L236 392 M268 344 L264 392" stroke={d.ink} strokeWidth={2.5} />
          <rect x={226} y={390} width={48} height={36} rx={5} fill="#A9744F" />
          <path d="M226 404 H274 M240 390 V426 M260 390 V426" stroke="#7E5434" strokeWidth={2} />
        </g>
      </g>
      <g style={anim("ks-drift", 10, { delay: -2, vars: { "--dx": "22px" } })}><Cloud x={150} y={470} s={1} fill="#FFFFFF" /></g>
      <Kicker y={590} fill={d.ink}>Just because</Kicker>
      <Title y={648} size={50} fill={d.ink}>Up, up and away</Title>
    </>
  );
}

function SnailMail({ d }: ArtProps) {
  const spiral = Array.from({ length: 36 }, (_, i) => {
    const t = (i / 35) * 3.5 * Math.PI;
    return `${i ? "L" : "M"}${r1(208 + Math.cos(t) * (4 + t * 5))} ${r1(398 + Math.sin(t) * (4 + t * 5))}`;
  }).join(" ");
  return (
    <>
      <Frame color={d.ink} />
      <path d="M60 474 H440" stroke={d.ink} strokeWidth={3} strokeLinecap="round" opacity={0.25} />
      <path d="M70 470 H180" stroke={d.accent} strokeWidth={4} strokeDasharray="2 12" strokeLinecap="round" opacity={0.5} />
      <g style={anim("ks-drift", 8, { vars: { "--dx": "50px" } })}>
        <g style={anim("ks-care-squish", 2, { origin: "50% 100%" })}>
          <path d="M118 470 H290 Q324 470 326 438 Q328 400 308 396 Q298 420 278 438 H132 Q108 448 118 470 Z" fill="#9CBF7A" />
          <path d="M304 400 L298 360 M316 400 L322 362" stroke="#9CBF7A" strokeWidth={6} strokeLinecap="round" />
          <circle cx={298} cy={358} r={8} fill="#9CBF7A" />
          <circle cx={322} cy={360} r={8} fill="#9CBF7A" />
          <circle cx={299} cy={358} r={3.5} fill={d.ink} />
          <circle cx={323} cy={360} r={3.5} fill={d.ink} />
          <path d="M304 420 q8 7 16 0" stroke={d.ink} strokeWidth={3} strokeLinecap="round" fill="none" />
          <circle cx={208} cy={398} r={70} fill={d.accent} />
          <path d={spiral} stroke="#9E6638" strokeWidth={6} strokeLinecap="round" fill="none" />
          <g transform="translate(214 326) rotate(-8)">
            <rect x={-38} y={-25} width={76} height={50} rx={4} fill="#FFFDF7" stroke={d.ink} strokeWidth={2} />
            <path d="M-38 -25 L0 4 L38 -25" stroke={d.ink} strokeWidth={2} fill="none" />
            <path d={HEART} transform="translate(0 2) scale(0.55)" fill="#E07A7A" />
          </g>
        </g>
      </g>
      <Kicker y={588} fill={d.ink}>Snail mail</Kicker>
      <Title y={646} size={50} fill={d.ink}>Worth the wait</Title>
    </>
  );
}

/* ------------------------------------------------------------------ get well */

function Bandage({ d }: ArtProps) {
  const strip = (a: number) => (
    <g transform={`translate(250 320) rotate(${a})`}>
      <rect x={-112} y={-26} width={224} height={52} rx={26} fill="#F3D3B1" />
      <rect x={-30} y={-22} width={60} height={44} rx={6} fill="#E8BE95" />
      {[-80, -64, 64, 80].map((x) => <circle key={x} cx={x} cy={0} r={3} fill="#D9A77C" />)}
    </g>
  );
  return (
    <>
      <Frame color={d.accent} />
      <Twinkles color={d.accent} pts={[{ x: 92, y: 150, r: 12 }, { x: 410, y: 120, r: 9 }, { x: 420, y: 430, r: 11 }, { x: 80, y: 420, r: 7 }]} />
      <g style={anim("ks-beat", 2.6, { origin: "250px 330px", box: "view-box" })}>
        <path d={HEART} transform="translate(250 360) scale(9)" fill={d.accent} />
        <path d="M168 230 q -26 30 -16 70" stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.5} />
        {strip(35)}
        {strip(-35)}
      </g>
      <Title y={590} fill={d.ink}>Get well</Title>
      <Title y={646} fill={d.ink} serif italic>soon</Title>
    </>
  );
}

function Soup({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      {[200, 250, 300].map((x, i) => (
        <g key={x} transform={`translate(${x} 330)`}>
          <path d="M0 0 q -16 -26 0 -52 q 16 -26 0 -52" stroke={d.ink} strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" fill="none" style={anim("ks-care-rise", 3.9, { delay: -i * 1.3, ease: "linear", vars: { "--h": "-60px", "--o": "1" } })} />
        </g>
      ))}
      <path d="M330 350 L392 262" stroke="#C9CDD2" strokeWidth={12} strokeLinecap="round" />
      <ellipse cx={250} cy={362} rx={132} ry={24} fill="#F2C14E" />
      <path d="M150 360 q12 -10 24 0 q12 10 24 0 M222 368 q12 -10 24 0 q12 10 24 0 M290 358 q12 -10 24 0" stroke="#FFF0C2" strokeWidth={5} strokeLinecap="round" fill="none" />
      {[[186, 352], [262, 356], [320, 368]].map(([x, y]) => <circle key={x} cx={x} cy={y} r={7} fill="#F08A3E" />)}
      {[[210, 372], [298, 350]].map(([x, y]) => <path key={x} d={LEAF} transform={`translate(${x} ${y}) rotate(70) scale(0.35)`} fill="#6BA368" />)}
      <path d="M116 362 H384 Q384 470 282 482 H218 Q116 470 116 362 Z" fill={d.accent} />
      <path d="M150 410 q100 30 200 0" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" fill="none" opacity={0.35} />
      <rect x={206} y={478} width={88} height={14} rx={5} fill={d.accent} />
      <ellipse cx={250} cy={496} rx={150} ry={12} fill={d.ink} opacity={0.12} />
      <Title y={612} size={60} fill={d.ink}>Feel better</Title>
    </>
  );
}

function Teddy({ d }: ArtProps) {
  const patches = ["#E58F7A", "#F2C57C", "#9FC5B5", "#B9A6D6", "#F6E3C6"];
  return (
    <>
      <Frame color={d.ink} />
      <ellipse cx={250} cy={320} rx={150} ry={56} fill="#FFFFFF" />
      <g style={anim("ks-care-breathe", 4.5, { origin: "50% 100%" })}>
        <circle cx={194} cy={238} r={26} fill="#B07A4F" />
        <circle cx={306} cy={238} r={26} fill="#B07A4F" />
        <circle cx={194} cy={238} r={13} fill="#E2B78E" />
        <circle cx={306} cy={238} r={13} fill="#E2B78E" />
        <circle cx={250} cy={298} r={72} fill="#B07A4F" />
        <ellipse cx={250} cy={326} rx={32} ry={23} fill="#E2B78E" />
        <ellipse cx={250} cy={316} rx={10} ry={7} fill={d.ink} />
        <path d="M218 290 q10 8 20 0 M262 290 q10 8 20 0" stroke={d.ink} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <clipPath id="teddy-quilt"><rect x={96} y={364} width={308} height={150} rx={22} /></clipPath>
        <g clipPath="url(#teddy-quilt)">
          {Array.from({ length: 18 }, (_, i) => <rect key={i} x={96 + (i % 6) * 52} y={364 + Math.floor(i / 6) * 50} width={52} height={50} fill={patches[(i * 2 + Math.floor(i / 6)) % 5]} />)}
          <path d="M96 414 H404 M96 464 H404 M148 364 V514 M200 364 V514 M252 364 V514 M304 364 V514 M356 364 V514" stroke="#FFFFFF" strokeWidth={2} strokeDasharray="5 5" opacity={0.8} />
        </g>
        <ellipse cx={196} cy={372} rx={26} ry={18} fill="#B07A4F" />
        <ellipse cx={304} cy={372} rx={26} ry={18} fill="#B07A4F" />
      </g>
      <Zed x={330} y={230} size={30} delay={0} fill={d.ink} />
      <Zed x={346} y={214} size={22} delay={-2.2} fill={d.ink} />
      <Title y={616} size={64} fill={d.ink}>Rest up</Title>
    </>
  );
}

function Windowsill({ d }: ArtProps) {
  return (
    <>
      <clipPath id="windowsill-pane"><rect x={100} y={80} width={300} height={320} /></clipPath>
      <rect x={100} y={80} width={300} height={320} fill="#DCEFFB" />
      <g clipPath="url(#windowsill-pane)">
        <g style={anim("ks-glow", 4, { vars: { "--lo": "0.45", "--hi": "1" } })}>
          <g style={anim("ks-spin", 30, { origin: "330px 160px", box: "view-box", ease: "linear" })}>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i * 30 * Math.PI) / 180;
              return <line key={i} x1={r1(330 + Math.cos(a) * 54)} y1={r1(160 + Math.sin(a) * 54)} x2={r1(330 + Math.cos(a) * 80)} y2={r1(160 + Math.sin(a) * 80)} stroke={d.accent} strokeWidth={8} strokeLinecap="round" />;
            })}
          </g>
        </g>
        <circle cx={330} cy={160} r={42} fill={d.accent} />
        <Cloud x={170} y={250} s={0.6} fill="#FFFFFF" />
      </g>
      <path d="M100 80 H400 V400 H100 Z M250 80 V400 M100 240 H400" stroke="#FFFFFF" strokeWidth={14} fill="none" />
      <rect x={92} y={72} width={316} height={336} rx={4} fill="none" stroke="#C9B48A" strokeWidth={6} />
      <path d="M250 330 C 248 300, 252 280, 250 250" stroke="#4E8A56" strokeWidth={5} strokeLinecap="round" fill="none" />
      <path d={LEAF} transform="translate(226 290) rotate(-55) scale(1.4)" fill="#5E9E6E" />
      <path d={LEAF} transform="translate(250 236) scale(1.2)" fill="#6FB07B" />
      <g style={anim("ks-sway", 3.6, { ...pivot(252, 300), vars: { "--amp": "8deg" } })}>
        <path d={LEAF} transform="translate(276 280) rotate(55) scale(1.4)" fill="#4E8A56" />
      </g>
      <path d="M212 328 H288 L280 402 H220 Z" fill="#D9774B" />
      <rect x={206} y={322} width={88} height={14} rx={4} fill="#C4643A" />
      <rect x={70} y={400} width={360} height={24} rx={4} fill="#E9D7AE" />
      <rect x={80} y={424} width={340} height={10} rx={3} fill={d.ink} opacity={0.12} />
      <Title y={588} size={52} fill={d.ink}>Brighter days</Title>
      <Title y={644} size={52} fill={d.ink} serif italic>ahead</Title>
    </>
  );
}

function Bounce({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <Twinkles color={d.accent} pts={[{ x: 110, y: 170, r: 11 }, { x: 390, y: 140, r: 9 }, { x: 400, y: 320, r: 7 }, { x: 96, y: 360, r: 7 }]} />
      <g transform="translate(250 488)">
        <ellipse rx={64} ry={10} fill={d.ink} style={anim("ks-care-shadow", 2.2, { ease: "linear" })} />
      </g>
      <g style={anim("ks-care-bounce", 2.2, { origin: "50% 100%", ease: "linear" })}>
        <circle cx={250} cy={234} r={52} fill={d.accent} />
        <path d="M204 206 Q250 250 296 206 M206 258 Q250 216 294 258" stroke="#FFE3D6" strokeWidth={9} fill="none" strokeLinecap="round" />
        <circle cx={232} cy={206} r={10} fill="#FFFFFF" opacity={0.5} />
      </g>
      <path d="M90 486 H410" stroke={d.ink} strokeWidth={4} strokeLinecap="round" opacity={0.25} />
      <Kicker y={590} fill={d.ink}>Get well soon</Kicker>
      <Title y={648} size={52} fill={d.ink}>Bounce back</Title>
    </>
  );
}

/* ------------------------------------------------------------------ thinking of you */

function Lantern({ d }: ArtProps) {
  const stars = scatter(22, 41).filter((s) => s.y < 380);
  const far = [{ x: 110, y: 470, s: 0.4 }, { x: 390, y: 450, s: 0.5 }, { x: 330, y: 500, s: 0.32 }];
  return (
    <>
      <linearGradient id="lantern-sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#1F2148" />
        <stop offset="1" stopColor="#56406E" />
      </linearGradient>
      <rect width={500} height={700} fill="url(#lantern-sky)" />
      {stars.map((s, i) => <circle key={i} cx={r1(s.x)} cy={r1(s.y)} r={r1(1 + s.r * 1.8)} fill="#FFF6E0" style={anim("ks-twinkle", r1(2.5 + s.q * 3), { delay: -r1(s.q * 4) })} />)}
      {far.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y}) scale(${f.s})`}>
          <g style={anim("ks-care-rise", 14 + i * 3, { delay: -i * 5, ease: "linear", vars: { "--h": "-700px", "--o": "0.8" } })}>
            <path d="M-34 -50 Q-44 10 -24 50 H24 Q44 10 34 -50 Z" fill={d.accent} />
          </g>
        </g>
      ))}
      <path d="M0 520 L90 470 L170 505 L260 460 L350 500 L430 468 L500 490 V540 H0 Z" fill="#1A1B3A" />
      <g style={anim("ks-float", 8, { vars: { "--rise": "-24px" } })}>
        <g style={anim("ks-sway", 6, { ...pivot(250, 260), vars: { "--amp": "2deg" } })}>
          <circle cx={250} cy={290} r={130} fill={d.accent} style={anim("ks-glow", 4, { vars: { "--lo": "0.1", "--hi": "0.24" } })} />
          <path d="M184 196 Q166 300 204 384 H296 Q334 300 316 196 Z" fill={d.accent} />
          <path d="M218 198 Q210 300 228 384 M282 198 Q290 300 272 384" stroke="#E08E3C" strokeWidth={3} fill="none" opacity={0.7} />
          <path d="M250 300 m0 -16 c 12 -12, 22 2, 0 22 c -22 -20, -12 -34, 0 -22" fill="#FFE8C2" opacity={0.85} />
          <rect x={198} y={384} width={104} height={10} rx={5} fill="#C9702E" />
          <path d="M250 398 c -8 8 -8 18 0 24 c 8 -6 8 -16 0 -24 Z" fill="#FFE29A" style={anim("ks-flicker", 1.4, { origin: "50% 100%" })} />
        </g>
      </g>
      <Kicker y={590} fill={d.ink}>You&apos;re always</Kicker>
      <Title y={648} size={56} fill={d.ink} serif italic>In my heart</Title>
    </>
  );
}

function Umbrella({ d }: ArtProps) {
  const drops = scatter(30, 23).map((p) => {
    const x = r1(40 + p.x * 0.84);
    const dx = Math.abs(x - 250) / 145;
    const stop = dx < 1 ? 300 - 95 * (1 - dx * dx) : 470;
    const fall = r1(stop - 44);
    return { x, fall, dur: r1(0.8 + fall / 450), q: p.q };
  });
  return (
    <>
      <Frame color={d.ink} />
      {drops.map((p, i) => (
        <g key={i} transform={`translate(${p.x} 30)`}>
          <path d="M0 0 l -3 14" stroke={d.accent} strokeWidth={3} strokeLinecap="round" style={anim("ks-care-rain", p.dur, { ease: "linear", delay: -r1(p.q * p.dur), vars: { "--fall": `${p.fall}px` } })} />
        </g>
      ))}
      <ellipse cx={250} cy={474} rx={170} ry={14} fill={d.accent} opacity={0.18} />
      <g style={anim("ks-sway", 6, { ...pivot(250, 380), vars: { "--amp": "3deg" } })}>
        <path d="M250 190 V372 q0 22 -20 22 q-16 0 -16 -14" stroke={d.ink} strokeWidth={6} strokeLinecap="round" fill="none" />
        <path d="M110 300 Q250 110 390 300 Q367 280 343 300 Q320 280 297 300 Q273 280 250 300 Q227 280 203 300 Q180 280 157 300 Q133 280 110 300 Z" fill={d.accent} />
        <path d="M250 205 Q210 240 203 300 M250 205 Q290 240 297 300" stroke="#FFFFFF" strokeWidth={3} fill="none" opacity={0.4} />
        <circle cx={250} cy={198} r={6} fill={d.ink} />
      </g>
      <g style={anim("ks-beat", 3, { origin: "282px 446px", box: "view-box" })}>
        <path d={HEART} transform="translate(282 452) scale(2.4)" fill="#E07A7A" />
      </g>
      <Title y={590} fill={d.ink}>I&apos;m here</Title>
      <Title y={646} fill={d.ink} serif italic>for you</Title>
    </>
  );
}

export const ART: ArtMap = {
  cactus: Cactus,
  catnap: CatNap,
  whale: Whale,
  airballoon: AirBalloon,
  snailmail: SnailMail,
  bandage: Bandage,
  soup: Soup,
  teddy: Teddy,
  windowsill: Windowsill,
  bounce: Bounce,
  lantern: Lantern,
  umbrella: Umbrella,
};
