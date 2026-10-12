import { anim, Falling, Frame, HEART, Kicker, pivot, r1, scatter, starPath, Title, Twinkles, type ArtMap, type ArtProps } from "./kit";

// Covers for the "milestones" group. Register each one in ART by its design id.

const CUP = "M170 170 H330 C330 280, 300 330, 250 340 C200 330, 170 280, 170 170 Z";

function Trophy({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.4} />
      <circle cx={250} cy={300} r={170} fill={d.accent} style={anim("ks-glow", 3.2, { vars: { "--lo": "0.08", "--hi": "0.18" } })} />
      <g fill="none" stroke={d.accent} strokeWidth={14} strokeLinecap="round">
        <path d="M176 194 C 116 190, 118 276, 196 284" />
        <path d="M324 194 C 384 190, 382 276, 304 284" />
      </g>
      <path d={CUP} fill={d.accent} />
      <rect x={238} y={338} width={24} height={52} fill={d.accent} />
      <path d="M200 390 H300 L312 430 H188 Z" fill={d.accent} />
      <rect x={168} y={430} width={164} height={44} rx={6} fill="#6B4A1E" />
      <rect x={210} y={442} width={80} height={20} rx={3} fill="#F5DC8A" />
      <path d={starPath(250, 240, 34, 14)} fill="#FFE9A8" />
      <clipPath id="trophy-shine-clip"><path d={CUP} /><path d="M200 390 H300 L312 430 H188 Z" /></clipPath>
      <g clipPath="url(#trophy-shine-clip)">
        <g style={anim("ks-milestones-shine", 3.6)}>
          <path d="M150 150 h34 l-56 330 h-34 Z" fill="#FFFFFF" opacity={0.55} />
        </g>
      </g>
      <Twinkles color={d.accent} pts={[{ x: 120, y: 150, r: 14 }, { x: 384, y: 132, r: 11 }, { x: 396, y: 360, r: 9 }, { x: 104, y: 380, r: 8 }]} />
      <Kicker y={560} fill={d.ink}>Congratulations</Kicker>
      <Title y={626} size={46} fill={d.ink}>You&apos;re a winner</Title>
    </>
  );
}

function Champagne({ d }: ArtProps) {
  const bubbles = scatter(14, 5);
  return (
    <>
      <Falling n={16} seed={12} dur={[7, 11]}>
        {(i) => <rect x={-5} y={-3} width={10} height={6} rx={2} fill={["#F2C14E", "#FF7A8A", "#7FD3C4", "#FFF4DC"][i % 4]} />}
      </Falling>
      {bubbles.map((b, i) => {
        const dur = r1(1.8 + b.q * 1.6);
        return (
          <g key={i} transform={`translate(250 292) rotate(${r1((b.x / 500 - 0.5) * 70)})`}>
            <circle r={r1(3 + b.r * 5)} fill={d.ink} opacity={0.75} style={anim("ks-rise", dur, { ease: "ease-out", delay: -r1(b.r * dur), vars: { "--h": `${r1(-90 - b.y * 0.12)}px` } })} />
          </g>
        );
      })}
      <path d="M212 540 V420 C212 385, 240 370, 240 335 V300 H260 V335 C260 370, 288 385, 288 420 V540 Q288 552 276 552 H224 Q212 552 212 540 Z" fill="#2F7A57" />
      <path d="M224 430 C 224 400, 238 390, 242 370" stroke="#FFFFFF" strokeOpacity={0.3} strokeWidth={6} strokeLinecap="round" fill="none" />
      <path d="M238 296 H262 V345 C 256 350, 244 350, 238 345 Z" fill={d.accent} />
      <rect x={222} y={444} width={56} height={62} rx={6} fill={d.ink} />
      <path d={starPath(250, 475, 13, 5)} fill={d.accent} />
      <g transform="translate(250 298)">
        <g style={anim("ks-milestones-pop", 3.4)}>
          <rect x={-10} y={-26} width={20} height={26} rx={5} fill="#D9B48F" />
          <rect x={-12} y={-6} width={24} height={6} rx={2} fill={d.accent} />
        </g>
      </g>
      <Kicker y={598} fill={d.ink}>Cheers to you</Kicker>
      <Title y={656} size={50} fill={d.ink}>Pop the bubbly</Title>
    </>
  );
}

