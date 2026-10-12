"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OpenCard } from "@/components/OpenCard";
import { NoteBoard, type NoteData } from "@/components/group/NoteBoard";
import type { Design } from "@/lib/designs";

/** "Ana, Ben and 9 others" */
function names(list: string[]) {
  const uniq = [...new Set(list.map((n) => n.trim()).filter(Boolean))];
  if (uniq.length === 0) return "";
  if (uniq.length === 1) return uniq[0];
  if (uniq.length <= 4) return `${uniq.slice(0, -1).join(", ")} and ${uniq.at(-1)}`;
  return `${uniq.slice(0, 3).join(", ")} and ${uniq.length - 3} others`;
}

/**
 * The envelope opens like a single card; inside is the headline and who
 * signed. Then everyone's notes are waiting just below.
 */
export function GroupView({
  design, token, preview, envelope, liner, headline, recipientName, notes,
}: {
  design: Design; token: string; preview: boolean; envelope: string; liner: string; headline: string; recipientName: string; notes: NoteData[];
}) {
  const [opened, setOpened] = useState(false);
  const who = names(notes.map((n) => n.name));
  const count = notes.length;
  const message = `${headline || `Happy day, ${recipientName}!`}\n\n${count ? `${count} ${count === 1 ? "person" : "people"} wrote to you. Scroll down to read every note.` : ""}`;

  return (
    <>
      <div style={{ position: "relative" }}>
        <OpenCard
          design={design}
          token={token}
          preview={preview}
          envelope={envelope}
          liner={liner}
          openUrl={`/api/gopen/${token}`}
          eyebrow={count > 1 ? `${count} people signed a card for you` : "You have a card"}
          onOpened={() => setOpened(true)}
          seal="♥"
          content={{ message, font: "hand", ink: "black", recipientName, senderName: who ? `Love, ${who}` : "With love" }}
        />
        <AnimatePresence>
          {opened && count > 0 && (
            <motion.button
              className="gv-cue"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: [0, 6, 0] }}
              transition={{ opacity: { delay: 1.2, duration: 0.5 }, y: { delay: 1.2, duration: 1.8, repeat: Infinity, ease: "easeInOut" } }}
              onClick={() => document.getElementById("notes")?.scrollIntoView({ behavior: "smooth" })}
            >
              Read everyone&apos;s notes ↓
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {opened && count > 0 && (
        <section id="notes" className="gv-notes" style={{ background: envelope }}>
          <motion.div className="gv-head" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            <h2 className="display display-l">{headline || `For ${recipientName}`}</h2>
            <p className="lede" style={{ marginTop: 12 }}>From {who}.</p>
          </motion.div>
          <div className="wrap" style={{ maxWidth: 1200 }}>
            <NoteBoard notes={notes} />
          </div>
        </section>
      )}

      <style>{`
        .gv-cue { position: absolute; bottom: 5vh; left: 50%; translate: -50% 0; z-index: 45; border: 0; background: var(--ink); color: #fff; font-weight: 600; font-size: 16px; padding: 12px 22px; border-radius: 980px; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,.2); }
        .gv-notes { padding: 72px 0 120px; }
        .gv-head { text-align: center; padding: 0 22px 48px; }
      `}</style>
    </>
  );
}
