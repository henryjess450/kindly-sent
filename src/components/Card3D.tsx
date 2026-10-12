"use client";

import { CardArt } from "./CardArt";
import { getFont, getInk, type Design } from "@/lib/designs";

export type CardContent = {
  message: string;
  font: string;
  ink?: string;
  recipientName: string;
  senderName: string;
};

/** Message size follows its length, so short notes feel big and long letters still fit. */
function sizeFor(len: number, scale: number) {
  const base = len < 90 ? 7 : len < 220 ? 5.6 : len < 450 ? 4.6 : len < 800 ? 3.8 : 3.2;
  return `${(base * scale).toFixed(2)}cqw`;
}

export function CardMessage({ design, content }: { design: Design; content: CardContent }) {
  const msg = content.message.trim();
  const font = getFont(content.font);
  const ink = getInk(content.ink ?? "black").color;
  return (
    <div className="ks-message" style={{ ["--accent" as string]: design.accent, color: ink, fontFamily: font.css }}>
      <div className="for">For {content.recipientName.trim() || "someone special"}</div>
      <div className={`body${msg ? "" : " ks-placeholder"}`} style={{ fontSize: sizeFor(msg.length, font.scale), lineHeight: font.id === "hand" ? 1.22 : 1.45 }}>
        {msg || "Your message appears here as you type."}
      </div>
      <div className="sign" style={{ fontSize: sizeFor(Math.min(msg.length, 220), font.scale) }}>
        {content.senderName.trim() || "Your name"}
      </div>
    </div>
  );
}

/**
 * A folded 5 x 7 card. "book" opens the cover to the left like a real card;
 * "flip" turns the whole card over, which suits narrow phone screens.
 */
export function Card3D({
  design,
  content,
  open,
  mode = "book",
  width,
  className,
  insideLeft,
}: {
  design: Design;
  content: CardContent;
  open: boolean;
  mode?: "book" | "flip";
  width: number | string;
  className?: string;
  /** Printed on the back of the cover, the left page when the card is open. */
  insideLeft?: React.ReactNode;
}) {
  const w = typeof width === "number" ? `${width}px` : width;
  return (
    <div className={`ks-card-stage ${className ?? ""}`} style={{ ["--w" as string]: w }}>
      <div className={`ks-card mode-${mode}${open ? " is-open" : ""}`}>
        {mode === "book" && (
          <div className="ks-card-inside">
            <CardMessage design={design} content={content} />
          </div>
        )}
        <div className="ks-card-cover">
          <div className="ks-face ks-face-front">
            <CardArt design={design} />
          </div>
          <div className="ks-face ks-face-back">
            {mode === "flip" ? (
              <CardMessage design={design} content={content} />
            ) : (
              <>
                <div className="fold" />
                {insideLeft}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
