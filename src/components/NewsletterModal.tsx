"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

/**
 * The letter invitation.
 *
 * It is never thrown over the page on arrival: it waits until the reader has
 * scrolled most of an article, or moves to leave the site. Dismissal is kept
 * for a week, subscription forever, and the card fits a 320px screen.
 */
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
  const panelRef = useRef<HTMLDivElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (pathname.startsWith("/admin") || pathname === "/newsletter") return;

    try {
      if (localStorage.getItem("tsop_newsletter_subscribed") === "true") return;
      const dismissedAt = localStorage.getItem("tsop_newsletter_dismissed");
      if (dismissedAt) {
        const elapsedDays =
          (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
        if (elapsedDays < 7) return;
      }
    } catch {
      // Storage is unavailable; the reader can still dismiss the card.
    }

    let fired = false;
    let timer = 0;

    const open = () => {
      if (fired) return;
      fired = true;
      returnFocus.current = document.activeElement as HTMLElement | null;
      setIsOpen(true);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
      window.clearTimeout(timer);
    };

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      if (scrollable > 600 && window.scrollY / scrollable > 0.6) open();
    };

    const onLeave = (event: MouseEvent) => {
      if (event.clientY <= 0) open();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("mouseout", onLeave);
    // Long-form pages still get one quiet offer, well after the first screen.
    timer = window.setTimeout(open, pathname.startsWith("/teachings/") ? 45000 : 60000);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("mouseout", onLeave);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const focusTarget =
      panelRef.current?.querySelector<HTMLElement>("[data-autofocus]") ??
      panelRef.current;
    focusTarget?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleDismiss();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([type="hidden"]), select, textarea',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  function handleDismiss() {
    setIsOpen(false);
    returnFocus.current?.focus?.();
    try {
      localStorage.setItem("tsop_newsletter_dismissed", Date.now().toString());
    } catch {
      // ignore
    }
  }

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
      } else {
        if (res.status === 409) {
          try {
            localStorage.setItem("tsop_newsletter_subscribed", "true");
          } catch {
            // ignore
          }
        }
        setError(
          data.error ||
            data.message ||
            "Could not complete the subscription. Please try again.",
        );
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
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-y-auto bg-ink/85 p-3 sm:items-center sm:p-6"
      onClick={handleDismiss}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="letter-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="relative my-auto w-full max-w-[26rem] border border-ink/25 bg-parchment text-ink shadow-none"
      >
        <div className="flex items-center justify-between gap-3 border-b border-ink/15 px-4 py-2">
          <p className="label text-ember">A letter each morning</p>
          <button
            type="button"
            onClick={handleDismiss}
            autoFocus
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-ink/55 transition-colors hover:text-ink"
            aria-label="Close"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-5 sm:px-6">
          {success ? (
            <div>
              <p className="label text-ember">You are on the list</p>
              <h2 id="letter-title" className="mt-2 font-display text-2xl">
                Thank you, {firstName}.
              </h2>
              <p className="mt-2 text-sm text-quiet">
                The first letter arrives tomorrow morning. Every email carries an
                unsubscribe link at the foot of it.
              </p>
              <button
                type="button"
                onClick={handleDismiss}
                className="btn btn-outline mt-5 w-full"
              >
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 id="letter-title" className="font-display text-2xl leading-tight">
                A short word before the day begins.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-quiet">
                A weekday devotion of a few minutes, and a note when a new
                teaching is published. Nothing else.
              </p>

              <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
                  <label className="field">
                    <span>First name</span>
                    <input
                      type="text"
                      required
                      autoComplete="given-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="input text-sm"
                    />
                  </label>
                  <label className="field">
                    <span>Last name</span>
                    <input
                      type="text"
                      required
                      autoComplete="family-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="input text-sm"
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Email</span>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input text-sm"
                  />
                </label>

                <label className="field">
                  <span>Phone or WhatsApp (optional)</span>
                  <input
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234…"
                    className="input text-sm"
                  />
                </label>

                {error && (
                  <p role="alert" className="text-xs text-ember">
                    {error}
                  </p>
                )}

                <button type="submit" disabled={busy} className="btn btn-ink w-full">
                  {busy ? "Sending…" : "Send me the letters"}
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="w-full text-center text-[0.7rem] text-quiet underline underline-offset-4 hover:text-ink"
                >
                  Not now
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