function Rocket({ d }: ArtProps) {
  return (
    <>
      <clipPath id="rocket-sky"><rect x={0} y={0} width={500} height={530} /></clipPath>
      <g clipPath="url(#rocket-sky)">
        {scatter(16, 9).map((p, i) => {
          const dur = r1(1.2 + p.r * 1.4);
          return (
            <g key={i} transform={`translate(${r1(40 + p.x * 0.84)} 0)`}>
              <line x1={0} y1={0} x2={0} y2={r1(26 + p.y * 0.05)} stroke={d.ink} strokeWidth={2} strokeLinecap="round" style={anim("ks-milestones-streak", dur, { ease: "linear", delay: -r1(p.q * dur) })} />
            </g>
          );
        })}
      </g>
      <g style={anim("ks-float", 2.8, { vars: { "--rise": "-14px" } })}>
        <g style={anim("ks-flicker", 0.5, { origin: "50% 0%" })}>
          <path d="M230 444 C 228 480, 244 512, 250 536 C 256 512, 272 480, 270 444 Z" fill="#FFB020" />
          <path d="M240 444 C 240 470, 248 490, 250 504 C 252 490, 260 470, 260 444 Z" fill="#FFE7A0" />
        </g>
        <path d="M210 380 L168 452 L214 432 Z M290 380 L332 452 L286 432 Z" fill={d.accent} />
        <rect x={226} y={426} width={48} height={18} rx={4} fill="#8B90A8" />
        <path d="M250 190 C 300 230, 305 330, 290 430 H210 C 195 330, 200 230, 250 190 Z" fill="#F4F1FF" />
        <path d="M250 190 C 274 208, 286 232, 290 250 H210 C 214 232, 226 208, 250 190 Z" fill={d.accent} />
        <circle cx={250} cy={310} r={26} fill="#5BC0EB" stroke="#2B3A7A" strokeWidth={7} />
        <circle cx={242} cy={302} r={7} fill="#FFFFFF" opacity={0.6} />
        <path d="M250 380 V430" stroke={d.accent} strokeWidth={8} strokeLinecap="round" />
      </g>
      <Twinkles color={d.accent} pts={[{ x: 110, y: 140, r: 10 }, { x: 390, y: 220, r: 13 }, { x: 96, y: 420, r: 8 }]} />
      <Kicker y={596} fill={d.ink}>Onwards and upwards</Kicker>
      <Title y={652} size={48} fill={d.ink}>Sky&apos;s the limit</Title>
    </>
  );
}

function Summit({ d }: ArtProps) {
  return (
    <>
      <circle cx={380} cy={150} r={70} fill="#FFC94A" style={anim("ks-glow", 3, { vars: { "--lo": "0.18", "--hi": "0.4" } })} />
      <circle cx={380} cy={150} r={46} fill="#FFC94A" />
      {[{ x: 70, y: 130, dx: "30px" }, { x: 330, y: 280, dx: "-26px" }].map((c, i) => (
        <g key={i} style={anim("ks-drift", 7 + i * 2, { vars: { "--dx": c.dx } })}>
          <path d={`M${c.x} ${c.y} h70 a16 16 0 0 0 -16 -22 a22 22 0 0 0 -38 -6 a14 14 0 0 0 -16 28 Z`} fill="#FFFFFF" />
        </g>
      ))}
      <path d="M30 560 L170 300 L290 560 Z" fill="#9DB8C6" />
      <path d="M90 560 L270 210 L470 560 Z" fill="#3E6A80" />
      <path d="M270 210 L232 284 L252 272 L268 292 L286 270 L306 278 Z" fill="#FFFFFF" />
      <path d="M170 300 L148 342 L164 334 L176 346 L190 336 Z" fill="#FFFFFF" opacity={0.85} />
      <line x1={270} y1={212} x2={270} y2={130} stroke={d.ink} strokeWidth={4} strokeLinecap="round" />
      <path d="M272 134 L330 148 L272 164 Z" fill={d.accent} style={anim("ks-milestones-wave", 1.8, { origin: "0% 50%" })} />
      <rect x={30} y={556} width={440} height={8} rx={4} fill={d.ink} opacity={0.85} />
      <Kicker y={608} fill={d.ink}>You made it to the top</Kicker>
      <Title y={662} fill={d.ink}>Way to go</Title>
    </>
  );
}

