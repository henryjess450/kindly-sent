import type { GiftBrand } from "@/config/gifts";
import { money } from "@/config/pricing";

/** A gift card drawn like the plastic thing: brand, amount, chip of colour. No logos. */
export function GiftTile({ brand, amountCents, width = 260, from }: { brand: GiftBrand; amountCents?: number; width?: number | string; from?: string }) {
  const w = typeof width === "number" ? `${width}px` : width;
  return (
    <div className="gift-tile" style={{ width: w, background: brand.bg, color: brand.fg, ["--gw" as string]: w }}>
      <div className="gift-sheen" />
      <div className="gift-top">
        <span className="gift-brand">{brand.name}</span>
        <span className="gift-kind">Gift card</span>
      </div>
      <div className="gift-amount">{amountCents ? money(amountCents) : " "}</div>
      {from && <div className="gift-from">From {from}</div>}
      <style>{`
        .gift-tile { position: relative; aspect-ratio: 1.586; border-radius: calc(var(--gw) * 0.06); padding: calc(var(--gw) * 0.07); display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,.12), 0 18px 40px rgba(0,0,0,.22); font-family: var(--font-display); }
        .gift-top { display: flex; justify-content: space-between; align-items: baseline; gap: 8px; }
        .gift-brand { font-weight: 800; font-size: calc(var(--gw) * 0.075); letter-spacing: -0.02em; line-height: 1.1; }
        .gift-kind { font-size: calc(var(--gw) * 0.045); font-weight: 600; opacity: .7; text-transform: uppercase; letter-spacing: .12em; white-space: nowrap; }
        .gift-amount { font-weight: 800; font-size: calc(var(--gw) * 0.17); letter-spacing: -0.04em; line-height: 1; }
        .gift-from { font-size: calc(var(--gw) * 0.05); opacity: .75; font-weight: 600; }
        .gift-sheen { position: absolute; inset: -40% -60%; background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,.22) 50%, transparent 60%); transform: translateX(-60%); animation: gift-sheen 1.4s .4s cubic-bezier(.22,1,.36,1) both; pointer-events: none; }
        @keyframes gift-sheen { to { transform: translateX(60%); } }
        @media (prefers-reduced-motion: reduce) { .gift-sheen { display: none; } }
      `}</style>
    </div>
  );
}
