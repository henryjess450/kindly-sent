import { notFound } from "next/navigation";
import { CardArt } from "@/components/CardArt";
import { DESIGNS } from "@/lib/designs";

// Development only: every design at once, or a slice with ?from=24&n=24.
export default async function Designs({ searchParams }: { searchParams: Promise<{ from?: string; n?: string; cols?: string; ids?: string }> }) {
  if (process.env.NODE_ENV === "production") notFound();
  const { from = "0", n = "200", cols = "6", ids } = await searchParams;
  const shown = ids ? ids.split(",").map((id) => DESIGNS.find((d) => d.id === id)!).filter(Boolean) : DESIGNS.slice(Number(from), Number(from) + Number(n));
  return (
    <main style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, padding: 10, background: "#e8e8ed" }}>
      {shown.map((d) => (
        <figure key={d.id} style={{ margin: 0 }}>
          <div style={{ aspectRatio: "5/7", borderRadius: 4, overflow: "hidden" }}>
            <CardArt design={d} />
          </div>
          <figcaption style={{ fontSize: 11, padding: "3px 2px" }}>{d.id} · {d.occasion}</figcaption>
        </figure>
      ))}
    </main>
  );
}
