"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Archive, CheckCheck, Copy, Flag, MailCheck, Phone, Printer,
  Search, Trash2, Undo2, LoaderCircle,
} from "lucide-react";
import {
  bulkAction, setStatus, addNote, replyByEmail, decideApplication,
  approveTestimony, featureTestimony, markPrayed, restoreSubmission,
  convertWaitlist,
} from "@/app/admin/(shell)/actions/inbox";
import type { Role } from "@/lib/admin";
import { AdminBack } from "@/components/admin/AdminBack";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type SubmissionRow = {
  id: string; type: string; status: string; private: boolean;
  name: string; email: string; whatsapp: string; created_at: string;
  payload: Record<string, unknown>; notes: { body: string; created_at: string }[];
  prayedFor?: number;
};

const typeLabels: Record<string, string> = {
  enrolment: "Application", waitlist: "Waitlist", prayer: "Prayer",
  testimony: "Testimony", contact: "Message", registration: "Registration",
  booking: "Booking", newsletter: "Sign-up", beta_feedback: "Beta feedback",
};

const statusStyles: Record<string, string> = {
  new: "admin-badge-new", seen: "admin-badge-warn", in_progress: "admin-badge-warn",
  replied: "admin-badge-ok", approved: "admin-badge-ok", declined: "admin-badge-bad",
  archived: "admin-badge-warn", spam: "admin-badge-bad", prayed: "admin-badge-ok",
  answered: "admin-badge-ok", triaged: "admin-badge-new", fixed: "admin-badge-ok",
  wont_fix: "admin-badge-warn",
};