const FRONDS = [-165, -115, -65, -15, 25, 155];
function Palm({ x, y, delay }: { x: number; y: number; delay: number }) {
  return (
    <g style={anim("ks-sway", 4.4, { ...pivot(x, y), delay, vars: { "--amp": "4deg" } })}>
      {FRONDS.map((a) => (
        <path key={a} d={`M${x} ${y} C ${x + 24} ${y - 20}, ${x + 64} ${y - 14}, ${x + 88} ${y + 20} C ${x + 60} ${y + 2}, ${x + 28} ${y - 2}, ${x} ${y} Z`} fill="#4E9A5B" transform={`rotate(${a} ${x} ${y})`} />
      ))}
      <circle cx={x} cy={y + 8} r={9} fill="#7A4E2E" />
    </g>
  );
}

function Hammock({ d }: ArtProps) {
  return (
    <>
      <circle cx={250} cy={180} r={86} fill="#FFB347" style={anim("ks-glow", 4, { vars: { "--lo": "0.2", "--hi": "0.4" } })} />
      <circle cx={250} cy={180} r={60} fill="#FFB347" />
      <ellipse cx={250} cy={540} rx={215} ry={18} fill="#F2D5A6" />
      <path d="M140 540 C 130 450, 110 340, 120 260" stroke="#8A5A3B" strokeWidth={16} strokeLinecap="round" fill="none" />
      <path d="M360 540 C 370 450, 390 340, 380 260" stroke="#8A5A3B" strokeWidth={16} strokeLinecap="round" fill="none" />
      <Palm x={120} y={260} delay={0} />
      <Palm x={380} y={260} delay={-2} />
      <path d="M122 372 L150 394 M378 372 L350 394" stroke={d.ink} strokeWidth={3} strokeLinecap="round" />
      <g style={anim("ks-milestones-swing", 3.6, pivot(250, 394))}>
        <path d="M150 394 C 195 468, 305 468, 350 394 C 305 444, 195 444, 150 394 Z" fill={d.accent} />
        <path d="M182 420 C 220 448, 280 448, 318 420" stroke="#FFF1DC" strokeWidth={5} fill="none" strokeLinecap="round" />
        <ellipse cx={290} cy={430} rx={26} ry={9} fill="#F4D35E" />
        <ellipse cx={290} cy={426} rx={12} ry={8} fill="#F4D35E" />
      </g>
      <Kicker y={598} fill={d.ink}>Time to relax</Kicker>
      <Title y={652} size={44} fill={d.ink}>Happy retirement</Title>
    </>
  );
}

function Key({ c, hole }: { c: string; hole: string }) {
  return (
    <>
      <circle cx={0} cy={26} r={24} fill={c} />
      <circle cx={0} cy={18} r={7} fill={hole} />
      <rect x={-5} y={46} width={10} height={98} rx={3} fill={c} />
      <path d="M4 112 h14 v8 h-8 v6 h8 v10 h-14 Z" fill={c} />
    </>
  );
}

function NewKeys({ d }: ArtProps) {
  const keys = [{ a: 22, c: d.accent }, { a: 0, c: "#B8C2BC" }, { a: -22, c: "#5E8C76" }];
  return (
    <>
      <Frame color={d.ink} />
      <circle cx={250} cy={176} r={8} fill={d.ink} />
      <g style={anim("ks-sway", 3.6, { ...pivot(250, 176), vars: { "--amp": "5deg" } })}>
        <circle cx={250} cy={216} r={36} fill="none" stroke="#9AA5A0" strokeWidth={6} />
        <g transform="translate(250 246) rotate(60) scale(1.2)">
          <g style={anim("ks-sway", 2.6, { origin: "50% 0%", delay: -1, vars: { "--amp": "5deg" } })}>
            <line x1={0} y1={0} x2={0} y2={30} stroke={d.ink} strokeWidth={2} />
            <path d="M-36 30 h72 v66 a8 8 0 0 1 -8 8 h-56 a8 8 0 0 1 -8 -8 Z" fill="#FFFFFF" />
            <path d="M-20 70 L0 52 L20 70 V92 H-20 Z" fill={d.accent} />
            <rect x={-5} y={78} width={10} height={14} fill="#FFFFFF" />
          </g>
        </g>
        {keys.map((k, i) => (
          <g key={i} transform={`translate(250 248) rotate(${k.a}) scale(1.25)`}>
            <g style={anim("ks-sway", 2.2 + i * 0.4, { origin: "50% 0%", delay: -i * 0.7, vars: { "--amp": "4deg" } })}>
              <Key c={k.c} hole={d.paper} />
            </g>
          </g>
        ))}
      </g>
      <Twinkles color={d.accent} pts={[{ x: 120, y: 200, r: 10 }, { x: 382, y: 170, r: 12 }, { x: 370, y: 420, r: 8 }]} />
      <Kicker y={566} fill={d.ink}>New keys, new chapter</Kicker>
      <Title y={630} fill={d.ink}>Welcome home</Title>
    </>
  );
}

