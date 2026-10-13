import { notFound } from "next/navigation";
import { LampPanel } from "@/components/lamp/LampPanel";
import { LAMP_DEFAULTS } from "@/lib/lamp/server";

// Development only: the admin lamp page with sample status, for checking the ring previews.
export default function LampPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const at = Date.now();
  return (
    <main className="wrap" style={{ padding: "48px 22px 96px", maxWidth: 1100 }}>
      <LampPanel
        preview
        settings={{ ...LAMP_DEFAULTS, idle: "glow" }}
        status={{ online: true, agoMin: 0, rssi: -58, version: "2", quietNow: false }}
        plays={[
          { id: 4, anim: "heartbeat", reason: "opened", cents: null, at: at - 4 * 60_000 },
          { id: 3, anim: "fireworks", reason: "group", cents: 150, at: at - 52 * 60_000 },
          { id: 2, anim: "payment", reason: "group", cents: 150, at: at - 52 * 60_000 },
          { id: 1, anim: "confetti", reason: "group", cents: 150, at: at - 52 * 60_000 },
        ]}
        keyMadeAt={at - 3600_000}
        site="https://kindlysent.ca"
      />
    </main>
  );
}
