"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export function SignInForm({ expired }: { expired: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent">("idle");
  const [error, setError] = useState(expired ? "That link expired or was already used. Get a fresh one below." : "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    setError("");
    const res = await fetch("/api/auth/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email }) });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(json.error ?? "Something went wrong.");
      setState("idle");
    } else setState("sent");
  }

  return (
    <div className="panel" style={{ width: "100%", maxWidth: 420, padding: "44px 36px", textAlign: "center" }}>
      <AnimatePresence mode="wait">
        {state !== "sent" ? (
          <motion.form key="f" onSubmit={submit} exit={{ opacity: 0, y: -12 }} style={{ display: "grid", gap: 18 }}>
            <h1 className="display" style={{ fontSize: 34 }}>Sign in</h1>
            <p className="muted" style={{ margin: 0 }}>No password. We email you a link that signs you in.</p>
            <input className="input" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
            {error && <p className="error" style={{ margin: 0 }}>{error}</p>}
            <button className="btn btn-primary" disabled={state === "busy"}>{state === "busy" ? "Sending..." : "Email me a link"}</button>
          </motion.form>
        ) : (
          <motion.div key="s" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ display: "grid", gap: 12 }}>
            <motion.div initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 380, damping: 16 }} style={{ fontSize: 44 }} aria-hidden>
              ✉️
            </motion.div>
            <h1 className="display" style={{ fontSize: 30 }}>Check your email</h1>
            <p className="muted" style={{ margin: 0 }}>We sent a sign-in link to <strong style={{ color: "var(--ink)" }}>{email}</strong>. It works once, for 30 minutes.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
