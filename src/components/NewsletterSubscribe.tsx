"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";

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
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please provide your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please provide your last name.");
      return;
    }
    if (!email.trim()) {
      setError("Add an email address so we know where to send it.");
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
          website: honeypot,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccess(true);
        setEmail("");
        setFirstName("");
        setLastName("");
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

  const form = success ? (
    <p role="status" className={`text-sm ${onDark ? "text-gold-soft" : "text-ember"}`}>
      You&apos;re on the list. The next letter will arrive after Sunday.
    </p>
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
            placeholder="First name *"
            className={`min-h-11 w-full border bg-transparent px-3 text-sm focus:border-gold ${
              onDark
                ? "border-parchment/25 text-parchment placeholder:text-parchment/35"
                : "border-ink/25 text-ink placeholder:text-quiet/60"
            }`}
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
            placeholder="Last name *"
            className={`min-h-11 w-full border bg-transparent px-3 text-sm focus:border-gold ${
              onDark
                ? "border-parchment/25 text-parchment placeholder:text-parchment/35"
                : "border-ink/25 text-ink placeholder:text-quiet/60"
            }`}
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
            placeholder="Email address *"
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "newsletter-error" : undefined}
            className={`min-h-11 w-full border bg-transparent px-3 text-sm focus:border-gold ${
              onDark
                ? "border-parchment/25 text-parchment placeholder:text-parchment/35"
                : "border-ink/25 text-ink placeholder:text-quiet/60"
            }`}
          />
        </label>
        <button type="submit" disabled={busy} className="btn btn-gold shrink-0">
          {busy ? "Sending" : "Subscribe"}
          {!busy && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
        </button>
      </div>
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
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[42ch]">
          <p className="label text-gold-soft/85">The weekly letter</p>
          <p className="mt-2 text-sm leading-relaxed text-parchment/60">
            One email a week: the teaching outline, the times for the week, and
            anything the fellowship needs to say. Nothing else.
          </p>
        </div>
        <div className="w-full md:max-w-md">{form}</div>
      </div>
    );
  }

  return (
    <div
      className={
        variant === "card"
          ? "border border-ink/20 bg-paper p-6"
          : "border-y border-parchment/15 bg-ink-2 p-6 text-parchment"
      }
    >
      <p className={`label ${variant === "card" ? "text-ember" : "text-gold-soft/85"}`}>
        The weekly letter
      </p>
      <h2 className="mt-3 font-display text-2xl">One letter a week.</h2>
      <p
        className={`measure mt-2 text-sm leading-relaxed ${
          variant === "card" ? "text-quiet" : "text-parchment/60"
        }`}
      >
        The teaching outline, the times for the week, and anything the fellowship
        needs to say. Nothing else.
      </p>
      <div className="mt-5">{form}</div>
    </div>
  );
}
