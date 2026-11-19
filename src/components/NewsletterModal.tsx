"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Mail, ArrowRight, Check } from "lucide-react";

export function NewsletterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === "/newsletter") {
      return;
    }

    try {
      const isSubscribed = localStorage.getItem("tsop_newsletter_subscribed");
      if (isSubscribed === "true") return;

      const dismissedAt = localStorage.getItem("tsop_newsletter_dismissed");
      if (dismissedAt) {
        const elapsedDays = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (elapsedDays < 7) {
          return;
        }
      }
    } catch {
      // LocalStorage unavailable
    }

    const delay = pathname.startsWith("/teachings/") ? 3500 : 7000;
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [pathname]);

  function handleDismiss() {
    setIsOpen(false);
    try {
      localStorage.setItem("tsop_newsletter_dismissed", Date.now().toString());
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        handleDismiss();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!firstName.trim()) {
      setError("Please enter your first name.");
      return;
    }
    if (!lastName.trim()) {
      setError("Please enter your last name.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email address.");
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
        try {
          localStorage.setItem("tsop_newsletter_subscribed", "true");
        } catch {
          // ignore
        }
        setTimeout(() => {
          setIsOpen(false);
        }, 2500);
      } else {
        if (res.status === 409) {
          try {
            localStorage.setItem("tsop_newsletter_subscribed", "true");
          } catch {
            // ignore
          }
        }
        setError(data.error || data.message || "Could not complete subscription. Please try again.");
      }
    } catch {
      setError("Connection error. Please try again in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Subscribe to the School of Prophets weekly letter"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-ink/80 backdrop-blur-sm animate-fadeIn"
    >
      <div
        className="relative w-full max-w-lg border border-gold/40 bg-[#0d1217] p-6 sm:p-8 text-parchment shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-gold/60" />
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-gold/60" />
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-gold/60" />
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-gold/60" />

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-parchment/60 hover:text-parchment transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gold/20 text-gold-soft border border-gold/40">
              <Check className="h-6 w-6" />
            </div>
            <h3 className="font-serif text-2xl text-gold-soft">Welcome to the Fellowship</h3>
            <p className="mt-2 text-sm text-parchment/80 leading-relaxed">
              Grace and peace to you, {firstName}. You are now subscribed to receive <strong>everyday morning devotions</strong> and <strong>instant alerts whenever new teachings are uploaded</strong>.
            </p>
            <div className="mt-4 inline-block rounded border border-gold/30 bg-gold/10 px-4 py-2 text-xs text-gold-soft">
              Please check your email daily to receive your spiritual nourishment.
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-gold/15 text-gold-soft border border-gold/30">
                <Mail className="h-4 w-4" />
              </div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold-soft">
                Essential For Every Believer
              </span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-medium tracking-tight text-parchment mt-2">
              Daily Devotions & Teaching Alerts
            </h3>

            <p className="mt-2.5 text-xs sm:text-sm text-parchment/75 leading-relaxed">
              Stay spiritually anchored and continually fed. Subscribing is essential for every disciple in our fellowship:
            </p>

            <ul className="mt-3.5 space-y-2 text-xs text-parchment/85">
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">✦</span>
                <span><strong>Everyday Morning Devotions:</strong> Fresh scripture, prophetic charge, and prayer delivered daily to your inbox.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">✦</span>
                <span><strong>Instant Teaching Alerts:</strong> Immediate email notification whenever a new sermon or audio is uploaded.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold mt-0.5">✦</span>
                <span><strong>Weekly Fellowship Letters:</strong> Prophetic outlines, times, and notices from the fellowship.</span>
              </li>
            </ul>

            <div className="mt-3 text-[11px] text-gold-soft/90 italic bg-gold/10 border border-gold/25 px-3 py-1.5 rounded">
              Remember to check your email daily to feed your spirit.
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-parchment/60 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. Samuel"
                    className="w-full border border-parchment/20 bg-ink/60 px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-parchment/60 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Ade"
                    className="w-full border border-parchment/20 bg-ink/60 px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-parchment/60 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-parchment/20 bg-ink/60 px-3.5 py-2 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-xs text-rose-400">
                  {error}
                </p>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-gold w-full py-3 justify-center text-sm font-medium tracking-wide shadow-md"
                >
                  {busy ? "Subscribing..." : "Subscribe for Daily Devotions & Alerts"}
                  {!busy && <ArrowRight className="w-4 h-4 ml-1.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-parchment/40 pt-2">
                <span>Free forever · Essential spiritual lifeline</span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="hover:text-parchment/70 underline underline-offset-2 transition-colors"
                >
                  No thanks, maybe later
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
