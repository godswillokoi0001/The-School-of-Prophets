"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { Crest } from "@/components/Crest";
import { CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const sb = createSupabaseBrowser();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        sb.auth.exchangeCodeForSession(code).catch((err) => {
          console.warn("[reset-password] code exchange notice:", err);
        });
      }
    }
  }, []);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    setError("");

    try {
      const sb = createSupabaseBrowser();
      const { error: updateErr } = await sb.auth.updateUser({ password });
      if (updateErr) {
        setError(updateErr.message);
      } else {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = "/admin";
        }, 1500);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update password");
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
          <p className="label mt-1 opacity-60">Set New Password</p>
        </div>

        <div className="admin-surface p-5">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 size={36} className="text-gold mx-auto" />
              <h2 className="font-display text-lg text-parchment">Password Updated!</h2>
              <p className="text-xs opacity-70">
                Your new password has been saved. Redirecting to the admin dashboard…
              </p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="flex flex-col gap-4">
              <div>
                <label className="admin-label" htmlFor="new-password">
                  New Password (min 8 chars)
                </label>
                <input
                  id="new-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="admin-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="admin-label" htmlFor="confirm-password">
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  className="admin-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              {error && <p className="text-xs admin-badge-bad">{error}</p>}

              <button type="submit" disabled={busy} className="admin-btn admin-btn-gold">
                {busy ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <KeyRound size={14} />
                )}
                Save New Password & Sign In
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

