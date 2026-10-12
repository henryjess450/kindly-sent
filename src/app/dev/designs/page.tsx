import { notFound } from "next/navigation";
import { CardArt } from "@/components/CardArt";
import { DESIGNS } from "@/lib/designs";

// Development only: every design at once.
export default function Designs() {
  if (process.env.NODE_ENV === "production") notFound();
  return (
    <main style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 12, padding: 12, background: "#e8e8ed" }}>
      {DESIGNS.map((d) => (
        <div key={d.id} style={{ aspectRatio: "5/7", borderRadius: 4, overflow: "hidden" }}>
          <CardArt design={d} />
        </div>
      ))}
    </main>
  );
}
