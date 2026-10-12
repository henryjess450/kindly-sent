import { anim, Frame, H, HEART, Kicker, LEAF, pivot, r1, scatter, Title, Twinkles, W } from "./kit";
import type { ArtMap, ArtProps } from "./kit";

// Covers for the "family" group. Register each one in ART by its design id.

const TULIP = "M0 50 C -36 46, -54 10, -50 -42 L -24 -16 L 0 -54 L 24 -16 L 50 -42 C 54 10, 36 46, 0 50 Z";
const TULIP_IN = "M0 50 C -14 30, -18 0, 0 -54 C 18 0, 14 30, 0 50 Z";
const ray = (cx: number, cy: number, deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: r1(cx + Math.cos(a) * r), y: r1(cy + Math.sin(a) * r) };
};

function Cloud({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={fill}>
      <ellipse cx={0} cy={10} rx={60} ry={18} />
      <circle cx={-22} cy={0} r={22} />
      <circle cx={12} cy={-8} r={28} />
    </g>
  );
}

/* ------------------------------------------------------------------ family */

function Mom({ d }: ArtProps) {
  const tulips = [{ x: 188, y: 300, c: d.accent, a: -12 }, { x: 250, y: 250, c: "#F2A541", a: 0 }, { x: 314, y: 306, c: "#B8457A", a: 12 }];
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={96} fill={d.ink}>Love you</Kicker>
      <Title y={170} size={76} fill={d.ink} serif italic>Mom</Title>
      {tulips.map((t, i) => (
        <g key={i} style={anim("ks-sway", 5 + i * 0.7, { ...pivot(250, 470), delay: -i * 1.3, vars: { "--amp": "3deg" } })}>
          <path d={`M250 470 Q ${(250 + t.x) / 2} 400, ${t.x} ${t.y + 28}`} stroke="#5E8C61" strokeWidth={5} strokeLinecap="round" fill="none" />
          {i === 1 && <path d={LEAF} transform="translate(230 420) rotate(-40) scale(1.5 1.2)" fill="#5E8C61" />}
          <g transform={`translate(${t.x} ${t.y}) rotate(${t.a}) scale(0.6)`}>
            <path d={TULIP} fill={t.c} />
            <path d={TULIP_IN} fill="#000" opacity={0.12} />
          </g>
        </g>
      ))}
      <path d="M204 460 H296 L288 482 C 334 512, 330 580, 298 600 H202 C 170 580, 166 512, 212 482 Z" fill="#7FB7C9" />
      <path d={HEART} transform="translate(250 540) scale(1.3)" fill="#fff" opacity={0.85} />
      <ellipse cx={250} cy={606} rx={96} ry={8} fill={d.ink} opacity={0.1} />
    </>
  );
}

function Dad({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={96} fill={d.ink}>To the</Kicker>
      <Title y={160} size={54} fill={d.ink}>Best dad ever</Title>
      {[212, 250, 288].map((x, i) => (
        <path key={x} d={`M${x} 300 q -16 -26 0 -52 q 16 -26 0 -52`} stroke={d.ink} strokeOpacity={0.3} strokeWidth={6} strokeLinecap="round" fill="none" style={anim("ks-steam", 3.6, { delay: -i * 1.2, origin: "50% 100%" })} />
      ))}
      <path d="M350 362 q 64 0 64 54 q 0 54 -64 54" stroke={d.accent} strokeWidth={20} fill="none" />
      <path d="M150 320 H350 V480 Q350 550 280 550 H220 Q150 550 150 480 Z" fill={d.accent} />
      <ellipse cx={250} cy={322} rx={100} ry={14} fill="#6B4226" />
      <g style={anim("ks-sway", 3.5, { ...pivot(250, 356), vars: { "--amp": "5deg" } })}>
        <clipPath id="dad-tie"><path d="M242 372 H258 L272 470 L250 494 L228 470 Z" /></clipPath>
        <path d="M242 372 H258 L272 470 L250 494 L228 470 Z" fill="#E4A33B" />
        <g clipPath="url(#dad-tie)" stroke="#B9472F" strokeWidth={6}>
          {[390, 420, 450, 480].map((y) => <line key={y} x1={220} y1={y} x2={280} y2={y - 30} />)}
        </g>
        <path d="M236 352 H264 L258 374 H242 Z" fill="#C9862A" />
      </g>
      <ellipse cx={250} cy={558} rx={150} ry={14} fill={d.ink} opacity={0.12} />
    </>
  );
}