function LittleHouse({ d }: ArtProps) {
  const stars = scatter(10, 17).map((p) => ({ x: r1(50 + p.x * 0.8), y: r1(50 + p.y * 0.22), r: r1(4 + p.r * 6) }));
  return (
    <>
      <Twinkles color={d.ink} pts={stars} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform="translate(315 238)">
          <circle r={16} fill={d.ink} style={anim("ks-milestones-smoke", 4.5, { ease: "ease-out", delay: -i * 1.5 })} />
        </g>
      ))}
      <rect x={300} y={240} width={30} height={80} fill="#8C4A3A" />
      <rect x={150} y={330} width={200} height={200} fill="#E9DCC9" />
      <path d="M126 342 L250 228 L374 342 Z" fill="#C4553B" />
      {[192, 308].map((x, i) => (
        <g key={x}>
          <rect x={x - 34} y={358} width={68} height={68} rx={6} fill="#FFD27A" style={anim("ks-glow", 3.4, { delay: -i * 1.2, vars: { "--lo": "0.25", "--hi": "0.55" } })} />
          <rect x={x - 22} y={370} width={44} height={44} rx={3} fill="#FFD27A" />
          <path d={`M${x} 370 V414 M${x - 22} 392 H${x + 22}`} stroke="#E9DCC9" strokeWidth={4} />
        </g>
      ))}
      <path d="M226 530 V466 a24 24 0 0 1 48 0 V530 Z" fill={d.accent} />
      <circle cx={264} cy={498} r={3.5} fill={d.paper} />
      <rect x={60} y={528} width={380} height={10} rx={5} fill={d.ink} opacity={0.85} />
      <Kicker y={590} fill={d.ink}>Cosy days ahead</Kicker>
      <Title y={648} size={46} fill={d.ink}>Home sweet home</Title>
    </>
  );
}

function Clover({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.3} />
      <g style={anim("ks-sway", 4.6, { ...pivot(232, 520), vars: { "--amp": "5deg" } })}>
        <path d="M250 300 C 262 380, 220 440, 232 520" stroke={d.accent} strokeWidth={9} strokeLinecap="round" fill="none" />
        {[45, 135, 225, 315].map((a) => (
          <g key={a} transform={`translate(250 300) rotate(${a}) scale(3.6) translate(0 -10)`}>
            <path d={HEART} fill={d.accent} />
            <path d="M0 8 V-10" stroke="#BFE3A8" strokeWidth={0.8} strokeLinecap="round" />
          </g>
        ))}
        <circle cx={250} cy={300} r={7} fill="#2E6B31" />
      </g>
      <Twinkles color="#E9B949" pts={[{ x: 110, y: 170, r: 13 }, { x: 392, y: 190, r: 10 }, { x: 372, y: 430, r: 12 }, { x: 120, y: 420, r: 8 }]} />
      <Kicker y={590} fill={d.ink}>Fingers crossed</Kicker>
      <Title y={650} fill={d.ink}>Good luck</Title>
    </>
  );
}

