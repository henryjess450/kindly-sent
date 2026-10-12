import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

// Development only: every email the site would have sent.
export default function Outbox() {
  if (process.env.NODE_ENV === "production") notFound();
  const mails = getDb().prepare("SELECT * FROM outbox ORDER BY id DESC LIMIT 30").all() as { id: number; to_addr: string; subject: string; html: string; created_at: number }[];
  return (
    <main style={{ padding: 32, display: "grid", gap: 28, background: "#eee", minHeight: "100vh" }}>
      <h1 className="display" style={{ fontSize: 32 }}>Dev outbox ({mails.length})</h1>
      {mails.map((m) => (
        <section key={m.id} style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "12px 16px", fontSize: 14, borderBottom: "1px solid #ddd" }}>
            <strong>{m.subject}</strong> → {m.to_addr} · {new Date(m.created_at).toLocaleString()}
          </div>
          <iframe srcDoc={m.html} style={{ width: "100%", height: 520, border: 0 }} title={m.subject} />
        </section>
      ))}
    </main>
  );
}
