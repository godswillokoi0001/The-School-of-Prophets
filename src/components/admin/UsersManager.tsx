"use client";

import { useState } from "react";
import { LoaderCircle, MailPlus, Trash2, UserCheck, UserX } from "lucide-react";
import { deleteUser, inviteUser, setUserRole, setUserStatus } from "@/app/admin/(shell)/actions/site-admin";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

type Member = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
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
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const pagedMembers = members.slice((page - 1) * pageSize, page * pageSize);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalMode, setModalMode] = useState<"danger" | "warning" | "info" | "success">("warning");
  const [modalConfirmLabel, setModalConfirmLabel] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  function openConfirm(opts: {
    title: string;
    message: string;
    mode: "danger" | "warning" | "info" | "success";
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  }) {
    setModalTitle(opts.title);
    setModalMessage(opts.message);
    setModalMode(opts.mode);
    setModalConfirmLabel(opts.confirmLabel);
    setPendingAction(() => opts.onConfirm);
    setModalOpen(true);
  }

  function openAlert(title: string, message: string, mode: "danger" | "info" | "success" = "danger") {
    setModalTitle(title);
    setModalMessage(message);
    setModalMode(mode);
    setModalConfirmLabel(undefined);
    setPendingAction(null);
    setModalOpen(true);
  }

  return (
    <div>
      <div className="admin-surface p-4">
        <h2 className="mb-3 font-display text-lg">Invite a teammate</h2>
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-40">
            <label className="admin-label">Full name</label>
            <input
              className="admin-input"
              placeholder="e.g. John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-48">
            <label className="admin-label">Email</label>
            <input
              className="admin-input"
              placeholder="name@domain.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="admin-label">Role</label>
            <select className="admin-select" value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => (
                <option key={r.v} value={r.v}>
                  {r.l.split(" — ")[0]}
                </option>
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
                setMessage(res.message || "Invitation created successfully.");
                if (res.inviteLink) setLastInviteLink(res.inviteLink);
                setEmail("");
                setFullName("");
              } else {
                openAlert("Invitation Failed", res.error ?? "Failed to send invitation.", "danger");
              }
            }}
          >
            <MailPlus size={13} /> Invite
          </button>
        </div>
        {busy && (
          <div className="flex items-center gap-2 mt-3 text-xs opacity-80">
            <LoaderCircle size={13} className="animate-spin text-gold" />
            <span>Sending invitation and provisioning user…</span>
          </div>
        )}
        {message && (
          <div className="mt-3 p-3 rounded bg-gold/10 border border-gold/30 text-xs">
            <p className="font-semibold text-parchment">{message}</p>
            {lastInviteLink && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="opacity-75 font-medium">Direct Link:</span>
                <input
                  readOnly
                  value={lastInviteLink}
                  className="admin-input !py-1 text-xs font-mono flex-1 !bg-black/40 border-gold/30"
                />
                <button
                  type="button"
                  className="admin-btn admin-btn-gold !py-1 text-xs"
                  onClick={() => {
                    navigator.clipboard.writeText(lastInviteLink);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? "Copied!" : "Copy Invite Link"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="admin-surface mt-4 overflow-x-auto">
        <table className="admin-table min-w-[560px]">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pagedMembers.map((m) => (
              <tr key={m.id} className="admin-row">
                <td>
                  {m.full_name || "—"}
                  {m.id === selfId && <span className="ml-1 admin-badge">You</span>}
                </td>
                <td className="opacity-70">{m.email}</td>
                <td>
                  <select
                    className="admin-select !py-1 text-xs"
                    value={m.role}
                    onChange={(e) => {
                      const newRole = e.target.value;
                      openConfirm({
                        title: "Update Role",
                        message: `Change ${m.email}'s role to ${newRole}?`,
                        mode: "warning",
                        confirmLabel: "Change Role",
                        onConfirm: async () => {
                          setBusy(true);
                          const res = await setUserRole(m.id, newRole);
                          setBusy(false);
                          if (!res.ok) {
                            openAlert("Error", res.error ?? "Failed to change role", "danger");
                          } else {
                            window.location.reload();
                          }
                        },
                      });
                    }}
                    aria-label={`Role for ${m.email}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r.v} value={r.v}>
                        {r.v}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <span
                    className={`admin-badge ${
                      m.status === "active" ? "admin-badge-ok" : "admin-badge-bad"
                    }`}
                  >
                    {m.status}
                  </span>
                </td>
                <td>
                  {m.id !== selfId && (
                    <div className="flex items-center gap-2">
                      {/* Deactivate / Reactivate Icon Button */}
                      <button
                        type="button"
                        className={`inline-flex items-center justify-center p-1.5 rounded border transition-colors ${
                          m.status === "active"
                            ? "border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                            : "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                        }`}
                        disabled={busy}
                        title={m.status === "active" ? `Deactivate ${m.email}` : `Reactivate ${m.email}`}
                        aria-label={m.status === "active" ? "Deactivate" : "Reactivate"}
                        onClick={() => {
                          const next = m.status === "active" ? "inactive" : "active";
                          openConfirm({
                            title: next === "inactive" ? "Deactivate User" : "Reactivate User",
                            message:
                              next === "inactive"
                                ? `Deactivate ${m.email}? They will lose access to the admin dashboard immediately.`
                                : `Reactivate ${m.email}? Their access will be restored.`,
                            mode: next === "inactive" ? "warning" : "info",
                            confirmLabel: next === "inactive" ? "Deactivate" : "Reactivate",
                            onConfirm: async () => {
                              setBusy(true);
                              const res = await setUserStatus(m.id, next);
                              setBusy(false);
                              if (!res.ok) {
                                openAlert("Error", res.error ?? "Failed to update status", "danger");
                              } else {
                                window.location.reload();
                              }
                            },
                          });
                        }}
                      >
                        {m.status === "active" ? <UserX size={15} /> : <UserCheck size={15} />}
                      </button>

                      {/* Delete Icon Button */}
                      <button
                        type="button"
                        className="inline-flex items-center justify-center p-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
                        disabled={busy}
                        title={`Delete ${m.email}`}
                        aria-label="Delete user"
                        onClick={() => {
                          openConfirm({
                            title: "Delete User",
                            message: `Are you sure you want to permanently delete user ${m.email} (${
                              m.full_name || "No name"
                            })? This action cannot be undone.`,
                            mode: "danger",
                            confirmLabel: "Delete User",
                            onConfirm: async () => {
                              setBusy(true);
                              const res = await deleteUser(m.id);
                              setBusy(false);
                              if (!res.ok) {
                                openAlert("Error", res.error ?? "Failed to delete user", "danger");
                              } else {
                                window.location.reload();
                              }
                            },
                          });
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {members.length > pageSize && (
        <AdminPagination
          currentPage={page}
          onPageChange={setPage}
          totalItems={members.length}
          pageSize={pageSize}
        />
      )}
      <p className="mt-3 text-xs opacity-60">
        Owners can also change their own password with “Forgot password” on the
        sign-in page. Two-factor authentication (TOTP) can be enabled per user in
        Supabase Auth settings.
      </p>

      {/* Real in-app Admin Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        mode={modalMode}
        confirmLabel={modalConfirmLabel}
        onConfirm={
          pendingAction
            ? async () => {
                await pendingAction();
                setModalOpen(false);
              }
            : undefined
        }
      />
    </div>
  );
}
