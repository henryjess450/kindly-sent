import { NextResponse } from "next/server";
import { loginEmail } from "@/lib/emails";
import { sendMail } from "@/lib/mail";
import { createLoginLink, normalizeEmail } from "@/lib/session";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { email?: string; next?: string };
  const email = normalizeEmail(body.email);
  if (!email) return NextResponse.json({ error: "Check your email address." }, { status: 400 });
  const next = typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//") ? body.next : undefined;
  const link = createLoginLink(email, { next });
  if (!link) return NextResponse.json({ error: "We've sent a few links already. Check your inbox, or try again in an hour." }, { status: 429 });
  await sendMail({ to: email, ...loginEmail(link) });
  return NextResponse.json({ ok: true });
}