function ShootingStar({ d }: ArtProps) {
  const dots = scatter(30, 23);
  return (
    <>
      {dots.map((p, i) => <circle key={i} cx={r1(p.x)} cy={r1(p.y * 0.72)} r={r1(0.8 + p.r * 1.6)} fill={d.ink} opacity={0.6} />)}
      <Twinkles color={d.ink} pts={[{ x: 100, y: 330, r: 9 }, { x: 410, y: 120, r: 11 }, { x: 330, y: 470, r: 7 }]} />
      <linearGradient id="shootingstar-trail" gradientUnits="userSpaceOnUse" x1={-170} y1={-106} x2={0} y2={0}>
        <stop offset="0" stopColor={d.accent} stopOpacity={0} />
        <stop offset="1" stopColor={d.accent} stopOpacity={0.9} />
      </linearGradient>
      <g transform="translate(80 160)">
        <g style={anim("ks-milestones-shoot", 4.8, { ease: "ease-in" })}>
          <path d="M-6 9 L6 -9 L-170 -106 Z" fill="url(#shootingstar-trail)" />
          <path d={starPath(0, 0, 18, 8)} fill={d.accent} />
        </g>
      </g>
      <path d={starPath(150, 430, 10, 4)} fill={d.accent} opacity={0.8} style={anim("ks-twinkle", 3)} />
      {/* The wishing star: always there, glowing softly while the shooting star passes. */}
      <circle cx={250} cy={350} r={64} fill="#FFD860" style={anim("ks-glow", 3.2, { vars: { "--lo": "0.04", "--hi": "0.12" } })} />
      <g style={anim("ks-sway", 6, { vars: { "--amp": "5deg" } })}>
        <path d={starPath(250, 350, 50, 22)} fill="#FFD860" strokeLinejoin="round" stroke="#FFD860" strokeWidth={8} />
        <path d={starPath(250, 350, 28, 12)} fill="#FFF6D6" />
      </g>
      <Kicker y={566} fill={d.ink}>Make a wish</Kicker>
      <Title y={628} size={44} fill={d.ink}>Wishing you luck</Title>
    </>
  );
}

const SCRIPT =
  "M60 392 C 80 388, 98 360, 108 300 C 104 340, 100 380, 108 396 C 114 404, 126 398, 134 388 " +
  "C 144 360, 152 320, 156 294 C 158 282, 148 282, 146 296 C 142 330, 140 370, 140 398 " +
  "C 146 372, 162 358, 172 362 C 182 366, 178 390, 182 396 C 186 402, 196 398, 204 386 " +
  "C 208 370, 218 360, 230 362 C 212 356, 200 380, 206 394 C 212 404, 228 392, 232 364 C 230 384, 232 398, 242 398 C 250 398, 256 390, 260 382 " +
  "C 264 370, 266 362, 268 362 C 270 372, 268 388, 268 398 C 272 376, 284 360, 294 362 C 304 364, 300 388, 304 396 C 308 402, 318 398, 326 386 " +
  "C 336 360, 344 318, 344 296 C 344 282, 334 284, 334 300 C 332 330, 332 370, 332 398 C 334 380, 346 362, 360 364 C 372 366, 366 382, 346 384 " +
  "C 356 386, 362 398, 372 398 C 378 398, 384 392, 388 386 C 392 376, 396 366, 402 362 C 396 374, 418 382, 414 394 C 410 404, 394 402, 390 394";