export function InboxList({ rows, role }: { rows: SubmissionRow[]; role: Role }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);

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

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function runBulk(action: string) {
    if (action === "delete") {
      openConfirm({
        title: "Delete Submissions",
        message: `Soft-delete ${selected.size} submission(s)? They can be restored for 30 days.`,
        mode: "danger",
        confirmLabel: "Delete",
        onConfirm: async () => {
          setBusy(true);
          await bulkAction([...selected], action);
          setBusy(false);
          location.reload();
        },
      });
      return;
    }
    start(async () => {
      setBusy(true);
      await bulkAction([...selected], action);
      setBusy(false);
      location.reload();
    });
  }

  function runWaitlist() {
    openConfirm({
      title: "Email Waitlist",
      message: `Email "enrolment is now open" to ${selected.size} waitlist entries?`,
      mode: "info",
      confirmLabel: "Send Email",
      onConfirm: async () => {
        setBusy(true);
        await convertWaitlist([...selected]);
        setBusy(false);
        location.reload();
      },
    });
  }

  const allWaitlist = rows.length > 0 && [...selected].every((id) => rows.find((r) => r.id === id)?.type === "waitlist");

  return (
    <div>
      {selected.size > 0 && (
        <div className="admin-surface mb-3 flex flex-wrap items-center gap-2 p-3 text-xs">
          <span>{selected.size} selected</span>
          <button className="admin-btn admin-btn-ghost !py-1" disabled={pending} onClick={() => runBulk("seen")}>
            <CheckCheck size={12} /> Mark seen
          </button>
          <button className="admin-btn admin-btn-ghost !py-1" disabled={pending} onClick={() => runBulk("archive")}>
            <Archive size={12} /> Archive
          </button>
          <button className="admin-btn admin-btn-ghost !py-1" disabled={pending} onClick={() => runBulk("spam")}>
            <Flag size={12} /> Mark spam
          </button>
          {allWaitlist && (role === "owner" || role === "admin") && (
            <button className="admin-btn admin-btn-gold !py-1" disabled={pending} onClick={runWaitlist}>
              <MailCheck size={12} /> Enrolment now open
            </button>
          )}
          {(role === "owner" || role === "admin") && (
            <button className="admin-btn admin-btn-danger !py-1" disabled={pending} onClick={() => runBulk("delete")}>
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      )}

      <div className="admin-surface overflow-x-auto">
        <table data-stack className="admin-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>From</th>
              <th>Form</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * pageSize, page * pageSize).map((r) => (
              <tr key={r.id} className="admin-row hover:bg-parchment/5">
                <td data-label="">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    aria-label={`Select submission from ${r.name}`}
                    className="accent-gold"
                  />
                </td>
                <td data-label="From">
                  <Link href={`/admin/inbox/${r.id}`} className="hover:text-gold-soft">
                    <span className="font-semibold">{r.name || "No name"}</span>
                    <span className="block text-[0.7rem] opacity-60">{r.email}</span>
                  </Link>
                </td>
                <td data-label="Form">
                  <span>{typeLabels[r.type] ?? r.type}</span>
                  {r.private && <span className="ml-2 text-[0.7rem] opacity-60">Private</span>}
                  {r.type === "beta_feedback" &&
                    (Number(r.payload.overall_rating ?? 0) <= 2 ||
                      (Array.isArray(r.payload.issues) &&
                        (r.payload.issues as { severity?: string }[]).some(
                          (issue) => issue?.severity === "Something broke",
                        ))) && (
                      <span className="ml-2 text-[0.7rem] font-semibold text-[#ff9d8f]">Needs attention</span>
                    )}
                </td>
                <td data-label="Status">
                  <span className={`status ${statusStyles[r.status] ?? "status-neutral"}`}>
                    {r.status === "wont_fix" ? "Won't fix" : r.status.replace("_", " ")}
                  </span>
                </td>
                <td data-label="Received" className="whitespace-nowrap text-[0.7rem] opacity-70">
                  {new Date(r.created_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm opacity-60">
            Nothing here yet. When someone fills a form on the site it will appear
            immediately.
          </p>
        )}
        <AdminPagination
          totalItems={rows.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
        />
        {busy && <p className="flex items-center gap-2 p-3 text-xs"><LoaderCircle size={12} className="animate-spin" /> Working…</p>}
      </div>

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

/** Plain-language names for stored fields. Nothing is hidden; it is only labelled. */
const fieldLabels: Record<string, string> = {
  name: "Name", fullName: "Full name", email: "Email", whatsapp: "WhatsApp",
  phone: "Phone", location: "Location", church: "Church", calling: "Calling",
  subject: "Subject", message: "Message", notes: "Notes", prayerRequest: "Prayer request",
  body: "Testimony", testimony: "Testimony", guests: "Guests",
  consent: "Permission to publish", availability: "Availability", slot: "Chosen time",
  overall_rating: "Overall rating", area_ratings: "Ratings by section", liked: "What worked well",
  take: "Their impression", issues: "Problems reported", improve: "What to improve",
  wish: "One wish", story: "Their story", story_consent: "Story permission",
  display_name: "Name to publish", may_contact: "May we contact them",
  wants_call: "Would like a call", device: "Device they used", meta: "Technical details",
  screenshots: "Screenshots", severity: "Severity", page: "Where",
};

function fieldLabel(key: string): string {
  return fieldLabels[key] ?? key.replace(/([A-Z])/g, " $1").replace(/_/g, " ").toLowerCase();
}

function fieldValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    return key.includes("rating") ? `${value} of 5` : String(value);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value
      .map((item) => {
        if (item && typeof item === "object") {
          return Object.entries(item as Record<string, unknown>)
            .map(([k, v]) => `${fieldLabel(k)}: ${String(v)}`)
            .join(", ");
        }
        return String(item);
      })
      .join("\n");
  }
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([k, v]) => `${fieldLabel(k)}: ${String(v)}`)
      .join(" · ");
  }
  if (/^https?:\/\//.test(String(value))) return String(value);
  return String(value);
}

export function SubmissionDetail({
  row, role,
}: {
  row: SubmissionRow;
  role: Role;
}) {
  const [busy, setBusy] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("Re: your message to The School of Prophets");
  const [replyBody, setReplyBody] = useState("");
  const [note, setNote] = useState("");
  const [prayedNote, setPrayedNote] = useState("");
  const [testimonyEdit, setTestimonyEdit] = useState(String(row.payload.testimony ?? ""));
  const [result, setResult] = useState("");

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

  async function act(fn: () => Promise<{ ok?: boolean; error?: string; result?: string; message?: string }>, done: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    setResult(res?.ok ? (res.message || done) : res?.error || res?.result || "Failed");
    if (res?.ok) location.reload();
  }

  const waNumber = String(row.whatsapp ?? row.payload.whatsapp ?? "").replace(/[^\d]/g, "");
  const waText = encodeURIComponent(`Hello ${row.name}, thank you for contacting The School of Prophets. `);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-3 flex items-center justify-between gap-2">
        <AdminBack href="/admin/inbox" label="Back to inbox" />
        <button className="admin-btn admin-btn-ghost !py-1" onClick={() => window.print()}>
          <Printer size={12} /> Print
        </button>
      </div>

      <div className="admin-surface p-4">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl">{row.name || "Submission"}</h1>
          <span className="admin-badge">{typeLabels[row.type] ?? row.type}</span>
          <span className={`admin-badge ${statusStyles[row.status] ?? ""}`}>{row.status.replace("_", " ")}</span>
          {row.private && <span className="admin-badge admin-badge-bad">Private</span>}
        </div>
        <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {Object.entries(row.payload)
            .filter(([k]) => !["prayedFor", "prayedNotes", "featured"].includes(k))
            .map(([k, v]) => (
              <div key={k} className="border-b border-parchment/10 pb-1">
                <dt className="admin-label">{fieldLabel(k)}</dt>
                <dd className="whitespace-pre-line break-words">{fieldValue(k, v)}</dd>
              </div>
            ))}
        </dl>
        <p className="mt-3 text-[0.7rem] opacity-60">
          Received {new Date(row.created_at).toLocaleString("en-GB")}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {row.email && (
          <>
            <button className="admin-btn admin-btn-ghost" onClick={() => setReplyOpen(!replyOpen)} disabled={busy}>
              <MailCheck size={13} /> Reply by email
            </button>
            <button
              className="admin-btn admin-btn-ghost"
              onClick={() => navigator.clipboard.writeText(String(row.payload.email ?? ""))}
            >
              <Copy size={13} /> Copy email
            </button>
          </>
        )}
        {waNumber && (
          <a
            className="admin-btn admin-btn-ghost"
            href={`https://wa.me/${waNumber}?text=${waText}`}
            target="_blank"
            rel="noreferrer"
          >
            <Phone size={13} /> Open WhatsApp
          </a>
        )}
        {row.type === "enrolment" && (role === "owner" || role === "admin") && (
          <>
            <button className="admin-btn admin-btn-gold" disabled={busy} onClick={() => act(() => decideApplication(row.id, "approved"), "Accepted and email sent")}>
              Accept
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => decideApplication(row.id, "waitlist"), "Moved to waitlist")}>
              Waitlist
            </button>
            <button className="admin-btn admin-btn-danger" disabled={busy} onClick={() => act(() => decideApplication(row.id, "declined"), "Declined and email sent")}>
              Decline
            </button>
          </>
        )}
        {row.type === "prayer" && (
          <div className="admin-surface flex flex-1 flex-wrap items-center gap-2 p-2">
            <input
              className="admin-input !w-auto flex-1"
              placeholder="What did you pray? (private note)"
              value={prayedNote}
              onChange={(e) => setPrayedNote(e.target.value)}
              aria-label="Private prayer note"
            />
            <button className="admin-btn admin-btn-gold" disabled={busy} onClick={() => act(async () => { const r = await markPrayed(row.id, prayedNote); return r; }, "Marked as prayed for")}>
              Mark prayed for
            </button>
            {row.prayedFor ? <span className="admin-badge admin-badge-ok">Prayed ×{row.prayedFor}</span> : null}
          </div>
        )}
        {row.type === "testimony" && (
          <>
            <button className="admin-btn admin-btn-gold" disabled={busy} onClick={() => act(() => approveTestimony(row.id, null), "Approved and now public")}>
              Approve
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => approveTestimony(row.id, testimonyEdit), "Approved with edits")}>
              Edit & approve
            </button>
            <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => featureTestimony(row.id, true), "Featured")}>
              Feature
            </button>
            <button className="admin-btn admin-btn-danger" disabled={busy} onClick={() => act(() => setStatus(row.id, "declined"), "Rejected")}>
              Reject
            </button>
          </>
        )}
        {(role === "owner" || role === "admin") && (
          <button
            className="admin-btn admin-btn-danger"
            disabled={busy}
            onClick={() => {
              openConfirm({
                title: "Move to Trash",
                message: "Move this submission to trash? It can be restored for 30 days.",
                mode: "danger",
                confirmLabel: "Move to Trash",
                onConfirm: async () => {
                  await act(() => bulkAction([row.id], "delete"), "Deleted (restorable 30 days)");
                },
              });
            }}
          >
            <Trash2 size={13} /> Delete
          </button>
        )}
        {row.status === "spam" && (
          <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => restoreSubmission(row.id), "Restored")}>
            <Undo2 size={13} /> Restore
          </button>
        )}
        <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => setStatus(row.id, "spam"), "Marked as spam")}>
          <Flag size={13} /> Spam
        </button>
        <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => act(() => setStatus(row.id, "archived"), "Archived")}>
          <Archive size={13} /> Archive
        </button>
        {result && <span className="self-center text-xs opacity-70">{result}</span>}
      </div>

      {row.type === "testimony" && (
        <div className="admin-surface mt-3 p-3">
          <label className="admin-label" htmlFor="testimony-edit">Edit before publishing</label>
          <textarea
            id="testimony-edit"
            className="admin-textarea"
            value={testimonyEdit}
            onChange={(e) => setTestimonyEdit(e.target.value)}
          />
        </div>
      )}

      {replyOpen && row.email && (
        <form
          className="admin-surface mt-3 flex flex-col gap-3 p-4"
          onSubmit={(e) => {
            e.preventDefault();
            act(() => replyByEmail(row.id, row.email, replySubject, replyBody), "Reply sent");
          }}
        >
          <div>
            <label className="admin-label" htmlFor="reply-to">To</label>
            <input id="reply-to" className="admin-input" value={row.email} readOnly />
          </div>
          <div>
            <label className="admin-label" htmlFor="reply-subject">Subject</label>
            <input id="reply-subject" className="admin-input" value={replySubject} onChange={(e) => setReplySubject(e.target.value)} required />
          </div>
          <div>
            <label className="admin-label" htmlFor="reply-body">Message</label>
            <textarea id="reply-body" className="admin-textarea" value={replyBody} onChange={(e) => setReplyBody(e.target.value)} required />
          </div>
          <button className="admin-btn admin-btn-gold" disabled={busy}>
            <MailCheck size={13} /> Send reply
          </button>
        </form>
      )}

      <section className="admin-surface mt-3 p-4">
        <h2 className="mb-2 font-display text-base">Internal notes</h2>
        <ul className="mb-2 text-sm">
          {row.notes.length === 0 && <li className="text-xs opacity-60">No notes yet. Notes are private to the team.</li>}
          {row.notes.map((n, i) => (
            <li key={i} className="admin-row py-1">
              {n.body}
              <span className="block text-[0.6rem] opacity-50">{new Date(n.created_at).toLocaleString("en-GB")}</span>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            act(() => addNote(row.id, note), "Note saved");
            setNote("");
          }}
        >
          <input className="admin-input flex-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note…" aria-label="New note" />
          <button className="admin-btn admin-btn-ghost" disabled={busy || !note.trim()}>Save note</button>
        </form>
      </section>

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

export function SearchHint() {
  return (
    <p className="mt-2 flex items-center gap-2 text-xs opacity-60">
      <Search size={12} /> Use the filters above or search from the top bar.
    </p>
  );
}
