"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CardArt } from "@/components/CardArt";
import { PayForm, type PayHandle } from "@/components/composer/PayForm";
import { getDesign, DESIGNS } from "@/lib/designs";
import { groupQuote, money, pricing } from "@/config/pricing";
import type { PublicGroup } from "@/lib/groups";
import type { ClientPayConfig } from "@/lib/payments";

type Paid = { signedIn: boolean; email: string; groups: (PublicGroup & { inviteUrl: string })[] };

const short = (ms: number, tz: string) => new Date(ms).toLocaleString("en-CA", { timeZone: tz, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function CartView({ groups: initial, signedInEmail, pay }: { groups: PublicGroup[]; signedInEmail: string | null; pay: ClientPayConfig }) {
  const router = useRouter();
  const [groups, setGroups] = useState(initial);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [paid, setPaid] = useState<Paid | null>(null);
  const [copied, setCopied] = useState("");
  const payRef = useRef<PayHandle>(null);
  const q = groupQuote(groups.length);
  const progress = Math.min(1, groups.length / pricing.groupBulkMin);

  async function remove(g: PublicGroup) {
    const res = await fetch(`/api/groups/${g.id}`, { method: "DELETE" });
    if (res.ok) {
      setGroups((l) => l.filter((x) => x.id !== g.id));
      router.refresh();
    }
  }

  async function checkout(walletToken?: string) {
    if (busy) return;
    if (!signedInEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) return setError("Add your email for the receipt.");
    setBusy(true);
    setError("");
    try {
      const paymentToken = walletToken ?? (await payRef.current!.tokenize());
      const res = await fetch("/api/cart/checkout", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, paymentToken }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Something went wrong.");
      setPaid(json);
      router.refresh();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(url);
    setTimeout(() => setCopied(""), 2000);
  }

  if (paid) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}>
        <p className="eyebrow">Paid. Thank you.</p>
        <h1 className="display display-l">{paid.groups.length === 1 ? "Ready for signatures." : `${paid.groups.length} cards ready for signatures.`}</h1>
        <p className="lede" style={{ margin: "14px 0 36px", maxWidth: 640 }}>
          Send each invite link to everyone who should sign: group chat, email, Slack, anywhere.
          {paid.signedIn ? "" : ` We emailed ${paid.email} a link to manage the cards.`}
        </p>
        <ul className="cart-list">
          {paid.groups.map((g, i) => {
            const d = getDesign(g.design) ?? DESIGNS[0];
            return (
              <motion.li key={g.id} className="cart-row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.06 }}>
                <div className="cart-thumb"><CardArt design={d} /></div>
                <div className="cart-info">
                  <strong>For {g.recipientName}</strong>
                  <div className="invite-box">
                    <span>{g.inviteUrl}</span>
                    <button className="btn btn-primary btn-small" onClick={() => copy(g.inviteUrl)}>{copied === g.inviteUrl ? "Copied" : "Copy link"}</button>
                  </div>
                </div>
                {paid.signedIn && <Link href={`/groups/${g.id}`} className="btn btn-ghost btn-small">Manage</Link>}
              </motion.li>
            );
          })}
        </ul>
        <style>{styles}</style>
      </motion.div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "end", gap: 16, flexWrap: "wrap", marginBottom: 32 }}>
        <h1 className="display display-l">Cart</h1>
        <Link href="/group" className="btn btn-ghost">{groups.length ? "Add another group card" : "Start a group card"}</Link>
      </div>

      {groups.length === 0 ? (
        <div className="empty">Your cart is empty. <Link href="/group" className="link">Start a group card</Link> and everyone can sign it.</div>
      ) : (
        <>
          <div className="bulk panel">
            <div className="bulk-top">
              <strong>{q.bulk ? `Bulk price unlocked: ${money(pricing.groupBulkCents)} a card` : `Add ${q.toBulk} more for ${money(pricing.groupBulkCents)} a card`}</strong>
              <span className="muted">{groups.length} of {pricing.groupBulkMin}</span>
            </div>
            <div className="bulk-bar"><motion.span initial={false} animate={{ width: `${progress * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} style={{ background: q.bulk ? "var(--ok)" : "var(--brand)" }} /></div>
            {!q.bulk && <p className="hint" style={{ margin: "8px 0 0" }}>Get {pricing.groupBulkMin} or more and every card in the cart is {money(pricing.groupBulkCents)} instead of {money(pricing.groupCents)}.</p>}
          </div>

          <ul className="cart-list">
            <AnimatePresence initial={false}>
              {groups.map((g) => {
                const d = getDesign(g.design) ?? DESIGNS[0];
                return (
                  <motion.li key={g.id} layout className="cart-row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}>
                    <div className="cart-thumb"><CardArt design={d} /></div>
                    <div className="cart-info">
                      <strong>{g.headline || `For ${g.recipientName}`}</strong>
                      <span className="muted">To {g.recipientName} · signatures due {short(g.dueAt, g.timezone)} · delivered {short(g.deliverAt, g.timezone)}</span>
                    </div>
                    <div className="cart-right">
                      <span className="cart-price">
                        {q.bulk && <s className="muted">{money(pricing.groupCents)}</s>} {money(q.each)}
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/group?edit=${g.id}`} className="btn btn-ghost btn-small">Edit</Link>
                        <button className="btn btn-ghost btn-small" onClick={() => remove(g)}>Remove</button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div className="checkout panel">
            <table className="price">
              <tbody>
                <tr><td>{q.count} group card{q.count === 1 ? "" : "s"} × {money(q.each)}</td><td>{money(q.subtotal)}</td></tr>
                {q.savings > 0 && <tr className="save"><td>Bulk savings</td><td>−{money(q.savings)}</td></tr>}
                {q.tax > 0 && <tr><td>Tax</td><td>{money(q.tax)}</td></tr>}
                <tr className="total"><td>Total</td><td>{money(q.total)}</td></tr>
              </tbody>
            </table>
            {!signedInEmail && (
              <div className="field">
                <label htmlFor="cart-em">Your email</label>
                <input id="cart-em" className="input" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                <span className="hint">You&apos;ll be the card&apos;s admin. We send the receipt and a link to manage everything here.</span>
              </div>
            )}
            <PayForm ref={payRef} config={pay} totalCents={q.total} onWalletToken={(t) => checkout(t)} disabled={busy} />
            <AnimatePresence>{error && <motion.p className="error" role="alert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ margin: 0 }}>{error}</motion.p>}</AnimatePresence>
            <button className="btn btn-brand" style={{ width: "100%" }} onClick={() => checkout()} disabled={busy}>
              {busy ? "Paying..." : `Pay ${money(q.total)}`}
            </button>
            <p className="hint" style={{ margin: 0, textAlign: "center" }}>Signing opens as soon as you pay. Cancel any card before it&apos;s delivered for a refund.</p>
          </div>
        </>
      )}
      <style>{styles}</style>
    </div>
  );
}

const styles = `
  .cart-list { list-style: none; padding: 0; margin: 0 0 28px; display: grid; gap: 12px; }
  .cart-row { display: grid; grid-template-columns: 56px 1fr auto; gap: 18px; align-items: center; padding: 16px 18px; background: var(--surface); border-radius: 18px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 4px 16px rgba(0,0,0,.04); }
  .cart-thumb { width: 56px; aspect-ratio: 5/7; border-radius: 4px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.12); }
  .cart-thumb svg { width: 100%; height: 100%; display: block; }
  .cart-info { display: grid; gap: 4px; min-width: 0; font-size: 15px; }
  .cart-info strong { font-size: 18px; }
  .cart-right { display: grid; gap: 8px; justify-items: end; }
  .cart-price { font-weight: 700; font-variant-numeric: tabular-nums; }
  .cart-price s { font-weight: 500; margin-right: 4px; }
  .bulk { padding: 18px 22px; margin-bottom: 20px; }
  .bulk-top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 10px; font-size: 16px; }
  .bulk-bar { height: 8px; border-radius: 8px; background: var(--line-soft); overflow: hidden; }
  .bulk-bar span { display: block; height: 100%; border-radius: 8px; }
  .checkout { padding: 26px; display: grid; gap: 18px; max-width: 520px; margin-left: auto; }
  .price { width: 100%; border-collapse: collapse; font-size: 16px; }
  .price td { padding: 6px 0; }
  .price td:last-child { text-align: right; font-variant-numeric: tabular-nums; }
  .price .save td { color: var(--ok); }
  .price .total td { font-weight: 700; font-size: 19px; padding-top: 12px; border-top: 1px solid var(--line-soft); }
  .invite-box { display: flex; gap: 10px; align-items: center; background: var(--bg-alt); border-radius: 12px; padding: 6px 6px 6px 14px; margin-top: 4px; min-width: 0; }
  .invite-box span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; color: var(--ink-3); }
  .empty { padding: 28px; border: 1px dashed var(--line); border-radius: 18px; color: var(--ink-3); text-align: center; }
  @media (max-width: 640px) {
    .cart-row { grid-template-columns: 48px 1fr; }
    .cart-thumb { width: 48px; }
    .cart-right { grid-column: 1 / -1; justify-items: stretch; grid-auto-flow: column; align-items: center; justify-content: space-between; }
  }
`;