function ThanksNote({ d }: ArtProps) {
  return (
    <>
      <g transform="rotate(-2 250 360)">
        <rect x={74} y={190} width={352} height={320} rx={6} fill="#FFFFFF" />
        <rect x={210} y={176} width={80} height={28} fill={d.accent} opacity={0.35} transform="rotate(3 250 190)" />
        <g transform="translate(250 350) scale(0.88) translate(-239 -350)">
          <path d={SCRIPT} pathLength={1} strokeDasharray={1} fill="none" stroke={d.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" style={anim("ks-milestones-write", 6, { ease: "linear" })} />
        </g>
        <g transform="translate(250 456) scale(1.5)">
          <path d={HEART} fill={d.accent} style={anim("ks-beat", 2.4)} />
        </g>
      </g>
      <Kicker y={120} fill={d.ink}>A little note to say</Kicker>
      <Title y={612} size={64} fill={d.ink} serif italic>Thank you</Title>
    </>
  );
}

function Bee({ d }: ArtProps) {
  return (
    <>
      <path d="M250 430 C 244 500, 258 560, 250 640" stroke="#5E8C4A" strokeWidth={7} strokeLinecap="round" fill="none" />
      <path d="M252 540 C 290 510, 330 520, 344 540 C 314 556, 280 556, 252 540 Z" fill="#7FAF6E" />
      <path d="M248 590 C 210 560, 170 570, 156 590 C 186 606, 220 606, 248 590 Z" fill="#7FAF6E" />
      <g style={anim("ks-spin", 40, { ease: "linear", ...pivot(250, 420) })}>
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i * Math.PI) / 3;
          return <circle key={i} cx={r1(250 + Math.cos(a) * 44)} cy={r1(420 + Math.sin(a) * 44)} r={36} fill="#FFFFFF" />;
        })}
      </g>
      <circle cx={250} cy={420} r={30} fill={d.accent} />
      <g transform="translate(250 380)">
        <g style={anim("ks-milestones-eight", 7, { ease: "linear" })}>
          <g style={anim("ks-flap", 0.18, { origin: "50% 100%" })}>
            <ellipse cx={-8} cy={-20} rx={10} ry={16} fill="#FFFFFF" opacity={0.85} />
            <ellipse cx={8} cy={-18} rx={9} ry={14} fill="#FFFFFF" opacity={0.85} />
          </g>
          <ellipse cx={0} cy={0} rx={24} ry={16} fill={d.accent} />
          <path d="M-8 -15 V15 M6 -15 V15" stroke={d.ink} strokeWidth={6} />
          <path d="M-24 0 l-9 -4 v8 Z" fill={d.ink} />
          <circle cx={26} cy={-2} r={10} fill={d.ink} />
          <circle cx={29} cy={-5} r={2.5} fill="#FFFFFF" />
        </g>
      </g>
      <Kicker y={104} fill={d.ink}>You&apos;re the bee&apos;s knees</Kicker>
      <Title y={168} size={50} fill={d.ink}>Thanks a bunch</Title>
    </>
  );
}

function Bird({ x, flip, body, delay }: { x: number; flip: boolean; body: string; delay: number }) {
  return (
    <g transform={`translate(${x} 418) scale(${flip ? -1 : 1} 1)`}>
      <g style={anim("ks-milestones-lean", 3.2, { origin: "50% 100%", delay })}>
        <path d="M-36 -30 L-70 -14 L-40 -14 Z" fill={body} />
        <ellipse cx={0} cy={-34} rx={44} ry={34} fill={body} />
        <circle cx={14} cy={-74} r={24} fill={body} />
        <path d="M-20 -40 C -4 -56, 22 -44, 14 -24 C 2 -18, -14 -24, -20 -40 Z" fill="#FFFFFF" opacity={0.35} />
        <path d="M36 -79 L48 -73 L36 -67 Z" fill="#F2A900" />
        <circle cx={22} cy={-80} r={3.5} fill="#2A1218" />
        <path d="M-6 0 v8 M8 0 v8" stroke="#7A5038" strokeWidth={3} strokeLinecap="round" />
      </g>
    </g>
  );
}

function LoveBirds({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.accent} opacity={0.3} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`translate(${226 + i * 24} 320) scale(${1.6 - i * 0.3})`}>
          <path d={HEART} fill={d.accent} style={anim("ks-rise", 4.5, { ease: "ease-out", delay: -i * 1.5, vars: { "--h": "-170px" } })} />
        </g>
      ))}
      <path d="M40 432 C 150 412, 300 442, 460 402" stroke="#7A5038" strokeWidth={10} strokeLinecap="round" fill="none" />
      <path d="M110 424 C 120 450, 150 456, 160 444 C 150 430, 130 424, 110 424 Z M390 416 C 400 390, 428 384, 440 394 C 428 410, 408 416, 390 416 Z" fill="#7FAF6E" />
      <Bird x={198} flip={false} body={d.accent} delay={0} />
      <Bird x={302} flip body="#F5A3B5" delay={0} />
      <Kicker y={570} fill={d.ink}>Just so you know</Kicker>
      <Title y={636} size={64} fill={d.ink} serif italic>Love you</Title>
    </>
  );
}

export const ART: ArtMap = {
  trophy: Trophy,
  champagne: Champagne,
  rocket: Rocket,
  summit: Summit,
  hammock: Hammock,
  newkeys: NewKeys,
  littlehouse: LittleHouse,
  clover: Clover,
  shootingstar: ShootingStar,
  thanksnote: ThanksNote,
  bee: Bee,
  lovebirds: LoveBirds,
};
