"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import type { Media } from "@/lib/notes";

type Item = { id: string; title: string; kind: "gif" | "sticker"; preview: string; pw: number; ph: number; src: string; w: number; h: number };

const SUGGESTIONS = ["happy birthday", "congrats", "thank you", "love you", "miss you", "cheers", "dance", "hug"];

/** Search GIPHY for GIFs and stickers. Picking one hands it back as note media. */
export function GiphyPicker({ onPick, onClose }: { onPick: (m: Media) => void; onClose: () => void }) {
  const [type, setType] = useState<"gifs" | "stickers">("gifs");
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [more, setMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const seq = useRef(0);
  const input = useRef<HTMLInputElement>(null);

  async function load(offset: number) {
    const n = ++seq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/giphy?type=${type}&q=${encodeURIComponent(q)}&offset=${offset}`);
      const json = await res.json();
      if (n !== seq.current) return;
      if (!res.ok) throw new Error(json.error ?? "GIFs aren't loading.");
      setError("");
      setItems((prev) => (offset ? [...prev, ...json.items] : json.items));
      setMore(json.more);
    } catch (e) {
      if (n === seq.current) setError(e instanceof Error ? e.message : "GIFs aren't loading.");
    } finally {
      if (n === seq.current) setLoading(false);
    }
  }

  useEffect(() => {
    const t = setTimeout(() => void load(0), q ? 300 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, type]);
  useEffect(() => input.current?.focus(), []);

  return (
    <motion.div className="giphy" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
      <div className="giphy-top">
        <div className="segmented giphy-tabs" role="tablist">
          {(["gifs", "stickers"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={type === t} onClick={() => setType(t)} style={{ background: type === t ? "#fff" : undefined, boxShadow: type === t ? "0 1px 3px rgba(0,0,0,.12)" : undefined }}>
              {t === "gifs" ? "GIFs" : "Stickers"}
            </button>
          ))}
        </div>
        <button className="btn btn-ghost btn-small" onClick={onClose}>Done</button>
      </div>
      <input ref={input} className="input" type="search" placeholder={`Search ${type === "gifs" ? "GIFs" : "stickers"}`} value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="chips" style={{ marginTop: 10 }}>
        {SUGGESTIONS.map((s) => (
          <button key={s} className="chip" aria-pressed={q === s} onClick={() => setQ(q === s ? "" : s)}>{s}</button>
        ))}
      </div>
      {error ? (
        <p className="hint" style={{ padding: "24px 4px" }}>{error}</p>
      ) : (
        <div className="giphy-grid">
          {items.map((it) => (
            <button key={it.id} className={`giphy-item${it.kind === "sticker" ? " is-sticker" : ""}`} onClick={() => onPick({ kind: it.kind, src: it.src, w: it.w, h: it.h, id: it.id, title: it.title })} aria-label={it.title || "GIF"}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.preview} alt="" width={it.pw} height={it.ph} loading="lazy" />
            </button>
          ))}
        </div>
      )}
      {more && !error && (
        <button className="btn btn-ghost btn-small" style={{ width: "100%", marginTop: 8 }} disabled={loading} onClick={() => load(items.length)}>
          {loading ? "Loading..." : "More"}
        </button>
      )}
      <p className="giphy-credit">Powered by GIPHY</p>
      <style>{`
        .giphy { background: var(--surface); border-radius: 18px; padding: 14px; box-shadow: inset 0 0 0 1px var(--line-soft); }
        .giphy-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; gap: 10px; }
        .giphy-tabs button { padding: 6px 14px; }
        .giphy-grid { columns: 3 110px; column-gap: 6px; margin-top: 12px; max-height: 340px; overflow-y: auto; border-radius: 10px; }
        .giphy-item { display: block; width: 100%; border: 0; padding: 0; margin: 0 0 6px; background: var(--bg-alt); border-radius: 8px; overflow: hidden; cursor: pointer; break-inside: avoid; transition: transform .2s var(--ease-out); }
        .giphy-item.is-sticker { background: repeating-conic-gradient(#f3f3f5 0 25%, #fff 0 50%) 0 / 16px 16px; }
        .giphy-item:hover { transform: scale(.97); }
        .giphy-item img { width: 100%; height: auto; display: block; }
        .giphy-credit { margin: 10px 0 0; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: var(--ink-4); text-align: right; }
      `}</style>
    </motion.div>
  );
}
