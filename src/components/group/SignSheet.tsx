"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FONTS, INKS } from "@/lib/designs";
import { noteLimits, PAPERS, getPaper, type Media } from "@/lib/notes";
import { GiphyPicker } from "./GiphyPicker";
import { Note, type NoteData } from "./NoteBoard";

type Photo = { src: string; w: number; h: number; blob?: Blob };
const NAME_KEY = "ks-signer-name";

/** Shrinks a photo in the browser (longest side 1600px) so uploads stay small and EXIF is dropped. GIFs keep their animation. */
async function preparePhoto(file: File): Promise<Photo> {
  if (file.type === "image/gif" && file.size <= noteLimits.photoBytes) {
    const bmp = await createImageBitmap(file);
    return { src: URL.createObjectURL(file), w: bmp.width, h: bmp.height, blob: file };
  }
  const bmp = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.86));
  if (!blob) throw new Error("That photo couldn't be read.");
  return { src: URL.createObjectURL(blob), w, h, blob };
}

export type Saved = { note: NoteData; editToken: string };

export function SignSheet({
  inviteToken,
  inviteId,
  recipientName,
  existing,
  onSaved,
  onDeleted,
  onClose,
}: {
  inviteToken: string;
  inviteId: string | null;
  recipientName: string;
  existing?: Saved;
  onSaved: (s: Saved) => void;
  onDeleted: (id: string) => void;
  onClose: () => void;
}) {
  const e = existing?.note;
  const [name, setName] = useState(e?.name ?? "");
  const [message, setMessage] = useState(e?.message ?? "");
  const [font, setFont] = useState(e?.font ?? "hand");
  const [ink, setInk] = useState(e?.ink ?? "black");
  const [paper, setPaper] = useState(e?.paper ?? PAPERS[Math.floor(Math.random() * PAPERS.length)].id);
  const [photos, setPhotos] = useState<Photo[]>(() => (e?.media ?? []).filter((m) => m.kind === "photo").map((m) => ({ src: m.src, w: m.w, h: m.h })));
  const [gifs, setGifs] = useState<Media[]>(() => (e?.media ?? []).filter((m) => m.kind !== "photo"));
  const [linkUrl, setLinkUrl] = useState(e?.linkUrl ?? "");
  const [linkLabel, setLinkLabel] = useState(e?.linkLabel ?? "");
  const [showLink, setShowLink] = useState(!!e?.linkUrl);
  const [showGiphy, setShowGiphy] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const mediaCount = photos.length + gifs.length;
  const full = mediaCount >= noteLimits.media;

  useEffect(() => {
    if (!e) {
      try {
        setName(localStorage.getItem(NAME_KEY) ?? "");
      } catch {}
    }
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (ev: KeyboardEvent) => ev.key === "Escape" && onClose();
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    setError("");
    const room = noteLimits.media - mediaCount;
    for (const f of Array.from(files).slice(0, room)) {
      try {
        const p = await preparePhoto(f);
        setPhotos((list) => [...list, p]);
      } catch {
        setError("That photo couldn't be read. Try a JPG or PNG.");
      }
    }
    if (fileInput.current) fileInput.current.value = "";
  }

  const media: Media[] = [...photos.map((p) => ({ kind: "photo" as const, src: p.src, w: p.w, h: p.h })), ...gifs];
  const preview: NoteData = { id: e?.id ?? "new", name: name || "Your name", message: message || (mediaCount ? "" : "Your message appears here."), font, ink, paper, media, linkUrl: showLink && linkUrl ? (linkUrl.startsWith("http") ? linkUrl : `https://${linkUrl}`) : null, linkLabel: linkLabel || null };

  async function save() {
    if (busy) return;
    if (!name.trim()) return setError("Add your name so they know who it's from.");
    if (!message.trim() && mediaCount === 0) return setError("Write a message or add a photo or GIF.");
    setBusy(true);
    setError("");
    try {
      const fresh = photos.filter((p) => p.blob);
      const form = new FormData();
      form.set(
        "data",
        JSON.stringify({
          name, message, font, ink, paper, gifs, inviteId,
          keepPhotos: photos.filter((p) => !p.blob).map((p) => ({ src: p.src, w: p.w, h: p.h })),
          photoSizes: fresh.map((p) => ({ w: p.w, h: p.h })),
          linkUrl: showLink ? linkUrl : "",
          linkLabel: showLink ? linkLabel : "",
        }),
      );
      fresh.forEach((p, i) => form.append("photo", p.blob!, `photo-${i}.${p.blob!.type === "image/gif" ? "gif" : "jpg"}`));
      const res = await fetch(existing ? `/api/sign/${inviteToken}/${existing.note.id}` : `/api/sign/${inviteToken}`, {
        method: existing ? "PATCH" : "POST",
        headers: existing ? { "x-edit-token": existing.editToken } : undefined,
        body: form,
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? "That didn't save. Try again.");
      try {
        localStorage.setItem(NAME_KEY, name.trim());
      } catch {}
      onSaved({ note: json.signature, editToken: existing?.editToken ?? json.editToken });
    } catch (err) {
      setError(err instanceof Error ? err.message : "That didn't save.");
      setBusy(false);
    }
  }

  async function remove() {
    if (!existing || !confirm("Take your note off the card?")) return;
    setBusy(true);
    const res = await fetch(`/api/sign/${inviteToken}/${existing.note.id}`, { method: "DELETE", headers: { "x-edit-token": existing.editToken } });
    if (res.ok) onDeleted(existing.note.id);
    else {
      setError((await res.json().catch(() => ({}))).error ?? "That didn't work.");
      setBusy(false);
    }
  }

  const paperColor = getPaper(paper).color;
  const fontCss = FONTS.find((f) => f.id === font)?.css;

  return (
    <motion.div className="sheet-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Sign the card"
        initial={{ y: 60, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 28 }}
        onClick={(ev) => ev.stopPropagation()}
      >
        <div className="sheet-preview">
          <p className="eyebrow" style={{ color: "var(--ink-3)" }}>Preview</p>
          <div style={{ width: "100%", maxWidth: 300 }}>
            <Note note={preview} still />
          </div>
        </div>

        <div className="sheet-form">
          <div className="sheet-head">
            <h2 className="display" style={{ fontSize: 28 }}>{existing ? "Edit your note" : `Sign ${recipientName}'s card`}</h2>
            <button className="sheet-x" onClick={onClose} aria-label="Close">×</button>
          </div>

          <textarea
            className="textarea sheet-msg"
            placeholder={`Write something for ${recipientName}...`}
            value={message}
            maxLength={noteLimits.messageChars}
            onChange={(ev) => setMessage(ev.target.value)}
            style={{ background: paperColor, fontFamily: fontCss, fontSize: font === "hand" ? 24 : 17, color: INKS.find((k) => k.id === ink)?.color }}
            autoFocus={!existing}
          />

          <div className="sheet-style">
            <div className="font-mini">
              {FONTS.map((f) => (
                <button key={f.id} aria-pressed={font === f.id} onClick={() => setFont(f.id)} style={{ fontFamily: f.css }} title={f.name}>
                  <span style={{ fontSize: f.id === "hand" ? 20 : 15 }}>Aa</span>
                </button>
              ))}
            </div>
            <div className="dots" aria-label="Ink">
              {INKS.map((k) => (
                <button key={k.id} className="dot-btn" aria-pressed={ink === k.id} aria-label={`${k.name} ink`} title={`${k.name} ink`} onClick={() => setInk(k.id)} style={{ background: k.color }} />
              ))}
            </div>
            <div className="dots" aria-label="Paper">
              {PAPERS.map((p) => (
                <button key={p.id} className="dot-btn" aria-pressed={paper === p.id} aria-label={`${p.name} paper`} title={`${p.name} paper`} onClick={() => setPaper(p.id)} style={{ background: p.color }} />
              ))}
            </div>
          </div>

          {mediaCount > 0 && (
            <div className="attach-row">
              {photos.map((p, i) => (
                <div key={p.src} className="attach">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.src} alt="" />
                  <button aria-label="Remove photo" onClick={() => setPhotos((l) => l.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
              {gifs.map((g, i) => (
                <div key={g.src} className="attach">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.src} alt="" />
                  <button aria-label="Remove GIF" onClick={() => setGifs((l) => l.filter((_, j) => j !== i))}>×</button>
                </div>
              ))}
            </div>
          )}

          <div className="add-row">
            <input ref={fileInput} type="file" accept="image/*" multiple hidden onChange={(ev) => addFiles(ev.target.files)} />
            <button className="add-btn" disabled={full} onClick={() => fileInput.current?.click()}><span>📷</span>Photo</button>
            <button className="add-btn" disabled={full} onClick={() => setShowGiphy((v) => !v)} aria-pressed={showGiphy}><span>✨</span>GIF</button>
            <button className="add-btn" onClick={() => setShowLink((v) => !v)} aria-pressed={showLink}><span>🔗</span>Link</button>
          </div>
          {full && <p className="hint" style={{ margin: "-6px 0 0" }}>That&apos;s the most for one note ({noteLimits.media}).</p>}

          <AnimatePresence>
            {showGiphy && !full && <GiphyPicker key="giphy" onClose={() => setShowGiphy(false)} onPick={(m) => { setGifs((l) => [...l, m]); setShowGiphy(false); }} />}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {showLink && (
              <motion.div key="link" className="two-col" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <div className="field">
                  <label htmlFor="lu">Link</label>
                  <input id="lu" className="input" inputMode="url" placeholder="youtube.com/watch?v=..." value={linkUrl} onChange={(ev) => setLinkUrl(ev.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="ll">Label (optional)</label>
                  <input id="ll" className="input" placeholder="Our song" maxLength={60} value={linkLabel} onChange={(ev) => setLinkLabel(ev.target.value)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="field">
            <label htmlFor="nm">Your name</label>
            <input id="nm" className="input" placeholder="Sam" maxLength={noteLimits.nameChars} value={name} onChange={(ev) => setName(ev.target.value)} />
          </div>

          {error && <p className="error" role="alert" style={{ margin: 0 }}>{error}</p>}

          <div className="sheet-actions">
            {existing ? <button className="btn btn-ghost" onClick={remove} disabled={busy}>Remove</button> : <button className="btn btn-ghost" onClick={onClose}>Cancel</button>}
            <button className="btn btn-brand" onClick={save} disabled={busy}>{busy ? "Saving..." : existing ? "Save changes" : "Add to the card"}</button>
          </div>
        </div>

        <style>{`
          .sheet-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(20,20,24,.42); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: grid; place-items: center; padding: 24px; }
          .sheet { width: 100%; max-width: 940px; max-height: calc(100dvh - 48px); background: var(--bg); border-radius: 28px; box-shadow: 0 30px 80px rgba(0,0,0,.3); display: grid; grid-template-columns: 340px 1fr; overflow: hidden; }
          .sheet-preview { background: var(--bg-alt); padding: 32px 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow-y: auto; }
          .sheet-form { padding: 28px 30px; display: grid; gap: 16px; overflow-y: auto; align-content: start; }
          .sheet-head { display: flex; justify-content: space-between; align-items: start; gap: 12px; }
          .sheet-x { border: 0; background: rgba(0,0,0,.06); width: 32px; height: 32px; border-radius: 50%; font-size: 20px; line-height: 1; cursor: pointer; flex-shrink: 0; }
          .sheet-msg { min-height: 150px; border-color: transparent; box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); }
          .sheet-style { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: space-between; }
          .font-mini { display: flex; gap: 4px; background: rgba(0,0,0,.05); border-radius: 12px; padding: 3px; }
          .font-mini button { border: 0; background: none; width: 40px; height: 34px; border-radius: 9px; cursor: pointer; }
          .font-mini button[aria-pressed="true"] { background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.14); }
          .dots { display: flex; gap: 6px; }
          .dot-btn { width: 24px; height: 24px; border-radius: 50%; border: 0; cursor: pointer; box-shadow: inset 0 0 0 1px rgba(0,0,0,.14); transition: transform .2s var(--ease-out); }
          .dot-btn:hover { transform: scale(1.12); }
          .dot-btn[aria-pressed="true"] { box-shadow: inset 0 0 0 1px rgba(0,0,0,.14), 0 0 0 2px var(--bg), 0 0 0 4px var(--ink); }
          .attach-row { display: flex; gap: 8px; flex-wrap: wrap; }
          .attach { position: relative; width: 64px; height: 64px; border-radius: 10px; overflow: hidden; background: var(--bg-alt); }
          .attach img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .attach button { position: absolute; top: 3px; right: 3px; width: 20px; height: 20px; border-radius: 50%; border: 0; background: rgba(0,0,0,.6); color: #fff; font-size: 14px; line-height: 1; cursor: pointer; }
          .add-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
          .add-btn { border: 1px solid var(--line); background: var(--surface); border-radius: 14px; padding: 10px 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; gap: 8px; align-items: center; justify-content: center; transition: all .2s; }
          .add-btn:hover { border-color: var(--ink-4); }
          .add-btn[aria-pressed="true"] { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
          .add-btn[disabled] { opacity: .4; pointer-events: none; }
          .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .sheet-actions { display: flex; justify-content: space-between; gap: 12px; padding-top: 4px; }
          @media (max-width: 780px) {
            .sheet-backdrop { padding: 0; align-items: end; }
            .sheet { grid-template-columns: 1fr; border-radius: 24px 24px 0 0; max-height: 94dvh; }
            .sheet-preview { display: none; }
            .sheet-form { padding: 22px 18px calc(22px + env(safe-area-inset-bottom)); }
            .two-col { grid-template-columns: 1fr; }
          }
        `}</style>
      </motion.div>
    </motion.div>
  );
}
