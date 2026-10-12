"use client";

import { motion } from "motion/react";
import { getFont, getInk } from "@/lib/designs";
import { getPaper, linkHost, tiltFor, type Media } from "@/lib/notes";

export type NoteData = {
  id: string;
  name: string;
  message: string;
  font: string;
  ink: string;
  paper: string;
  media: Media[];
  linkUrl: string | null;
  linkLabel: string | null;
  hidden?: boolean;
};

function MediaGrid({ media }: { media: Media[] }) {
  if (media.length === 0) return null;
  return (
    <div className={`note-media n${Math.min(media.length, 4)}`}>
      {media.map((m) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={m.src}
          src={m.src}
          alt={m.kind === "photo" ? "Photo" : (("title" in m && m.title) || "GIF")}
          width={m.w}
          height={m.h}
          loading="lazy"
          className={m.kind === "sticker" ? "is-sticker" : undefined}
          style={media.length === 1 ? { aspectRatio: `${m.w} / ${m.h}` } : undefined}
        />
      ))}
    </div>
  );
}

/** One signed note, pinned at a slight angle like paper on a board. */
export function Note({ note, children, still }: { note: NoteData; children?: React.ReactNode; still?: boolean }) {
  const font = getFont(note.font);
  const hand = font.id === "hand";
  const short = note.message.length < 90;
  return (
    <div className="note" style={{ background: getPaper(note.paper).color, rotate: still ? "0deg" : `${tiltFor(note.id)}deg`, opacity: note.hidden ? 0.45 : 1 }}>
      <MediaGrid media={note.media} />
      {note.message && (
        <p className="note-msg" style={{ fontFamily: font.css, color: getInk(note.ink).color, fontSize: (hand ? 25 : 17) * (short ? 1.15 : 1), lineHeight: hand ? 1.18 : 1.45 }}>
          {note.message}
        </p>
      )}
      {note.linkUrl && (
        <a className="note-link" href={note.linkUrl} target="_blank" rel="noopener noreferrer nofollow ugc">
          <span aria-hidden>↗</span>
          <span className="note-link-text">
            <strong>{note.linkLabel || linkHost(note.linkUrl)}</strong>
            {note.linkLabel && <small>{linkHost(note.linkUrl)}</small>}
          </span>
        </a>
      )}
      <div className="note-sign" style={{ fontFamily: font.css, color: getInk(note.ink).color, fontSize: hand ? 24 : 16 }}>
        {note.name}
      </div>
      {children}
    </div>
  );
}

/** The inside of a group card: every note, flowing in columns. */
export function NoteBoard({ notes, renderExtra, stagger = true }: { notes: NoteData[]; renderExtra?: (n: NoteData) => React.ReactNode; stagger?: boolean }) {
  return (
    <div className="note-board">
      {notes.map((n, i) => (
        <motion.div
          key={n.id}
          className="note-cell"
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ type: "spring", stiffness: 150, damping: 18, delay: stagger ? (i % 6) * 0.07 : 0 }}
        >
          <Note note={n}>{renderExtra?.(n)}</Note>
        </motion.div>
      ))}
      <style>{`
        .note-board { columns: 270px; column-gap: 22px; }
        .note-cell { break-inside: avoid; padding-bottom: 22px; }
        .note { position: relative; border-radius: 6px; padding: 18px 18px 16px; box-shadow: 0 1px 2px rgba(0,0,0,.06), 0 10px 26px rgba(0,0,0,.08); display: grid; gap: 12px; transition: rotate .5s var(--ease-out), box-shadow .3s; }
        .note:hover { rotate: 0deg !important; box-shadow: 0 2px 4px rgba(0,0,0,.08), 0 16px 36px rgba(0,0,0,.12); }
        .note-msg { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; }
        .note-sign { text-align: right; }
        .note-sign::before { content: "— "; opacity: .6; }
        .note-media { display: grid; gap: 6px; margin: -6px -6px 0; }
        .note-media.n2, .note-media.n4 { grid-template-columns: 1fr 1fr; }
        .note-media.n3 { grid-template-columns: 1fr 1fr; }
        .note-media.n3 img:first-child { grid-column: 1 / -1; }
        .note-media img { width: 100%; height: auto; display: block; border-radius: 4px; object-fit: cover; background: rgba(0,0,0,.04); }
        .note-media:not(.n1) img { aspect-ratio: 1; height: 100%; }
        .note-media img.is-sticker { background: none; object-fit: contain; }
        .note-link { display: flex; gap: 10px; align-items: center; padding: 10px 12px; border-radius: 10px; background: rgba(255,255,255,.7); box-shadow: inset 0 0 0 1px rgba(0,0,0,.08); text-decoration: none; font-size: 14px; min-width: 0; }
        .note-link:hover { background: #fff; }
        .note-link > span:first-child { width: 26px; height: 26px; border-radius: 50%; background: var(--ink); color: #fff; display: grid; place-items: center; flex-shrink: 0; font-size: 13px; }
        .note-link-text { display: grid; min-width: 0; }
        .note-link-text strong, .note-link-text small { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .note-link-text small { color: var(--ink-4); font-size: 12px; }
      `}</style>
    </div>
  );
}
