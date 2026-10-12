import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getGroupByInvite, insertSignature, parseSignature, publicSignature, signingOpen } from "@/lib/groups";
import { noteLimits } from "@/lib/notes";
import { clientIp, limited } from "@/lib/ratelimit";
import { readSignForm, storePhotos, UploadError } from "@/lib/signform";

// Anyone with the invite link can add a note until signatures are due.
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  const g = getGroupByInvite((await params).token);
  if (!g || g.status === "draft" || g.status === "canceled") return NextResponse.json({ error: "This card isn't here." }, { status: 404 });
  if (!signingOpen(g)) return NextResponse.json({ error: "Signing has closed for this card." }, { status: 409 });
  if (limited(`sign:${clientIp(req)}`, 30, 3600e3)) return NextResponse.json({ error: "That's a lot of notes. Try again in a little while." }, { status: 429 });
  const db = getDb();
  const total = (db.prepare("SELECT COUNT(*) AS n FROM signatures WHERE group_id = ?").get(g.id) as { n: number }).n;
  if (total >= noteLimits.signaturesPerCard) return NextResponse.json({ error: "This card is full." }, { status: 409 });

  const form = await readSignForm(req);
  if (!form) return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });
  const parsed = parseSignature({ ...form.data, keepPhotos: [] }, form.files.length);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

  let photos;
  try {
    photos = await storePhotos(form.files, form.data.photoSizes);
  } catch (err) {
    return NextResponse.json({ error: err instanceof UploadError ? err.message : "That photo didn't upload. Try another." }, { status: 400 });
  }
  const inviteId = typeof form.data.inviteId === "string" && db.prepare("SELECT 1 FROM group_invites WHERE id = ? AND group_id = ?").get(form.data.inviteId, g.id) ? form.data.inviteId : null;
  const { sig, editToken } = insertSignature(g.id, parsed.sig, photos, inviteId);
  return NextResponse.json({ signature: publicSignature(sig), editToken });
}
