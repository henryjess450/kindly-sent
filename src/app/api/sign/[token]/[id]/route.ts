import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { canEditSignature, getGroupByInvite, getSignature, parseSignature, publicSignature, sigMedia, signingOpen, updateSignature } from "@/lib/groups";
import { readSignForm, storePhotos, UploadError } from "@/lib/signform";
import { deletePhoto } from "@/lib/uploads";

type Ctx = { params: Promise<{ token: string; id: string }> };

// The person who wrote a note can change or remove it until signatures are due.
async function load(req: Request, ctx: Ctx) {
  const { token, id } = await ctx.params;
  const g = getGroupByInvite(token);
  const sig = getSignature(id);
  if (!g || !sig || sig.group_id !== g.id || !canEditSignature(sig, req.headers.get("x-edit-token"))) return { error: NextResponse.json({ error: "Note not found." }, { status: 404 }) };
  if (!signingOpen(g)) return { error: NextResponse.json({ error: "Signing has closed, so notes can't be changed." }, { status: 409 }) };
  return { g, sig };
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { sig, error } = await load(req, ctx);
  if (error) return error;
  const form = await readSignForm(req);
  if (!form) return NextResponse.json({ error: "Something went wrong. Try again." }, { status: 400 });
  const parsed = parseSignature(form.data, form.files.length);
  if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const before = sigMedia(sig);
  // Only photos already on this note can be kept.
  const kept = parsed.sig.keepPhotos.filter((k) => before.some((b) => b.kind === "photo" && b.src === k.src));
  let added;
  try {
    added = await storePhotos(form.files, form.data.photoSizes);
  } catch (err) {
    return NextResponse.json({ error: err instanceof UploadError ? err.message : "That photo didn't upload. Try another." }, { status: 400 });
  }
  before.filter((b) => b.kind === "photo" && !kept.some((k) => k.src === b.src)).forEach((b) => deletePhoto(b.src));
  updateSignature(sig.id, parsed.sig, [...kept, ...added, ...parsed.sig.gifs]);
  return NextResponse.json({ signature: publicSignature(getSignature(sig.id)!) });
}

export async function DELETE(req: Request, ctx: Ctx) {
  const { sig, error } = await load(req, ctx);
  if (error) return error;
  getDb().prepare("DELETE FROM signatures WHERE id = ?").run(sig.id);
  sigMedia(sig).forEach((m) => m.kind === "photo" && deletePhoto(m.src));
  return NextResponse.json({ ok: true });
}
