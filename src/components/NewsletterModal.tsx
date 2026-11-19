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
  const [phone, setPhone] = useState("");
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
          phone: phone.trim() || undefined,
          whatsapp: phone.trim() || undefined,
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
      aria-label="Subscribe to the School of Prophets daily devotions and teaching alerts"
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 sm:p-6 bg-ink/80 backdrop-blur-sm animate-fadeIn"
      onClick={handleDismiss}
    >
      <div
        className="relative w-full max-w-[360px] sm:max-w-[400px] max-h-[85vh] overflow-y-auto border border-gold/40 bg-[#0d1217] p-4 sm:p-5 text-parchment shadow-2xl transition-all rounded-sm mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle corner liturgical marks */}
        <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-gold/50 pointer-events-none" />
        <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-gold/50 pointer-events-none" />
        <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-gold/50 pointer-events-none" />
        <div className="absolute bottom-1.5 right-1.5 w-2 h-2 border-b border-r border-gold/50 pointer-events-none" />

        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-parchment/50 hover:text-parchment transition-colors p-1"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {success ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-gold/20 text-gold-soft border border-gold/40">
              <Check className="h-4 w-4" />
            </div>
            <h3 className="font-serif text-lg text-gold-soft">Welcome to the Fellowship</h3>
            <p className="mt-1.5 text-xs text-parchment/80 leading-relaxed">
              Grace and peace, {firstName}. You are subscribed for <strong>daily devotions</strong> and <strong>teaching alerts</strong>.
            </p>
            <div className="mt-3 inline-block rounded border border-gold/30 bg-gold/10 px-3 py-1.5 text-[11px] text-gold-soft">
              Please check your email daily for spiritual nourishment.
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <div className="flex h-5 w-5 items-center justify-center rounded-sm bg-gold/15 text-gold-soft border border-gold/30">
                <Mail className="h-2.5 w-2.5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-gold-soft">
                Daily Devotions &amp; Alerts
              </span>
            </div>

            <h3 className="font-serif text-lg sm:text-xl font-medium tracking-tight text-parchment">
              Stay Spiritually Anchored
            </h3>

            <p className="mt-1 text-xs text-parchment/75 leading-relaxed">
              Subscribe to receive morning devotions daily, alerts for every new teaching, and weekly fellowship updates.
            </p>

            <div className="mt-2 flex items-center gap-1.5 text-[10.5px] text-gold-soft/90 bg-gold/10 border border-gold/25 px-2.5 py-1 rounded">
              <span className="text-gold">✦</span>
              <span>Check your email daily for your morning devotion</span>
            </div>

            <form onSubmit={handleSubmit} className="mt-3 space-y-2.5">
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-parchment/60 mb-0.5">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Samuel"
                    className="w-full border border-parchment/20 bg-ink/60 px-2.5 py-1.5 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-parchment/60 mb-0.5">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ade"
                    className="w-full border border-parchment/20 bg-ink/60 px-2.5 py-1.5 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-parchment/60 mb-0.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-parchment/20 bg-ink/60 px-2.5 py-1.5 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-parchment/60 mb-0.5">
                  Phone / WhatsApp <span className="text-parchment/40 normal-case">(optional)</span>
                </label>
                <input
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 ... (optional)"
                  className="w-full border border-parchment/20 bg-ink/60 px-2.5 py-1.5 text-xs text-parchment placeholder:text-parchment/30 focus:border-gold focus:outline-none"
                />
              </div>

              {error && (
                <p role="alert" className="text-[11px] text-rose-400">
                  {error}
                </p>
              )}

              <div className="pt-0.5">
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-gold w-full py-2 justify-center text-xs font-medium tracking-wide shadow-md"
                >
                  {busy ? "Subscribing..." : "Subscribe for Daily Devotions & Alerts"}
                  {!busy && <ArrowRight className="w-3.5 h-3.5 ml-1.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-parchment/40 pt-0.5">
                <span>Free forever</span>
                <button
                  type="button"
                  onClick={handleDismiss}
                  className="hover:text-parchment/70 underline underline-offset-2 transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
