"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Crest } from "@/components/Crest";
import { ArrowLeft, KeyRound, LoaderCircle, LogIn, MailCheck } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [view, setView] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      router.push("/admin");
      router.refresh();
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
      const sb = createSupabaseBrowser();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error: resetErr } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${origin}/admin/reset-password`,
      });

      if (resetErr) {
        setError(resetErr.message);
      } else {
        setMessage(
          `A password reset link has been dispatched to ${email.trim()}. Please check your email inbox and spam folder.`
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
                placeholder="admin@theschoolofprophets.org"
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
    </div>
  );
}
