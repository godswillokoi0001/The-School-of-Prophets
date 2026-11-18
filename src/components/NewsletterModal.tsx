"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X, Mail, ArrowRight, Check } from "lucide-react";

export function NewsletterModal() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Don't show in admin or on the standalone newsletter signup page
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

    // Faster trigger if on a teaching article (3s), otherwise 7s for general visits
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

  // Handle escape key
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
          name: name.trim() || undefined,
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
      className="fixed inset-0 z-[120] flex items-center justify-center bg-ink/80 p-4 sm:p-6"
    >
      <div
        className="relative w-full max-w-lg border border-parchment/20 border-t-2 border-t-gold bg-ink-2 p-6 text-parchment sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-parchment/60 transition-colors hover:text-parchment"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center border border-gold/55 text-gold-soft">
              <Check aria-hidden="true" className="h-5 w-5" />
            </div>
            <h3 className="font-display text-2xl text-parchment">You&apos;re on the list.</h3>
            <p className="measure mt-2 text-sm leading-relaxed text-parchment/70">
              The next letter goes out after Sunday: the teaching outline and the
              times for the week.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <Mail aria-hidden="true" className="h-3.5 w-3.5 text-gold-soft" />
              <span className="label text-gold-soft/85">The weekly letter</span>
            </div>

            <h3 className="mt-4 font-display text-2xl leading-snug text-parchment sm:text-3xl">
              One letter a week.
            </h3>

            <p className="measure mt-2.5 text-sm leading-relaxed text-parchment/70">
              The teaching outline, the times for the week, and anything the
              fellowship needs to say. Nothing else.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-3.5">
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

              <div>
                <label className="block text-[11px] uppercase tracking-wider text-parchment/60 mb-1">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Samuel"
                  className="w-full border border-parchment/20 bg-ink/60 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                />
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
                  className="w-full border border-parchment/20 bg-ink/60 px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
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
                  {busy ? "Subscribing..." : "Subscribe to Weekly Dispatch"}
                  {!busy && <ArrowRight className="w-4 h-4 ml-1.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 text-[11px] text-parchment/60">
                <span>Free forever · No spam</span>
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
