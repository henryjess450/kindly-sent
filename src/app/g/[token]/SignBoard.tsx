"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { NoteBoard, type NoteData } from "@/components/group/NoteBoard";
import { SignSheet, type Saved } from "@/components/group/SignSheet";
import { getDesign, DESIGNS } from "@/lib/designs";
import type { PublicGroup } from "@/lib/groups";

const mineKey = (id: string) => `ks-mine-${id}`;

function timeLeft(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 864e5);
  if (d >= 2) return `${d} days left to sign`;
  const h = Math.floor(diff / 36e5);
  if (h >= 1) return `${h} hour${h === 1 ? "" : "s"} left to sign`;
  return `${Math.max(1, Math.round(diff / 6e4))} min left to sign`;
}

export function SignBoard({
  group,
  inviteToken,
  inviteId,
  organiser,
  manageUrl,
  notes: initial,
}: {
  group: PublicGroup;
  inviteToken: string;
  inviteId: string | null;
  organiser: string | null;
  manageUrl: string | null;
  notes: NoteData[];
}) {
  const design = getDesign(group.design) ?? DESIGNS[0];
  const [notes, setNotes] = useState(initial);
  const [mine, setMine] = useState<Record<string, string>>({});
  const [sheet, setSheet] = useState<null | "new" | Saved>(null);
  const [toast, setToast] = useState("");
  const [left, setLeft] = useState<string | null>(timeLeft(group.dueAt));
  const open = group.status === "collecting" && left !== null;

  useEffect(() => {
    try {
      setMine(JSON.parse(localStorage.getItem(mineKey(group.id)) ?? "{}"));
    } catch {}
    const t = setInterval(() => setLeft(timeLeft(group.dueAt)), 30_000);
    return () => clearInterval(t);
  }, [group.id, group.dueAt]);

  function remember(next: Record<string, string>) {
    setMine(next);
    try {
      localStorage.setItem(mineKey(group.id), JSON.stringify(next));
    } catch {}
  }

  function saved(s: Saved) {
    const isNew = !notes.some((n) => n.id === s.note.id);
    setNotes((list) => (isNew ? [...list, s.note] : list.map((n) => (n.id === s.note.id ? s.note : n))));
    remember({ ...mine, [s.note.id]: s.editToken });
    setSheet(null);
    setToast(isNew ? `You're on ${group.recipientName}'s card.` : "Saved.");
    setTimeout(() => setToast(""), 3200);
    if (isNew) setTimeout(() => document.getElementById(`note-${s.note.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 350);
  }

  function deleted(id: string) {
    setNotes((list) => list.filter((n) => n.id !== id));
    const next = { ...mine };
    delete next[id];
    remember(next);
    setSheet(null);
  }

  async function share() {
    const url = `${location.origin}/g/${inviteToken}`;
    const text = `Sign ${group.recipientName}'s card`;
    if (navigator.share) {
      await navigator.share({ title: text, text, url }).catch(() => {});
      return;
    }
    await navigator.clipboard.writeText(url).catch(() => {});
    setToast("Link copied. Paste it anywhere to invite more people.");
    setTimeout(() => setToast(""), 3200);
  }

  const due = new Date(group.dueAt).toLocaleString("en-CA", { timeZone: group.timezone, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" });
  const myCount = notes.filter((n) => mine[n.id]).length;

  return (
    <>
      <section className="sign-hero">
        <motion.div className="sign-cover" initial={{ opacity: 0, y: 30, rotate: -8 }} animate={{ opacity: 1, y: 0, rotate: -4 }} transition={{ type: "spring", stiffness: 120, damping: 16 }}>
          <CardArt design={design} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] }} className="sign-copy">
          <p className="eyebrow">A group card{organiser ? ` from ${organiser}` : ""}</p>
          <h1 className="display display-l">{group.headline || `For ${group.recipientName}`}</h1>
          {group.headline && <p className="lede" style={{ marginTop: 10 }}>For {group.recipientName}</p>}
          <div className="sign-stats">
            <span><strong>{notes.length}</strong> signed</span>
            <span>{open ? left : "Signing closed"}</span>
          </div>
          <div className="sign-ctas">
            {open && (
              <button className="btn btn-brand" onClick={() => setSheet("new")}>
                {myCount ? "Add another note" : "Sign the card"}
              </button>
            )}
            {open && <button className="btn btn-ghost" onClick={share}>Invite others</button>}
            {manageUrl && <Link href={manageUrl} className="btn btn-ghost">Manage</Link>}
          </div>
          {open && <p className="hint" style={{ marginTop: 14 }}>It&apos;s a surprise, so {group.recipientName} won&apos;t see this until it&apos;s delivered. Signatures are due {due}</p>}
        </motion.div>
      </section>

      <section className="wrap" style={{ paddingBottom: 96, maxWidth: 1200 }}>
        {notes.length === 0 ? (
          <motion.div className="sign-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <p className="lede">Nobody has signed yet.</p>
            {open && <button className="btn btn-primary" style={{ marginTop: 18 }} onClick={() => setSheet("new")}>Be the first</button>}
          </motion.div>
        ) : (
          <NoteBoard
            notes={notes}
            renderExtra={(n) => (
              <>
                <span id={`note-${n.id}`} style={{ position: "absolute", top: -80 }} />
                {mine[n.id] && open && (
                  <button className="note-edit" onClick={() => setSheet({ note: n, editToken: mine[n.id] })}>Edit</button>
                )}
              </>
            )}
          />
        )}
      </section>

      <AnimatePresence>
        {sheet && (
          <SignSheet
            key="sheet"
            inviteToken={inviteToken}
            inviteId={inviteId}
            recipientName={group.recipientName}
            existing={sheet === "new" ? undefined : sheet}
            onSaved={saved}
            onDeleted={deleted}
            onClose={() => setSheet(null)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sign-hero { max-width: 1080px; margin: 0 auto; padding: 110px 22px 64px; display: grid; grid-template-columns: 220px 1fr; gap: 56px; align-items: center; }
        .sign-cover { width: 220px; aspect-ratio: 5/7; border-radius: 6px; overflow: hidden; box-shadow: var(--shadow-card); }
        .sign-cover svg { width: 100%; height: 100%; display: block; }
        .sign-stats { display: flex; gap: 22px; margin-top: 22px; color: var(--ink-3); font-size: 16px; flex-wrap: wrap; }
        .sign-stats strong { color: var(--ink); }
        .sign-ctas { display: flex; gap: 10px; margin-top: 24px; flex-wrap: wrap; }
        .sign-empty { text-align: center; padding: 64px 22px; border: 1px dashed var(--line); border-radius: 22px; }
        .note-edit { position: absolute; top: 8px; right: 8px; border: 0; background: rgba(0,0,0,.72); color: #fff; font-size: 12px; font-weight: 600; padding: 5px 11px; border-radius: 980px; cursor: pointer; }
        .toast { position: fixed; bottom: 28px; left: 50%; z-index: 120; background: var(--ink); color: #fff; padding: 12px 20px; border-radius: 980px; font-size: 15px; font-weight: 500; box-shadow: 0 10px 30px rgba(0,0,0,.25); white-space: nowrap; }
        @media (max-width: 720px) {
          .sign-hero { grid-template-columns: 1fr; gap: 28px; padding-top: 84px; text-align: center; justify-items: center; }
          .sign-cover { width: 150px; }
          .sign-stats, .sign-ctas { justify-content: center; }
        }
      `}</style>
    </>
  );
}
