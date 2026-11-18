"use client";

import { useState } from "react";
import { LoaderCircle, Mail, CheckCircle2, Sparkles } from "lucide-react";

export function NewsletterSubscribe({
  variant = "banner",
  title = "Stay Connected with the House",
  description = "Receive apostolic teachings, gathering reminders, and prophetic insights delivered straight to your email.",
}: {
  variant?: "banner" | "card" | "inline";
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          email: email.trim(),
          name: name.trim() || undefined,
          website: honeypot, // Honeypot
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        setEmail("");
        setName("");
      } else {
        setError(data.error || data.message || "Failed to subscribe. Please try again.");
      }
    } catch {
      setError("Network error. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (variant === "card") {
    return (
      <div className="border border-gold/40 bg-ink p-6 text-parchment shadow-xl">
        <div className="flex items-center gap-2 text-gold">
          <Sparkles className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">Weekly Epistle</span>
        </div>
        <h3 className="mt-2 font-display text-xl text-parchment">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-parchment/70">{description}</p>

        {success ? (
          <div className="mt-4 flex items-center gap-2 rounded border border-gold/50 bg-gold/10 p-3 text-xs text-gold">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Thank you for subscribing! You will receive our latest updates.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="email"
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-parchment/25 bg-parchment/5 px-3 py-2 text-xs text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn btn-gold w-full text-xs font-semibold tracking-wider uppercase"
            >
              {busy ? <LoaderCircle className="h-3.5 w-3.5 animate-spin mx-auto" /> : "Subscribe"}
            </button>
            {error && <p className="text-[0.7rem] text-red-400">{error}</p>}
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-parchment/10 bg-ink/95 px-4 py-12 text-parchment sm:py-16">
      <div className="wrap mx-auto max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold">
          <Mail className="h-3.5 w-3.5" />
          <span>The School of Prophets Newsletter</span>
        </div>
        <h2 className="mt-4 font-display text-2xl text-parchment sm:text-3xl md:text-4xl">
          {title}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-parchment/70 sm:text-base">
          {description}
        </p>

        {success ? (
          <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2.5 rounded border border-gold/50 bg-gold/10 p-4 text-sm text-gold">
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            <span className="font-medium">
              You are subscribed! Welcome to The School of Prophets community.
            </span>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-6 flex max-w-xl flex-col items-center gap-2 sm:flex-row"
          >
            <input
              type="text"
              name="website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />
            <input
              type="text"
              placeholder="Your name (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-parchment/25 bg-parchment/5 px-4 py-3 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none sm:w-1/3"
            />
            <input
              type="email"
              required
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-parchment/25 bg-parchment/5 px-4 py-3 text-sm text-parchment placeholder:text-parchment/40 focus:border-gold focus:outline-none sm:flex-1"
            />
            <button
              type="submit"
              disabled={busy}
              className="btn btn-gold w-full whitespace-nowrap px-6 py-3 text-xs font-bold uppercase tracking-widest sm:w-auto"
            >
              {busy ? (
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-4 w-4 animate-spin" /> Subscribing…
                </span>
              ) : (
                "Subscribe Free"
              )}
            </button>
          </form>
        )}
        {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        <p className="mt-4 text-[0.7rem] text-parchment/40">
          No spam. Unsubscribe with one click at any time.
        </p>
      </div>
    </div>
  );
}
