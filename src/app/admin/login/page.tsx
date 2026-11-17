"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Crest } from "@/components/Crest";
import { LoaderCircle, LogIn, MailCheck } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [magicSent, setMagicSent] = useState(false);

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const sb = createSupabaseBrowser();
    const { error: err } = await sb.auth.signInWithPassword({
      email,
      password,
    });
    if (err) {
      setError(err.message);
      setBusy(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  async function sendMagic(e: React.MouseEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const sb = createSupabaseBrowser();
    const { error: err } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${location.origin}/admin/auth/callback` },
    });
    setBusy(false);
    if (err) setError(err.message);
    else setMagicSent(true);
  }

  return (
    <div className="admin-body min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Crest width={56} height={64} className="text-gold" />
          <h1 className="mt-3 font-display text-xl">The School of Prophets</h1>
          <p className="label mt-1 opacity-60">Admin sign in</p>
        </div>

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
            <label className="admin-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
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
          <button
            type="button"
            onClick={sendMagic}
            disabled={busy || !email}
            className="admin-btn admin-btn-ghost"
          >
            <MailCheck size={14} /> Email me a sign-in link
          </button>
          {magicSent && (
            <p className="text-xs opacity-75">
              Check your inbox: a sign-in link has been sent.
            </p>
          )}
        </form>
        <p className="mt-6 text-center text-[0.65rem] opacity-40">
          Access is by invitation only. Contact the Owner for a dashboard account.
        </p>
      </div>
    </div>
  );
}
