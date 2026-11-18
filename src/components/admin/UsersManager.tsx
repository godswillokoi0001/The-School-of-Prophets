"use client";

import { useState } from "react";
import { LoaderCircle, MailPlus, Trash2 } from "lucide-react";
import { deleteUser, inviteUser, setUserRole, setUserStatus } from "@/app/admin/(shell)/actions/site-admin";

type Member = {
  id: string; email: string; full_name: string; role: string;
  status: string; created_at: string;
};

const ROLES = [
  { v: "owner", l: "Owner — everything, including users and settings" },
  { v: "admin", l: "Admin — content, inbox and bookings" },
  { v: "moderator", l: "Moderator — inbox, testimonies and prayer only" },
  { v: "viewer", l: "Viewer — read-only" },
];

export function UsersManager({ members, selfId }: { members: Member[]; selfId: string }) {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("admin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [copied, setCopied] = useState(false);

  return (
    <div>
      <div className="admin-surface p-4">
        <h2 className="mb-3 font-display text-lg">Invite a teammate</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-40">
            <label className="admin-label">Full name</label>
            <input className="admin-input" placeholder="e.g. John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="flex-1 min-w-48">
            <label className="admin-label">Email</label>
            <input className="admin-input" placeholder="name@domain.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Role</label>
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.v} value={r.v}>{r.l.split(" — ")[0]}</option>
              ))}
            </select>
          </div>
          <button
            className="admin-btn admin-btn-gold"
            disabled={busy || !email}
            onClick={async () => {
              setBusy(true);
              setMessage("");
              setLastInviteLink("");
              const res = await inviteUser(email.trim(), role, fullName.trim());
              setBusy(false);
              if (res.ok) {
                setMessage(res.message || "Invitation email sent successfully.");
                if (res.inviteLink) setLastInviteLink(res.inviteLink);
                setEmail("");
                setFullName("");
                setTimeout(() => window.location.reload(), 2500);
              } else {
                setMessage(res.error ?? "Failed to send invitation.");
              }
            }}
          >
            <MailPlus size={13} /> Invite
          </button>
        </div>
        {busy && (
          <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
            <LoaderCircle size={13} className="animate-spin text-gold" />
            <span>Sending branded invitation email…</span>
          </div>
        )}
        {message && (
          <div className="mt-3 p-3 rounded bg-gold/10 border border-gold/30 text-xs">
            <p className="font-semibold text-parchment">{message}</p>
            {lastInviteLink && (
              <div className="mt-2 flex items-center gap-2">
                <span className="opacity-70">Invite link:</span>
                <input
                  readOnly
                  value={lastInviteLink}
                  className="admin-input !py-1 text-xs font-mono flex-1 !bg-black/30"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-ghost !py-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(lastInviteLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy Link"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-surface mt-4 overflow-x-auto">
        <table className="admin-table min-w-[560px]">
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id} className="admin-row">
                <td>{m.full_name || "—"}{m.id === selfId && <span className="ml-1 admin-badge">You</span>}</td>
                <td className="opacity-70">{m.email}</td>
                <td>
                  <select
                    className="admin-select !py-1 text-xs"
                    value={m.role}
                    onChange={async (e) => {
                      if (!confirm(`Change ${m.email}'s role to ${e.target.value}?`)) return;
                      setBusy(true);
                      const res = await setUserRole(m.id, e.target.value);
                      setBusy(false);
                      if (!res.ok) alert(res.error ?? "Failed");
                      window.location.reload();
                    }}
                    aria-label={`Role for ${m.email}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r.v} value={r.v}>{r.v}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <span className={`admin-badge ${m.status === "active" ? "admin-badge-ok" : "admin-badge-bad"}`}>{m.status}</span>
                </td>
                <td>
                  {m.id !== selfId && (
                    <div className="flex items-center gap-1.5">
                      <button
                        className="admin-btn admin-btn-ghost !py-1 text-xs"
                        disabled={busy}
                        onClick={async () => {
                          const next = m.status === "active" ? "inactive" : "active";
                          if (!confirm(next === "inactive" ? `Deactivate ${m.email}? They will lose access immediately.` : `Reactivate ${m.email}?`)) return;
                          setBusy(true);
                          const res = await setUserStatus(m.id, next);
                          setBusy(false);
                          if (!res.ok) alert(res.error ?? "Failed");
                          window.location.reload();
                        }}
                      >
                        {m.status === "active" ? "Deactivate" : "Reactivate"}
                      </button>
                      <button
                        className="admin-btn !border-red-500/40 !bg-red-500/10 !text-red-400 hover:!bg-red-500/20 !py-1 text-xs"
                        disabled={busy}
                        title="Delete user"
                        onClick={async () => {
                          if (!confirm(`Are you sure you want to permanently delete user ${m.email} (${m.full_name || "No name"})? This action cannot be undone.`)) return;
                          setBusy(true);
                          const res = await deleteUser(m.id);
                          setBusy(false);
                          if (!res.ok) alert(res.error ?? "Failed to delete user");
                          window.location.reload();
                        }}
                      >
                        <Trash2 size={12} className="mr-1 inline" /> Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs opacity-60">
        Owners can also change their own password with “Forgot password” on the
        sign-in page. Two-factor authentication (TOTP) can be enabled per user in
        Supabase Auth settings; it is enforced for the Owner before launch.
      </p>
    </div>
  );
}
