"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

/**
 * The newsletter form, in three contexts: a footer band, a card on the
 * newsletter page, and a banner. One field set, one voice, no urgency.
 */
export function NewsletterSubscribe({
  variant = "banner",
}: {
  variant?: "banner" | "card" | "inline";
  title?: string;
  description?: string;
}) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please give your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please give your last name.");
      return;
    }
    if (!email.trim()) {
      setError("Add an email address so we know where to send the letter.");
      return;
    }
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "newsletter",
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          phone: phone.trim() || undefined,
          whatsapp: phone.trim() || undefined,
          website: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        setEmail("");
        setFirstName("");
        setLastName("");
        setPhone("");
      } else {
        setError(
          data.error ||
            data.message ||
            "That did not go through. Try again, or write to the team instead.",
        );
      }
    } catch {
      setError("The connection dropped. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  const onDark = variant !== "card";
  const fieldClass = `min-h-11 w-full border bg-transparent px-3 text-sm outline-none focus:border-gold ${
    onDark
      ? "border-parchment/25 text-parchment placeholder:text-parchment/40"
      : "border-ink/25 text-ink placeholder:text-quiet/70"
  }`;

  const form = success ? (
    <div
      role="status"
      className={`border-t py-4 text-sm leading-relaxed ${
        onDark ? "border-gold/50 text-parchment" : "border-ember/40 text-ink"
      }`}
    >
      <p className={`label ${onDark ? "text-gold-soft" : "text-ember"}`}>
        You are on the list
      </p>
      <p className="mt-2">
        The first letter arrives tomorrow morning. Every email carries an
        unsubscribe link at the foot of it.
      </p>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="w-full">
      <input
        type="text"
        name="website"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
      />

      <div className="grid gap-2 sm:grid-cols-2">
        <label>
          <span className="sr-only">First name</span>
          <input
            type="text"
            required
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className={fieldClass}
          />
        </label>
        <label>
          <span className="sr-only">Last name</span>
          <input
            type="text"
            required
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className={fieldClass}
          />
        </label>
      </div>

      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Email address</span>
          <input
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "newsletter-error" : undefined}
            className={fieldClass}
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="btn btn-gold shrink-0 sm:w-auto"
        >
          {busy ? "Sending…" : "Subscribe"}
          {!busy && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
        </button>
      </div>

      <details className="mt-2.5">
        <summary className="inline cursor-pointer text-xs opacity-60 hover:opacity-100">
          Add a phone number (optional)
        </summary>
        <label className="mt-2 block">
          <span className="sr-only">Phone or WhatsApp</span>
          <input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234…"
            className={fieldClass}
          />
        </label>
      </details>

      {error && (
        <p
          id="newsletter-error"
          role="alert"
          className={`mt-2 text-xs ${onDark ? "text-gold-soft" : "text-ember"}`}
        >
          {error}
        </p>
      )}
    </form>
  );

  if (variant === "inline") {
    return (
      <div className="grid gap-6 md:grid-cols-12 md:items-start">
        <div className="md:col-span-5">
          <p className="label text-gold-soft/80">The letter</p>
          <h2 className="mt-2 max-w-[20ch] font-display text-2xl leading-tight text-parchment md:text-3xl">
            A short word each weekday.
          </h2>
          <p className="mt-2 max-w-[42ch] text-sm leading-relaxed text-parchment/60">
            A devotion of a few minutes, and a note when a new teaching is
            published. Nothing else is sent.
          </p>
        </div>
        <div className="md:col-span-6 md:col-start-7">{form}</div>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "card"
          ? "border-t border-ink/25 pt-6"
          : "border-y border-parchment/15 bg-ink-2 p-6 text-parchment sm:p-8"
      }
    >
      <p className={`label ${variant === "card" ? "text-ember" : "text-gold-soft/80"}`}>
        The letter
      </p>
      <h2 className="mt-2 font-display text-2xl sm:text-3xl">
        A short word each weekday.
      </h2>
      <p
        className={`measure mt-2 text-sm leading-relaxed ${
          variant === "card" ? "text-quiet" : "text-parchment/65"
        }`}
      >
        A devotion of a few minutes, and a note when a new teaching is
        published. Nothing else is sent.
      </p>
      <div className="mt-5">{form}</div>
    </div>
  );
}
