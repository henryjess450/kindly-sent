"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { ClientPayConfig } from "@/lib/payments";

export type PayHandle = { tokenize: () => Promise<string> };

type SqCard = { attach: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token?: string; errors?: { message: string }[] }>; destroy: () => Promise<void> };
type SqWallet = { attach?: (sel: string) => Promise<void>; tokenize: () => Promise<{ status: string; token?: string }>; destroy: () => Promise<void> };
type SqPayments = {
  card: (opts?: unknown) => Promise<SqCard>;
  paymentRequest: (r: unknown) => unknown;
  applePay: (r: unknown) => Promise<SqWallet>;
  googlePay: (r: unknown) => Promise<SqWallet>;
};
declare global {
  interface Window {
    Square?: { payments: (appId: string, locationId: string) => SqPayments };
  }
}

function loadScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return window.Square ? resolve() : setTimeout(() => resolve(), 300);
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Couldn't load the payment form."));
    document.head.appendChild(s);
  });
}

/**
 * Square's card form (plus Apple Pay / Google Pay where the device has them).
 * Wallet buttons pay straight away through onWalletToken. In development
 * without Square keys it shows a demo form that never charges anything.
 */
export const PayForm = forwardRef<PayHandle, { config: ClientPayConfig; totalCents: number; onWalletToken: (token: string) => void; disabled?: boolean }>(
  function PayForm({ config, totalCents, onWalletToken, disabled }, ref) {
    const card = useRef<SqCard | null>(null);
    const [ready, setReady] = useState(config.mode !== "square");
    const [error, setError] = useState("");
    const [wallets, setWallets] = useState({ apple: null as SqWallet | null, google: false });
    const [demoDecline, setDemoDecline] = useState(false);

    useEffect(() => {
      if (config.mode !== "square") return;
      let cancelled = false;
      const made: { destroy: () => Promise<void> }[] = [];
      (async () => {
        try {
          await loadScript(config.sandbox ? "https://sandbox.web.squarecdn.com/v1/square.js" : "https://web.squarecdn.com/v1/square.js");
          if (cancelled || !window.Square) return;
          const payments = window.Square.payments(config.applicationId, config.locationId);
          const c = await payments.card({
            style: {
              input: { fontSize: "16px", color: "#1d1d1f" },
              ".input-container": { borderRadius: "12px", borderColor: "#d2d2d7" },
              ".input-container.is-focus": { borderColor: "#0071e3" },
            },
          });
          await c.attach("#ks-card-field");
          card.current = c;
          made.push(c);
          setReady(true);
          const req = payments.paymentRequest({
            countryCode: "CA",
            currencyCode: "CAD",
            total: { amount: (totalCents / 100).toFixed(2), label: "Kindly Sent" },
          });
          try {
            const apple = await payments.applePay(req);
            made.push(apple);
            if (!cancelled) setWallets((w) => ({ ...w, apple }));
          } catch {}
          try {
            const google = await payments.googlePay(req);
            await google.attach!("#ks-gpay");
            made.push(google);
            if (!cancelled) {
              setWallets((w) => ({ ...w, google: true }));
              document.getElementById("ks-gpay")?.addEventListener("click", async () => {
                const r = await google.tokenize();
                if (r.status === "OK" && r.token) onWalletToken(r.token);
              });
            }
          } catch {}
        } catch (e) {
          setError(e instanceof Error ? e.message : "Couldn't load the payment form.");
        }
      })();
      return () => {
        cancelled = true;
        made.forEach((m) => void m.destroy().catch(() => {}));
      };
      // The amount is fixed by the time this step shows.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.mode]);

    useImperativeHandle(ref, () => ({
      async tokenize() {
        if (config.mode === "demo") return demoDecline ? "demo-decline" : "demo-ok";
        if (config.mode === "off") throw new Error("Payments aren't set up yet.");
        if (!card.current) throw new Error("The payment form is still loading.");
        const r = await card.current.tokenize();
        if (r.status !== "OK" || !r.token) throw new Error(r.errors?.[0]?.message ?? "Check your card details.");
        return r.token;
      },
    }));

    async function apple() {
      if (!wallets.apple) return;
      const r = await wallets.apple.tokenize();
      if (r.status === "OK" && r.token) onWalletToken(r.token);
    }

    if (config.mode === "off") return <p className="error">Payments aren&apos;t set up yet. Add the Square keys to .env.</p>;

    if (config.mode === "demo")
      return (
        <div className="demo-pay">
          <strong>Demo payment</strong>
          <span className="hint">Development only. No Square keys are set, so nothing is charged.</span>
          <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 14 }}>
            <input type="checkbox" checked={demoDecline} onChange={(e) => setDemoDecline(e.target.checked)} /> Pretend the card is declined
          </label>
          <style>{`.demo-pay { display: grid; gap: 6px; padding: 16px 18px; border: 1px dashed var(--line); border-radius: 14px; background: var(--surface); }`}</style>
        </div>
      );

    return (
      <div style={{ display: "grid", gap: 12, opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? "none" : undefined }}>
        {wallets.apple && (
          <button type="button" className="apple-pay" onClick={apple} aria-label="Pay with Apple Pay" />
        )}
        <div id="ks-gpay" style={{ display: wallets.google ? "block" : "none", minHeight: wallets.google ? 48 : 0 }} />
        {(wallets.apple || wallets.google) && <div className="pay-or">or pay with card</div>}
        <div id="ks-card-field" style={{ minHeight: 90 }} />
        {!ready && !error && <p className="hint">Loading secure payment form...</p>}
        {error && <p className="error">{error}</p>}
        <style>{`
          .apple-pay { -webkit-appearance: -apple-pay-button; -apple-pay-button-type: plain; -apple-pay-button-style: black; height: 48px; width: 100%; border: 0; border-radius: 12px; cursor: pointer; }
          .pay-or { display: flex; align-items: center; gap: 12px; color: var(--ink-4); font-size: 13px; }
          .pay-or::before, .pay-or::after { content: ""; flex: 1; height: 1px; background: var(--line-soft); }
        `}</style>
      </div>
    );
  },
);
