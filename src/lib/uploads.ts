import { mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { newId } from "./ids";
import { isPhotoSrc, noteLimits } from "./notes";

// Photos on group cards live next to the database (DATA_DIR/uploads), so the
// Docker volume keeps them. The browser shrinks them before upload.

const dir = () => path.resolve(/*turbopackIgnore: true*/ process.env.DATA_DIR ?? "./data", "uploads");

const TYPES = { jpg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif" } as const;
type Ext = keyof typeof TYPES;

/** Trust the file's first bytes, not its name or the browser's claim. */
function sniff(b: Buffer): Ext | null {
  if (b.length < 12) return null;
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "jpg";
  if (b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") return "webp";
  if (b.toString("ascii", 0, 4) === "GIF8") return "gif";
  return null;
}

export class UploadError extends Error {}

/** Saves a photo and returns the path the page shows it from. */
export async function savePhoto(file: File): Promise<string> {
  if (file.size > noteLimits.photoBytes) throw new UploadError("That photo is too big. Try one under 5 MB.");
  const buf = Buffer.from(await file.arrayBuffer());
  const ext = sniff(buf);
  if (!ext) throw new UploadError("That file isn't a photo we can show. Try a JPG or PNG.");
  mkdirSync(dir(), { recursive: true });
  const name = `${newId()}.${ext}`;
  writeFileSync(path.join(dir(), name), buf);
  return `/api/media/${name}`;
}

export function readPhoto(name: string): { body: Buffer; type: string } | null {
  if (!/^[\w-]+\.(jpg|png|webp|gif)$/.test(name)) return null;
  try {
    return { body: readFileSync(path.join(dir(), name)), type: TYPES[name.split(".").pop() as Ext] };
  } catch {
    return null;
  }
}

export function deletePhoto(src: string) {
  if (!isPhotoSrc(src)) return;
  try {
    unlinkSync(path.join(dir(), src.split("/").pop()!));
  } catch {}
}