function Knitting({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={96} fill={d.ink}>For my grandparents</Kicker>
      <Title y={162} size={56} fill={d.ink} serif italic>Warm wishes</Title>
      <ellipse cx={230} cy={494} rx={82} ry={8} fill={d.ink} opacity={0.12} />
      <path d="M236 490 C 262 540, 316 500, 350 530 C 356 535, 358 530, 360 522" stroke={d.accent} strokeWidth={3} fill="none" strokeLinecap="round" />
      <g transform="translate(390 534) scale(2.2)">
        <path d={HEART} fill="none" stroke={d.accent} strokeWidth={1.5} strokeDasharray="4 3" strokeLinecap="round" style={anim("ks-beat", 2.6)} />
      </g>
      <g style={anim("ks-sway", 4, { ...pivot(230, 490), vars: { "--amp": "4deg" } })}>
        <g stroke="#9B7550" strokeWidth={7} strokeLinecap="round">
          <line x1={168} y1={276} x2={260} y2={420} />
          <line x1={300} y1={268} x2={214} y2={420} />
        </g>
        <circle cx={168} cy={276} r={10} fill="#E0B44C" />
        <circle cx={300} cy={268} r={10} fill="#E0B44C" />
        <circle cx={230} cy={402} r={88} fill={d.accent} />
        <clipPath id="knitting-ball"><circle cx={230} cy={402} r={88} /></clipPath>
        <g clipPath="url(#knitting-ball)" fill="none" stroke="#9E3E2B" strokeWidth={4} opacity={0.7}>
          {[-50, -20, 10, 40].map((a) => <ellipse key={a} cx={230} cy={402} rx={92} ry={30} transform={`rotate(${a} 230 402)`} />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M${170 + i * 30} 316 C ${200 + i * 30} 380, ${200 + i * 30} 430, ${170 + i * 30} 490`} />)}
        </g>
      </g>
    </>
  );
}

function FamilyTree({ d }: ArtProps) {
  const colors = [d.accent, "#F2A541", "#E87F9A", "#7FAF6E"];
  const hearts = scatter(34, 7).map((p) => {
    const rr = Math.sqrt(p.y / H) * 135;
    const a = (p.x / W) * Math.PI * 2;
    return { x: r1(250 + Math.cos(a) * rr), y: r1(270 + Math.sin(a) * rr * 0.9), s: r1(1.1 + p.r * 0.5), q: p.q };
  });
  return (
    <>
      <Kicker y={96} fill={d.ink}>Rooted in love</Kicker>
      <ellipse cx={250} cy={548} rx={120} ry={10} fill={d.ink} opacity={0.1} />
      <g style={anim("ks-sway", 7, { ...pivot(250, 545), vars: { "--amp": "1.5deg" } })}>
        <path d="M236 545 C 240 480, 238 420, 232 380 L 200 330 L 210 324 L 242 368 L 250 300 L 262 300 L 262 362 L 296 318 L 306 326 L 270 384 C 264 430, 262 480, 266 545 Z" fill="#8B5E3C" />
        <circle cx={250} cy={268} r={150} fill="#7FAF6E" opacity={0.16} />
        {hearts.map((h, i) => (
          <g key={i} transform={`translate(${h.x} ${h.y}) scale(${h.s})`}>
            <path d={HEART} fill={colors[i % 4]} style={anim("ks-sway", r1(2.6 + h.q * 2), { delay: -r1(h.q * 3), vars: { "--amp": "10deg" } })} />
          </g>
        ))}
      </g>
      <Title y={622} fill={d.ink} serif italic>Our family</Title>
    </>
  );
}

function Pea({ x, y, ink, delay }: { x: number; y: number; ink: string; delay: number }) {
  return (
    <g style={anim("ks-bob", 3.2, { delay })}>
      <circle cx={x} cy={y} r={50} fill="#9CCC65" />
      <circle cx={x - 18} cy={y - 20} r={12} fill="#fff" opacity={0.35} />
      <g style={anim("ks-family-blink", 4.5, { delay: delay * 1.7 })}>
        <circle cx={x - 15} cy={y - 4} r={5} fill={ink} />
        <circle cx={x + 15} cy={y - 4} r={5} fill={ink} />
      </g>
      <path d={`M${x - 14} ${y + 12} q 14 14 28 0`} stroke={ink} strokeWidth={4} strokeLinecap="round" fill="none" />
      <ellipse cx={x - 28} cy={y + 10} rx={7} ry={4} fill="#F28C8C" opacity={0.6} />
      <ellipse cx={x + 28} cy={y + 10} rx={7} ry={4} fill="#F28C8C" opacity={0.6} />
    </g>
  );
}

function TwoPeas({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <g style={anim("ks-float", 6, { vars: { "--rise": "-8px" } })}>
        <path d="M430 352 q 26 -8 22 -38 q -4 -20 -22 -12" stroke="#4E8A2A" strokeWidth={5} strokeLinecap="round" fill="none" style={anim("ks-sway", 3, { ...pivot(430, 352), vars: { "--amp": "8deg" } })} />
        <path d="M70 360 C 110 270, 390 270, 430 360 C 390 440, 110 440, 70 360 Z" fill="#4E8A2A" />
        <path d="M100 360 C 140 302, 360 302, 400 360 C 360 412, 140 412, 100 360 Z" fill="#D8EDB4" />
        <Pea x={190} y={356} ink={d.ink} delay={0} />
        <Pea x={310} y={356} ink={d.ink} delay={-1.1} />
        <path d="M70 360 C 120 380, 200 394, 250 394 C 300 394, 380 380, 430 360 C 390 446, 110 446, 70 360 Z" fill="#5E9C36" />
      </g>
      <Kicker y={556} fill={d.ink}>You &amp; me</Kicker>
      <Title y={622} size={44} fill={d.ink}>Two peas in a pod</Title>
    </>
  );
}

/* ------------------------------------------------------------------ friends */

function Flute({ x, accent, ink }: { x: number; accent: string; ink: string }) {
  return (
    <>
      <path d={`M${x - 32} 250 L${x + 32} 250 L${x + 24} 380 Q${x} 410 ${x - 24} 380 Z`} fill="#fff" opacity={0.6} />
      <path d={`M${x - 29.8} 285 L${x + 29.8} 285 L${x + 24} 380 Q${x} 410 ${x - 24} 380 Z`} fill={accent} />
      {[0, 1, 2, 3].map((k) => (
        <circle key={k} cx={x - 12 + k * 8} cy={370} r={3} fill="#fff" style={anim("ks-rise", 2.4, { ease: "linear", delay: -k * 0.6, vars: { "--h": "-80px" } })} />
      ))}
      <path d={`M${x - 32} 250 L${x + 32} 250 L${x + 24} 380 Q${x} 410 ${x - 24} 380 Z`} fill="none" stroke={ink} strokeOpacity={0.45} strokeWidth={3} strokeLinejoin="round" />
      <rect x={x - 3} y={400} width={6} height={90} fill={ink} opacity={0.35} />
      <ellipse cx={x} cy={492} rx={36} ry={7} fill={ink} opacity={0.45} />
    </>
  );
}

function Cheers({ d }: ArtProps) {
  return (
    <>
      <Frame color={d.ink} />
      <Kicker y={110} fill={d.ink}>Here&apos;s to us</Kicker>
      <g style={anim("ks-family-clink", 3, { ...pivot(190, 492), vars: { "--tilt": "7deg" } })}><Flute x={190} accent={d.accent} ink={d.ink} /></g>
      <g style={anim("ks-family-clink", 3, { ...pivot(310, 492), vars: { "--tilt": "-7deg" } })}><Flute x={310} accent="#F4C95D" ink={d.ink} /></g>
      <g style={anim("ks-family-pop", 3, { origin: "250px 236px", box: "view-box" })}>
        {[-150, -120, -90, -60, -30].map((a) => {
          const p = ray(250, 236, a, 22);
          const q = ray(250, 236, a, 44);
          return <line key={a} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={d.accent} strokeWidth={5} strokeLinecap="round" />;
        })}
      </g>
      <ellipse cx={250} cy={500} rx={130} ry={10} fill={d.ink} opacity={0.08} />
      <Title y={604} size={52} fill={d.ink}>Cheers, friend</Title>
    </>
  );
}

function PaperPlane({ d }: ArtProps) {
  return (
    <>
      <g style={anim("ks-drift", 11, { vars: { "--dx": "26px" } })}><Cloud x={120} y={110} s={0.7} fill="#fff" /></g>
      <g style={anim("ks-drift", 13, { delay: -5, vars: { "--dx": "-22px" } })}><Cloud x={390} y={160} s={0.55} fill="#fff" /></g>
      <circle cx={250} cy={300} r={130} fill="none" stroke={d.ink} strokeOpacity={0.35} strokeWidth={3} strokeDasharray="6 10" strokeLinecap="round" />
      <g style={anim("ks-float", 4, { vars: { "--rise": "-8px" } })}>
        <circle cx={250} cy={300} r={44} fill="#FFC53D" />
        <circle cx={235} cy={290} r={5} fill={d.ink} />
        <circle cx={265} cy={290} r={5} fill={d.ink} />
        <path d="M230 310 q 20 20 40 0" stroke={d.ink} strokeWidth={4} strokeLinecap="round" fill="none" />
      </g>
      <g style={anim("ks-spin", 7, { ...pivot(250, 300), ease: "linear" })}>
        <path d="M120 258 L92 330 L120 314 Z" fill="#CFE0F5" stroke={d.ink} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M120 258 L148 330 L120 314 Z" fill="#fff" stroke={d.ink} strokeWidth={2.5} strokeLinejoin="round" />
        <path d="M120 262 L120 314" stroke={d.accent} strokeWidth={2.5} />
      </g>
      <Kicker y={540} fill={d.ink}>Sending you</Kicker>
      <Title y={612} size={64} fill={d.ink} serif italic>a smile</Title>
    </>
  );
}

function Hand({ skin, sleeve }: { skin: string; sleeve: string }) {
  return (
    <>
      <rect x={-30} y={30} width={60} height={130} rx={12} fill={sleeve} />
      {/* Palm toward the other hand: thumb on the inside, pinky on the outside. */}
      {[-32, -11, 10, 31].map((fx, i) => <rect key={fx} x={fx - 9.5} y={[-84, -100, -104, -92][i]} width={19} height={80} rx={9.5} fill={skin} />)}
      <rect x={-42} y={-40} width={84} height={86} rx={28} fill={skin} />
      <rect x={20} y={-12} width={52} height={20} rx={10} fill={skin} transform="rotate(-50 40 0)" />
    </>
  );
}

function HighFive({ d }: ArtProps) {
  const hands = [{ x: 150, dx: "60px", s: 1, skin: "#F2C29B", sleeve: d.accent }, { x: 350, dx: "-60px", s: -1, skin: "#B9784F", sleeve: "#3A86FF" }];
  return (
    <>
      <Frame color={d.ink} />
      <g style={anim("ks-family-pop", 2.4, { origin: "250px 250px", box: "view-box" })}>
        {[-180, -150, -120, -90, -60, -30, 0].map((a) => {
          const p = ray(250, 250, a, 70);
          const q = ray(250, 250, a, 100);
          return <line key={a} x1={p.x} y1={p.y} x2={q.x} y2={q.y} stroke={a % 60 === 0 ? d.accent : "#FFC53D"} strokeWidth={7} strokeLinecap="round" />;
        })}
      </g>
      {hands.map((h) => (
        <g key={h.x} transform={`translate(${h.x} 320)`}>
          <g style={anim("ks-drift", 2.4, { vars: { "--dx": h.dx } })}>
            <g transform={`scale(${h.s} 1) rotate(12)`}><Hand skin={h.skin} sleeve={h.sleeve} /></g>
          </g>
        </g>
      ))}
      <Kicker y={546} fill={d.ink}>High five</Kicker>
      <Title y={612} size={48} fill={d.ink}>You&apos;re the best</Title>
    </>
  );
}

function Bracelet({ d }: ArtProps) {
  const colors = ["#F4A6C1", d.accent, "#7BC4C4", "#FFC53D", "#FF8A65"];
  return (
    <>
      <Frame color={d.ink} />
      <Twinkles color={d.accent} pts={[{ x: 92, y: 140, r: 11 }, { x: 410, y: 180, r: 9 }, { x: 400, y: 440, r: 12 }, { x: 100, y: 430, r: 8 }]} />
      <g style={anim("ks-spin", 30, { ...pivot(250, 300), ease: "linear" })}>
        <circle cx={250} cy={300} r={120} fill="none" stroke="#F4A6C1" strokeWidth={8} />
        <circle cx={250} cy={300} r={120} fill="none" stroke="#7BC4C4" strokeWidth={8} strokeDasharray="10 10" />
        {Array.from({ length: 18 }, (_, i) => {
          const p = ray(250, 300, i * 20, 120);
          const heart = i % 6 === 0;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={heart ? 16 : 13} fill={heart ? "#fff" : colors[i % 5]} stroke={heart ? d.accent : "none"} strokeWidth={2} />
              {heart ? <path d={HEART} transform={`translate(${p.x} ${p.y + 2}) scale(0.5)`} fill={d.accent} /> : <circle cx={r1(p.x - 4)} cy={r1(p.y - 4)} r={3.5} fill="#fff" opacity={0.5} />}
            </g>
          );
        })}
      </g>
      <Kicker y={530} fill={d.ink}>You &amp; me</Kicker>
      <Title y={598} size={46} fill={d.ink}>Friends forever</Title>
    </>
  );
}

function RoadTrip({ d }: ArtProps) {
  return (
    <>
      <clipPath id="roadtrip-clip"><rect x={0} y={0} width={W} height={H} /></clipPath>
      <circle cx={390} cy={140} r={62} fill="#FFC53D" style={anim("ks-glow", 4, { vars: { "--lo": "0.15", "--hi": "0.35" } })} />
      <circle cx={390} cy={140} r={40} fill="#FFC53D" />
      <g style={anim("ks-drift", 12, { vars: { "--dx": "30px" } })}><Cloud x={130} y={150} s={0.8} fill="#fff" /></g>
      <g style={anim("ks-drift", 14, { delay: -6, vars: { "--dx": "-26px" } })}><Cloud x={300} y={240} s={0.6} fill="#fff" /></g>
      <g clipPath="url(#roadtrip-clip)">
        <path d="M-60 470 C 40 360, 140 360, 230 430 C 320 350, 440 350, 560 450 V490 H-60 Z" fill="#9CC5A1" style={anim("ks-drift", 12, { vars: { "--dx": "-24px" } })} />
        <path d="M-60 480 C 60 410, 180 420, 280 460 C 380 400, 480 410, 560 470 V490 H-60 Z" fill="#6FA77A" style={anim("ks-drift", 9, { vars: { "--dx": "18px" } })} />
        <rect x={0} y={485} width={W} height={60} fill="#4A4A5E" />
        <line x1={-40} y1={515} x2={540} y2={515} stroke="#F4E3B5" strokeWidth={4} strokeDasharray="24 16" style={anim("ks-family-road", 0.8, { ease: "linear" })} />
      </g>
      <g style={anim("ks-family-bounce", 0.9)}>
        <rect x={196} y={372} width={6} height={10} rx={2} fill="#5B5B6E" />
        <rect x={278} y={372} width={6} height={10} rx={2} fill="#5B5B6E" />
        <ellipse cx={240} cy={371} rx={82} ry={8} fill="#3A86FF" />
        <rect x={150} y={380} width={200} height={82} rx={22} fill={d.accent} />
        <path d="M150 420 V402 Q150 380 172 380 H300 Q330 380 345 410 L350 420 Z" fill="#FFF8EC" />
        <path d="M300 390 H312 Q328 390 336 412 H300 Z" fill="#9FD3E6" />
        <rect x={168} y={390} width={50} height={22} rx={5} fill="#9FD3E6" />
        <rect x={230} y={390} width={58} height={22} rx={5} fill="#9FD3E6" />
        <line x1={294} y1={424} x2={294} y2={456} stroke="#00000033" strokeWidth={2} />
        <circle cx={344} cy={440} r={6} fill="#FFE08A" />
      </g>
      {[195, 305].map((x) => (
        <g key={x}>
          <circle cx={x} cy={466} r={20} fill="#2B2A3A" />
          <g style={anim("ks-spin", 0.8, { ease: "linear" })}>
            <circle cx={x} cy={466} r={9} fill="#D5D3DC" />
            <path d={`M${x - 9} 466 H${x + 9} M${x} 457 V475`} stroke="#2B2A3A" strokeWidth={2.5} />
          </g>
        </g>
      ))}
      <Kicker y={590} fill={d.ink}>Let&apos;s go</Kicker>
      <Title y={642} size={40} fill={d.ink}>Adventures with you</Title>
    </>
  );
}

function Sunflower({ d }: ArtProps) {
  const seeds = scatter(30, 5).map((p) => ray(250, 300, p.x * 0.72, Math.sqrt(p.q) * 38));
  return (
    <>
      <Kicker y={92} fill={d.ink}>Hey sunshine</Kicker>
      <Title y={150} size={40} fill={d.ink}>You brighten my day</Title>
      <g style={anim("ks-sway", 6, { ...pivot(250, 650), vars: { "--amp": "2.5deg" } })}>
        <path d="M250 650 C 242 560, 258 460, 250 350" stroke="#5E8C3A" strokeWidth={9} strokeLinecap="round" fill="none" />
        <path d={LEAF} transform="translate(214 540) rotate(-55) scale(1.6 2.2)" fill="#5E8C3A" />
        <path d={LEAF} transform="translate(286 480) rotate(55) scale(1.5 2)" fill="#6FA046" />
        <circle cx={250} cy={300} r={124} fill={d.accent} style={anim("ks-glow", 3, { vars: { "--lo": "0.12", "--hi": "0.35" } })} />
        <g style={anim("ks-family-pulse", 3, { origin: "250px 300px", box: "view-box" })}>
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse key={i} cx={250} cy={236} rx={15} ry={34} fill={d.accent} transform={`rotate(${i * 22.5} 250 300)`} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <ellipse key={i} cx={250} cy={244} rx={13} ry={28} fill="#FFCE3A" transform={`rotate(${i * 22.5 + 11.25} 250 300)`} />
          ))}
        </g>
        <circle cx={250} cy={300} r={48} fill="#6B3E1F" />
        {seeds.map((s, i) => <circle key={i} cx={s.x} cy={s.y} r={2.6} fill="#3D2210" />)}
      </g>
      <Twinkles color={d.accent} pts={[{ x: 96, y: 250, r: 10 }, { x: 404, y: 220, r: 12 }, { x: 390, y: 420, r: 8 }]} />
    </>
  );
}

export const ART: ArtMap = {
  mom: Mom,
  dad: Dad,
  knitting: Knitting,
  familytree: FamilyTree,
  twopeas: TwoPeas,
  cheers: Cheers,
  paperplane: PaperPlane,
  highfive: HighFive,
  bracelet: Bracelet,
  roadtrip: RoadTrip,
  sunflower: Sunflower,
};
