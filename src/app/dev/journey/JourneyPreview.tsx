"use client";

import { useState } from "react";
import { SendJourney } from "@/components/journey/SendJourney";
import { MailboxIntro } from "@/components/journey/MailboxIntro";

export function JourneyPreview() {
  const [which, setWhich] = useState<"send" | "receive" | null>(null);
  const [run, setRun] = useState(0);
  const play = (w: "send" | "receive") => { setWhich(w); setRun((n) => n + 1); };
  return (
    <main>
      <div style={{ display: "flex", gap: 8, padding: 12, position: "relative", zIndex: 50 }}>
        <button className="btn btn-primary btn-small" onClick={() => play("send")}>Play send</button>
        <button className="btn btn-primary btn-small" onClick={() => play("receive")}>Play receive</button>
      </div>
      {which === "send" && <SendJourney key={run} recipientName="Mom" seal="#E5484D" onDone={() => setWhich(null)} />}
      {which === "receive" && <div style={{ position: "relative", height: "calc(100vh - 60px)" }}><MailboxIntro key={run} recipientName="Mom" seal="#E5484D" onDone={() => setWhich(null)} /></div>}
    </main>
  );
}
