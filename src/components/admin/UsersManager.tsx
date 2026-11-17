"use client";

import { useState } from "react";
import { LoaderCircle, MailPlus } from "lucide-react";
import { inviteUser, setUserRole, setUserStatus } from "@/app/admin/(shell)/actions/site-admin";

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

  return (
    <div>
      <div className="admin-surface p-4">
        <h2 className="mb-3 font-display text-lg">Invite a teammate</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-40">
            <label className="admin-label">Full name</label>
            <input className="admin-input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="flex-1 min-w-48">
            <label className="admin-label">Email</label>
            <input className="admin-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
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
              const res = await inviteUser(email.trim(), role, fullName.trim());
              setBusy(false);
              setMessage(res.ok ? "Invitation sent by email." : res.error ?? "Failed");
              if (res.ok) window.location.reload();
            }}
          >
            <MailPlus size={13} /> Invite
          </button>
        </div>
        {busy && <LoaderCircle size={13} className="mt-2 animate-spin" />}
        {message && <p className="mt-2 text-xs opacity-80">{message}</p>}
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
                    <button
                      className="admin-btn admin-btn-ghost !py-1"
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
