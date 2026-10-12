"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { GroupSetup } from "@/components/group/GroupSetup";
import { NoteBoard, type NoteData } from "@/components/group/NoteBoard";
import { getDesign, DESIGNS } from "@/lib/designs";
import { money } from "@/config/pricing";
import type { AdminRow, InviteRow, PublicGroup } from "@/lib/groups";

const fmt = (ms: number, tz: string) => new Date(ms).toLocaleString("en-CA", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

function until(ms: number) {
  const diff = ms - Date.now();
  if (diff <= 0) return null;
  const d = Math.floor(diff / 864e5);
  if (d >= 2) return `${d} days`;
  const h = Math.floor(diff / 36e5);
  if (h >= 1) return `${h} hour${h === 1 ? "" : "s"}`;
  return `${Math.max(1, Math.round(diff / 6e4))} min`;
}

function statusOf(g: PublicGroup) {
  if (g.status === "sent" && g.openedAt) return { cls: "opened", label: "Opened" };
  if (g.status === "sent") return { cls: "sent", label: "Delivered" };
  if (g.status === "failed") return { cls: "failed", label: "Couldn't deliver" };
  if (g.status === "sending") return { cls: "sending", label: "Sending" };
  if (Date.now() >= g.dueAt) return { cls: "pending", label: "Signing closed" };
  return { cls: "scheduled", label: "Collecting signatures" };
}

export function GroupAdmin({
  group: initial, inviteUrl: initialInvite, viewPath, notes: initialNotes, invites: initialInvites, admins: initialAdmins, me, owner,
}: {
  group: PublicGroup; inviteUrl: string; viewPath: string; notes: NoteData[]; invites: InviteRow[]; admins: AdminRow[]; me: string; owner: boolean;
}) {
  const router = useRouter();
  const [g, setG] = useState(initial);
  const [inviteUrl, setInviteUrl] = useState(initialInvite);
  const [notes, setNotes] = useState(initialNotes);
  const [invites, setInvites] = useState(initialInvites);
  const [admins, setAdmins] = useState(initialAdmins);
  const [emails, setEmails] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [editing, setEditing] = useState(false);
  const [toast, setToast] = useState("");
  const [busy, setBusy] = useState("");
  const [, tick] = useState(0);
  const design = getDesign(g.design) ?? DESIGNS[0];
  const live = g.status === "collecting" || g.status === "failed";
  const open = g.status === "collecting" && Date.now() < g.dueAt;
  const s = statusOf(g);
  const visible = notes.filter((n) => !n.hidden).length;
  const waiting = invites.filter((i) => !i.signed).length;

  useEffect(() => {
    const t = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  function say(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3200);
  }

  async function act(action: string, extra: Record<string, unknown> = {}) {
    setBusy(action);
    try {
      const res = await fetch(`/api/groups/${g.id}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, ...extra }) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        say(json.error ?? "That didn't work.");
        return null;
      }
      return json;
    } finally {
      setBusy("");
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(inviteUrl).catch(() => {});
    say("Invite link copied.");
  }
  async function share() {
    if (navigator.share) await navigator.share({ title: `Sign ${g.recipientName}'s card`, url: inviteUrl }).catch(() => {});
    else copy();
  }
  async function resetLink() {
    if (!confirm("Make a new invite link? The old one stops working, but every message stays on the card.")) return;
    const j = await act("resetLink");
    if (j) {
      setInviteUrl(j.inviteUrl);
      say("New link ready. Share this one from now on.");
    }
  }
  async function sendInvites() {
    const j = await act("invite", { emails });
    if (j) {
      setInvites(j.invites);
      setEmails("");
      say(j.sent ? `Invited ${j.sent} ${j.sent === 1 ? "person" : "people"}.` : "They were already invited.");
    }
  }
  async function addAdmin() {
    const j = await act("addAdmin", { email: adminEmail });
    if (j) {
      setAdmins(j.admins);
      setAdminEmail("");
      say("Added. We emailed them a link.");
    }
  }
  async function removeAdmin(email: string) {
    if (!confirm(email === me ? "Stop being an admin on this card?" : `Remove ${email} as an admin?`)) return;
    const j = await act("removeAdmin", { email });
    if (j) {
      if (email === me) return router.push("/cards");
      setAdmins(j.admins);
    }
  }
  async function hide(n: NoteData) {
    const j = await act("hideSignature", { signatureId: n.id, hidden: !n.hidden });
    if (j) setNotes((l) => l.map((x) => (x.id === n.id ? { ...x, hidden: !n.hidden } : x)));
  }
  async function del(n: NoteData) {
    if (!confirm(`Delete ${n.name}'s note for good?`)) return;
    const j = await act("deleteSignature", { signatureId: n.id });
    if (j) setNotes((l) => l.filter((x) => x.id !== n.id));
  }
  async function closeSigning() {
    if (!confirm("Close signing now? Nobody else will be able to add a note.")) return;
    const j = await act("closeSigning");
    if (j) setG(j.group);
  }
  async function sendNow() {
    if (!confirm(`Deliver the card to ${g.recipientName} right now? Signing closes too.`)) return;
    const j = await act("sendNow");
    if (j) {
      setG(j.group);
      say("On its way.");
      setTimeout(() => router.refresh(), 2500);
    }
  }
  async function cancel() {
    if (!confirm(`Cancel ${g.recipientName}'s card? It won't be delivered${g.priceCents ? ` and ${money(g.priceCents)} goes back to your card` : ""}.`)) return;
    const res = await fetch(`/api/groups/${g.id}`, { method: "DELETE" });
    const json = await res.json().catch(() => ({}));
    if (res.ok) router.push("/cards");
    else say(json.error ?? "That didn't work.");
  }

  return (
    <div className="gadmin">
      <header className="ga-head">
        <motion.div className="ga-thumb" initial={{ rotate: -10, opacity: 0 }} animate={{ rotate: -4, opacity: 1 }} transition={{ type: "spring", stiffness: 140, damping: 14 }}>
          <CardArt design={design} />
        </motion.div>
        <div style={{ minWidth: 0 }}>
          <span className={`pill pill-${s.cls}`}>{s.label}</span>
          <h1 className="display display-m" style={{ margin: "10px 0 6px" }}>{g.headline || `For ${g.recipientName}`}</h1>
          <p className="muted" style={{ margin: 0 }}>
            To {g.recipientName} ({g.recipientEmail})
            {g.status === "sent" ? ` · delivered ${fmt(g.sentAt ?? g.deliverAt, g.timezone)}` : ` · delivered ${fmt(g.deliverAt, g.timezone)}`}
          </p>
          <div className="ga-links">
            <Link href={viewPath} className="btn btn-primary btn-small">{g.status === "sent" ? "View the card" : "Preview what they'll see"}</Link>
            {live && <a href={inviteUrl} className="btn btn-ghost btn-small">Signing page</a>}
          </div>
        </div>
      </header>

      <div className="ga-stats">
        <div><strong>{visible}</strong><span>signed</span></div>
        <div><strong>{invites.length}</strong><span>invited</span></div>
        <div><strong>{waiting}</strong><span>yet to sign</span></div>
        <div><strong>{open ? until(g.dueAt) : g.status === "sent" ? "Done" : "Closed"}</strong><span>{open ? `left · due ${fmt(g.dueAt, g.timezone)}` : "signing"}</span></div>
      </div>

      {live && (
        <section className="panel ga-sec">
          <h2>Invite people</h2>
          <p className="muted">Drop it in a group chat, Slack or an email. Anyone with the link can sign until {fmt(g.dueAt, g.timezone)}</p>
          <div className="invite-box">
            <span>{inviteUrl}</span>
            <button className="btn btn-primary btn-small" onClick={copy}>Copy</button>
            <button className="btn btn-ghost btn-small" onClick={share}>Share</button>
          </div>
          <button className="link-btn" onClick={resetLink} disabled={!!busy}>Make a new link</button>

          {open && (
            <div className="field" style={{ marginTop: 22 }}>
              <label htmlFor="inv">Or we&apos;ll email them</label>
              <textarea id="inv" className="textarea" style={{ minHeight: 90 }} placeholder="ana@example.com, ben@example.com" value={emails} onChange={(e) => setEmails(e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
                <span className="hint">Separate with commas or new lines. Anyone who hasn&apos;t signed gets a reminder the day before.</span>
                <button className="btn btn-primary btn-small" disabled={!emails.trim() || busy === "invite"} onClick={sendInvites}>{busy === "invite" ? "Sending..." : "Send invites"}</button>
              </div>
            </div>
          )}

          {invites.length > 0 && (
            <ul className="ga-invites">
              {invites.map((i) => (
                <li key={i.id}>
                  <span>{i.email}</span>
                  <span className={`pill pill-${i.signed ? "sent" : "sending"}`}>{i.signed ? "Signed" : "Waiting"}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="ga-sec" style={{ padding: "8px 0" }}>
        <div className="ga-row-head">
          <h2>Messages ({visible})</h2>
          {notes.some((n) => n.hidden) && <span className="hint">Faded notes are hidden from {g.recipientName}.</span>}
        </div>
        {notes.length === 0 ? (
          <div className="empty">No messages yet. Share the invite link to get things started.</div>
        ) : (
          <NoteBoard
            notes={notes}
            stagger={false}
            renderExtra={(n) => (
              <div className="ga-note-tools">
                <button onClick={() => hide(n)}>{n.hidden ? "Show" : "Hide"}</button>
                <button onClick={() => del(n)}>Delete</button>
              </div>
            )}
          />
        )}
      </section>

      {live && (
        <section className="panel ga-sec">
          <div className="ga-row-head">
            <h2>Details</h2>
            <button className="btn btn-ghost btn-small" onClick={() => setEditing((v) => !v)}>{editing ? "Close" : "Edit"}</button>
          </div>
          <AnimatePresence initial={false}>
            {editing ? (
              <motion.div key="edit" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} style={{ overflow: "hidden" }}>
                <div style={{ paddingTop: 12 }}>
                  <GroupSetup initial={g} groupId={g.id} onSaved={(ng) => { setG(ng); setEditing(false); say("Saved."); }} />
                </div>
              </motion.div>
            ) : (
              <dl className="ga-dl">
                <div><dt>Card</dt><dd>{design.name}</dd></div>
                <div><dt>For</dt><dd>{g.recipientName} · {g.recipientEmail}</dd></div>
                <div><dt>Signatures due</dt><dd>{fmt(g.dueAt, g.timezone)}</dd></div>
                <div><dt>Delivered</dt><dd>{fmt(g.deliverAt, g.timezone)} <span className="muted">({g.timezone.replace(/_/g, " ")})</span></dd></div>
              </dl>
            )}
          </AnimatePresence>
        </section>
      )}

      <section className="panel ga-sec">
        <h2>Admins</h2>
        <p className="muted">Admins can invite people, hide messages, change dates and send the card early.</p>
        <ul className="ga-invites">
          {admins.map((a) => (
            <li key={a.email}>
              <span>{a.email}{a.email === me ? " (you)" : ""}</span>
              {a.role === "owner" ? <span className="pill pill-opened">Owner</span> : (owner || a.email === me) ? <button className="link-btn" onClick={() => removeAdmin(a.email)}>Remove</button> : <span className="pill pill-sending">Admin</span>}
            </li>
          ))}
        </ul>
        <div className="ga-add">
          <input className="input" type="email" placeholder="colleague@example.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} aria-label="New admin's email" />
          <button className="btn btn-primary" disabled={!adminEmail.trim() || busy === "addAdmin"} onClick={addAdmin}>Make admin</button>
        </div>
      </section>

      {live && (
        <section className="panel ga-sec">
          <h2>Delivery</h2>
          <div className="ga-actions">
            {open && <button className="btn btn-ghost" onClick={closeSigning} disabled={!!busy}>Close signing now</button>}
            <button className="btn btn-brand" onClick={sendNow} disabled={!!busy}>Deliver now</button>
            {owner && <button className="btn btn-ghost ga-danger" onClick={cancel}>Cancel card{g.priceCents ? ` (refund ${money(g.priceCents)})` : ""}</button>}
          </div>
        </section>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}>{toast}</motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .gadmin { display: grid; gap: 22px; }
        .ga-head { display: grid; grid-template-columns: 110px 1fr; gap: 28px; align-items: center; margin-bottom: 8px; }
        .ga-thumb { width: 110px; aspect-ratio: 5/7; border-radius: 5px; overflow: hidden; box-shadow: var(--shadow-card); }
        .ga-thumb svg { width: 100%; height: 100%; display: block; }
        .ga-links { display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap; }
        .ga-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .ga-stats > div { background: var(--surface); border-radius: 18px; padding: 16px 18px; display: grid; gap: 2px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); }
        .ga-stats strong { font-family: var(--font-display); font-size: 28px; letter-spacing: -0.03em; }
        .ga-stats span { font-size: 13px; color: var(--ink-4); }
        .ga-sec { padding: 24px 26px; }
        .ga-sec h2 { font-family: var(--font-display); font-size: 22px; letter-spacing: -0.02em; margin: 0 0 6px; }
        .ga-sec > .muted { margin: 0 0 16px; font-size: 15px; }
        .ga-row-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
        .ga-row-head h2 { margin: 0; }
        .invite-box { display: flex; gap: 8px; align-items: center; background: var(--bg-alt); border-radius: 14px; padding: 6px 6px 6px 14px; min-width: 0; }
        .invite-box span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: var(--ink-3); }
        .link-btn { border: 0; background: none; color: var(--blue); cursor: pointer; font-size: 14px; padding: 8px 0 0; }
        .ga-invites { list-style: none; padding: 0; margin: 16px 0 0; display: grid; }
        .ga-invites li { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line-soft); font-size: 15px; }
        .ga-invites li span:first-child { overflow: hidden; text-overflow: ellipsis; }
        .ga-note-tools { display: flex; gap: 6px; justify-content: flex-end; }
        .ga-note-tools button { border: 0; background: rgba(0,0,0,.07); border-radius: 980px; padding: 4px 11px; font-size: 12px; font-weight: 600; cursor: pointer; }
        .ga-note-tools button:hover { background: rgba(0,0,0,.12); }
        .ga-dl { margin: 0; display: grid; }
        .ga-dl > div { display: grid; grid-template-columns: 150px 1fr; gap: 12px; padding: 10px 0; border-top: 1px solid var(--line-soft); }
        .ga-dl dt { color: var(--ink-4); font-size: 15px; } .ga-dl dd { margin: 0; }
        .ga-add { display: flex; gap: 10px; margin-top: 14px; }
        .ga-add .input { flex: 1; }
        .ga-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; }
        .ga-danger { color: #d70015; }
        .empty { padding: 28px; border: 1px dashed var(--line); border-radius: 18px; color: var(--ink-3); text-align: center; }
        .toast { position: fixed; bottom: 28px; left: 50%; z-index: 120; background: var(--ink); color: #fff; padding: 12px 20px; border-radius: 980px; font-size: 15px; font-weight: 500; box-shadow: 0 10px 30px rgba(0,0,0,.25); white-space: nowrap; }
        @media (max-width: 640px) {
          .ga-head { grid-template-columns: 72px 1fr; gap: 18px; }
          .ga-thumb { width: 72px; }
          .ga-stats { grid-template-columns: 1fr 1fr; }
          .ga-dl > div { grid-template-columns: 1fr; gap: 2px; }
          .ga-add { flex-direction: column; }
          .ga-sec { padding: 20px 18px; }
        }
      `}</style>
    </div>
  );
}
