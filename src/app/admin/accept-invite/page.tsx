"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Crest } from "@/components/Crest";
import { CheckCircle2, Eye, EyeOff, KeyRound, LoaderCircle, ShieldAlert } from "lucide-react";
import { verifyTokenAction, completeInviteAction } from "./actions";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function AcceptInvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [inviteData, setInviteData] = useState<{ email: string; role: string; fullName: string } | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!token) {
        setTokenError("No invitation token found in the URL. Please click the exact link from your email.");
        setLoading(false);
        return;
      }

      const res = await verifyTokenAction(token);
      if (!res.ok || !res.data) {
        setTokenError(res.error || "Invalid or expired invitation link.");
      } else {
        setInviteData(res.data);
      }
      setLoading(false);
    }
    verify();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match. Please retype carefully.");
      return;
    }

    setBusy(true);
    const res = await completeInviteAction(token, password);
    if (!res.ok) {
      setFormError(res.error || "Failed to set up account.");
      setBusy(false);
      return;
    }

    // Try client-side sign-in so user is logged in immediately
    try {
      const sb = createSupabaseBrowser();
      if (inviteData?.email) {
        await sb.auth.signInWithPassword({
          email: inviteData.email,
          password,
        });
      }
    } catch {
      // ignore
    }

    setBusy(false);
    setSuccess(true);
  }

  return (
    <div className="admin-body min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Crest width={52} height={60} className="text-gold" />
          <h1 className="mt-3 font-display text-2xl font-semibold">The School of Prophets</h1>
          <p className="label mt-1 text-gold-soft">Ministry Team Invitation</p>
        </div>

        <div className="admin-surface p-6 shadow-xl border border-gold/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-sm opacity-70">
              <LoaderCircle size={24} className="animate-spin text-gold" />
              <span>Verifying your invitation…</span>
            </div>
          ) : tokenError ? (
            <div className="py-4 text-center">
              <ShieldAlert size={36} className="mx-auto text-ember mb-3" />
              <h2 className="font-display text-lg font-semibold text-ember">Invitation Expired or Invalid</h2>
              <p className="mt-2 text-xs opacity-80 leading-relaxed">{tokenError}</p>
              <div className="mt-6">
                <Link href="/admin/login" className="admin-btn admin-btn-ghost w-full justify-center">
                  Go to Sign In
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="py-4 text-center">
              <CheckCircle2 size={40} className="mx-auto text-gold mb-3" />
              <h2 className="font-display text-xl font-semibold">Account Activated!</h2>
              <p className="mt-2 text-xs opacity-80 leading-relaxed">
                Your password has been successfully configured. You can now use your email (
                <strong className="text-parchment">{inviteData?.email}</strong>) and chosen password to access the
                dashboard anytime.
              </p>
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => router.push("/admin")}
                  className="admin-btn admin-btn-gold w-full justify-center"
                >
                  Enter Admin Dashboard &rarr;
                </button>
                <Link href="/admin/login" className="admin-btn admin-btn-ghost w-full justify-center text-xs">
                  Go to Sign In page
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 border-b border-parchment/10 pb-4">
                <p className="text-xs text-parchment/70">
                  Welcome, <strong className="text-parchment">{inviteData?.fullName}</strong>. You have been invited to
                  join as:
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="admin-badge admin-badge-gold text-xs uppercase tracking-wide">
                    {inviteData?.role}
                  </span>
                  <span className="text-xs opacity-60">{inviteData?.email}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="admin-label" htmlFor="password">
                    Choose your password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="admin-input !pr-10"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-parchment/50 hover:text-parchment"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="admin-label" htmlFor="confirmPassword">
                    Confirm your password
                  </label>
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="admin-input"
                    placeholder="Retype password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                {formError && <p className="text-xs admin-badge-bad">{formError}</p>}

                <button type="submit" disabled={busy} className="admin-btn admin-btn-gold mt-2 justify-center">
                  {busy ? <LoaderCircle size={14} className="animate-spin" /> : <KeyRound size={14} />}
                  Set Password & Activate Account
                </button>
              </form>
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[0.65rem] opacity-40">
          The School of Prophets &middot; Secure Ministry Dashboard
        </p>
      </div>
    </div>
  );
}
