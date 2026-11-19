"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { requestPasswordResetAction } from "./actions";
import { Crest } from "@/components/Crest";
import { ArrowLeft, CheckCircle2, KeyRound, LoaderCircle, LogIn, MailCheck, X } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError("Supabase is not configured yet. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.");
        setBusy(false);
        return;
      }
      const sb = createSupabaseBrowser();
      const { error: err } = await sb.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (err) {
        setError(err.message);
        setBusy(false);
        return;
      }
      window.location.href = "/admin";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
      setBusy(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter your registered email address.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const targetEmail = email.trim();
      const res = await requestPasswordResetAction(targetEmail);
      if (!res.success) {
        setError(res.error || "Failed to dispatch reset link");
      } else {
        setSentToEmail(targetEmail);
        setShowSuccessModal(true);
        setMessage(
          res.message ||
            `A password reset link has been dispatched to ${targetEmail}. Please check your email inbox and spam folder.`
        );
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reset link");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-body min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Crest width={56} height={64} className="text-gold" />
          <h1 className="mt-3 font-display text-xl">The School of Prophets</h1>
          <p className="label mt-1 opacity-60">
            {view === "login" ? "Admin sign in" : "Password recovery"}
          </p>
        </div>

        {view === "login" ? (
          <form onSubmit={signIn} className="admin-surface p-5 flex flex-col gap-4">
            <div>
              <label className="admin-label" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="admin-label" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setView("forgot");
                    setError("");
                    setMessage("");
                  }}
                  className="text-xs text-gold hover:underline mb-1"
                >
                  Forgotten password?
                </button>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-xs admin-badge-bad">{error}</p>}

            <button type="submit" disabled={busy} className="admin-btn admin-btn-gold">
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <LogIn size={14} />}
              Sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleForgotPassword} className="admin-surface p-5 flex flex-col gap-4">
            <div>
              <h2 className="font-display text-base text-parchment">Reset Password</h2>
              <p className="mt-1 text-xs opacity-60 leading-relaxed">
                Enter your registered admin email. We will send a secure link to create a new password.
              </p>
            </div>

            <div>
              <label className="admin-label" htmlFor="reset-email">
                Registered Email
              </label>
              <input
                id="reset-email"
                type="email"
                required
                autoComplete="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@theschoolofprophets.site"
              />
            </div>

            {error && <p className="text-xs admin-badge-bad">{error}</p>}
            {message && (
              <div className="rounded border border-gold/40 bg-gold/10 p-3 text-xs text-gold leading-relaxed">
                <MailCheck size={14} className="inline mr-1.5" />
                {message}
              </div>
            )}

            <button type="submit" disabled={busy} className="admin-btn admin-btn-gold">
              {busy ? (
                <LoaderCircle size={14} className="animate-spin" />
              ) : (
                <KeyRound size={14} />
              )}
              Send password reset link
            </button>

            <button
              type="button"
              onClick={() => {
                setView("login");
                setError("");
                setMessage("");
              }}
              className="admin-btn admin-btn-ghost text-xs mt-1"
            >
              <ArrowLeft size={13} /> Back to sign in
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-[0.65rem] opacity-40">
          Access is by invitation only. Contact the Owner for a dashboard account.
        </p>
      </div>

      {/* Confirmation Pop-up Box */}
      {showSuccessModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="admin-surface max-w-sm w-full p-6 text-center border border-gold/50 shadow-2xl rounded-lg space-y-4 relative">
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="absolute top-3 right-3 text-parchment/50 hover:text-parchment transition-colors"
              aria-label="Close dialog"
            >
              <X size={16} />
            </button>

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gold/15 text-gold border border-gold/30">
              <MailCheck size={28} />
            </div>

            <div>
              <h3 className="font-display text-lg text-parchment">
                Reset Link Dispatched!
              </h3>
              <p className="mt-2 text-xs text-parchment/80 leading-relaxed">
                A password recovery email has been sent to:
              </p>
              <p className="mt-1 text-sm font-semibold text-gold break-all">
                {sentToEmail}
              </p>
              <p className="mt-2.5 text-[0.72rem] text-parchment/60 leading-relaxed">
                Please check your inbox and your spam folder. Follow the secure link inside to establish your new password.
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setView("login");
                  setError("");
                  setMessage("");
                }}
                className="admin-btn admin-btn-gold w-full text-xs"
              >
                Return to Sign In
              </button>
              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="admin-btn admin-btn-ghost w-full text-xs"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
