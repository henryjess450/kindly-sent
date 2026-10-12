import { readPhoto } from "@/lib/uploads";

// Photos added to group cards. Names are random and never change, so cache hard.
export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const file = readPhoto((await params).name);
  if (!file) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(file.body), {
    headers: {
      "content-type": file.type,
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'",
    },
  });
}
