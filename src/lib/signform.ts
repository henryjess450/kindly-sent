import { savePhoto, UploadError } from "./uploads";
import type { Media } from "./notes";

/**
 * Reads a note sent as multipart: a "data" JSON field, plus "photo" files
 * whose sizes come in data.photoSizes in the same order.
 */
export async function readSignForm(req: Request): Promise<{ data: Record<string, unknown>; files: File[] } | null> {
  const form = await req.formData().catch(() => null);
  if (!form) return null;
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(String(form.get("data") ?? "{}"));
  } catch {
    return null;
  }
  const files = form.getAll("photo").filter((f): f is File => typeof f === "object" && "arrayBuffer" in f);
  return { data, files };
}

export async function storePhotos(files: File[], sizes: unknown): Promise<Media[]> {
  const dims = Array.isArray(sizes) ? sizes : [];
  const out: Media[] = [];
  for (let i = 0; i < files.length; i++) {
    const d = (dims[i] ?? {}) as { w?: unknown; h?: unknown };
    const w = typeof d.w === "number" && d.w > 0 ? Math.round(d.w) : 800;
    const h = typeof d.h === "number" && d.h > 0 ? Math.round(d.h) : 800;
    out.push({ kind: "photo", src: await savePhoto(files[i]), w, h });
  }
  return out;
}

export { UploadError };
