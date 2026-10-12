"use client";

import { useState } from "react";
import { PAID_MARKS } from "@/components/confirm/PaidMarks";

const SAMPLE = { amount: "$1", accent: "#E5484D", to: "Mom", date: "Oct 25" };

export function ConfirmPreview() {
  const [runs, setRuns] = useState<Record<string, number>>({});
  const replay = (id: string) => setRuns((r) => ({ ...r, [id]: (r[id] ?? 0) + 1 }));
  return (
    <main style={{ padding: "32px 22px 80px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 className="display display-m">Payment confirmed: pick one</h1>
      <p className="lede" style={{ margin: "8px 0 28px" }}>Each plays once at the top of the confirmation page. Tap Replay to watch again.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 18 }}>
        {PAID_MARKS.map(({ id, name, Mark }, i) => (
          <section key={id} className="panel" style={{ padding: "22px 22px 26px", textAlign: "center", display: "grid", gap: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>{i + 1}. {name}</strong>
              <button className="btn btn-ghost btn-small" onClick={() => replay(id)}>Replay</button>
            </div>
            <div key={runs[id] ?? 0} style={{ minHeight: 230, display: "grid", placeItems: "center" }}>
              <Mark {...SAMPLE} />
            </div>
            <h2 className="display" style={{ fontSize: 28 }}>Sealed and scheduled.</h2>
            <p className="muted" style={{ margin: 0, fontSize: 15 }}>Mom gets it Saturday, October 25 at 9:00 a.m.</p>
          </section>
        ))}
      </div>
    </main>
  );
}
