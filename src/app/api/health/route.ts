import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export function GET() {
  const row = getDb().prepare("SELECT COUNT(*) AS n FROM cards WHERE status = 'scheduled'").get() as { n: number };
  return Response.json({ ok: true, scheduled: row.n });
}
