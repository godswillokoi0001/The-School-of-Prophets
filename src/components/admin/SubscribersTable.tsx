"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, Search, Trash2, UserX } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminModal } from "@/components/admin/AdminModal";
import { deleteSubscriber } from "@/app/admin/(shell)/actions/site-admin";

export type SubscriberRow = {
  id: string;
  email: string;
  name: string;
  consent_at: string;
  unsubscribed_at: string | null;
};

export function SubscribersTable({
  rows,
  isOwner = false,
}: {
  rows: SubscriberRow[];
  isOwner?: boolean;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmLabel, setModalConfirmLabel] = useState<string | undefined>(undefined);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const pageSize = 15;

  const filtered = rows.filter((r) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      r.email.toLowerCase().includes(term) ||
      (r.name && r.name.toLowerCase().includes(term))
    );
  });

  const currentRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === currentRows.length && currentRows.length > 0) {
      setSelected(new Set());
    } else {
      setSelected(new Set(currentRows.map((r) => r.id)));
    }
  }

  function handleDeleteSingle(sub: SubscriberRow) {
    setModalTitle("Delete Subscriber");
    setModalMessage(
      `Are you sure you want to delete ${sub.email}? They will be completely removed from the newsletter list and will no longer receive any broadcasts.`
    );
    setModalConfirmLabel("Delete Subscriber");
    setPendingAction(() => async () => {
      setBusy(true);
      setFeedback(null);
      const res = await deleteSubscriber(sub.id);
      setBusy(false);
      if (res.ok) {
        setFeedback({ type: "success", message: `Subscriber ${sub.email} deleted.` });
        setSelected((prev) => {
          const next = new Set(prev);
          next.delete(sub.id);
          return next;
        });
        startTransition(() => {
          router.refresh();
        });
      } else {
        setFeedback({ type: "error", message: res.error || "Failed to delete subscriber." });
      }
    });
    setModalOpen(true);
  }

  function handleDeleteSelected() {
    if (selected.size === 0) return;
    const count = selected.size;
    setModalTitle("Bulk Delete Subscribers");
    setModalMessage(
      `Are you sure you want to permanently delete ${count} selected subscriber${
        count > 1 ? "s" : ""
      }? This action cannot be undone.`
    );
    setModalConfirmLabel(`Delete ${count} Subscriber${count > 1 ? "s" : ""}`);
    setPendingAction(() => async () => {
      setBusy(true);
      setFeedback(null);
      let deleted = 0;
      for (const id of Array.from(selected)) {
        const res = await deleteSubscriber(id);
        if (res.ok) deleted += 1;
      }
      setBusy(false);
      setSelected(new Set());
      setFeedback({
        type: "success",
        message: `Successfully deleted ${deleted} subscriber${deleted > 1 ? "s" : ""}.`,
      });
      startTransition(() => {
        router.refresh();
      });
    });
    setModalOpen(true);
  }

  return (
    <div className="space-y-3">
      {/* Search & Bulk Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-56 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
          <input
            className="admin-input !pl-9 text-xs"
            placeholder="Search subscribers by email or name…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>

        {isOwner && selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs opacity-70">
              {selected.size} selected
            </span>
            <button
              type="button"
              className="admin-btn admin-btn-danger !py-1 text-xs"
              onClick={handleDeleteSelected}
              disabled={busy}
            >
              {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Trash2 size={13} />}
              Delete Selected
            </button>
          </div>
        )}
      </div>

      {feedback && (
        <div
          className={`border p-3 text-xs ${
            feedback.type === "success"
              ? "border-[#8fd0a0]/40 text-[#8fd0a0]"
              : "border-[#ff9d8f]/40 text-[#ff9d8f]"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Main Table */}
      <div className="admin-surface overflow-x-auto">
        <table data-stack className="admin-table min-w-[540px]">
          <thead>
            <tr>
              {isOwner && (
                <th className="w-10">
                  <input
                    type="checkbox"
                    className="accent-gold h-3.5 w-3.5 rounded"
                    checked={selected.size === currentRows.length && currentRows.length > 0}
                    onChange={toggleAll}
                    aria-label="Select all current subscribers"
                  />
                </th>
              )}
              <th>Email</th>
              <th>Name</th>
              <th>Consent Date</th>
              <th>Status</th>
              {isOwner && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentRows.map((r) => (
              <tr key={r.id} className="admin-row hover:bg-parchment/5">
                {isOwner && (
                  <td data-label="" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="accent-gold h-3.5 w-3.5"
                      checked={selected.has(r.id)}
                      onChange={() => toggleOne(r.id)}
                      aria-label={`Select ${r.email}`}
                    />
                  </td>
                )}
                <td data-label="Email" className="font-medium text-parchment">{r.email}</td>
                <td data-label="Name" className="opacity-70">{r.name || "—"}</td>
                <td data-label="Joined" className="text-xs tabular-nums opacity-70">
                  {r.consent_at ? new Date(r.consent_at).toLocaleDateString("en-GB") : "—"}
                </td>
                <td data-label="Status">
                  <span className={`status ${r.unsubscribed_at ? "status-warn" : "status-ok"}`}>
                    {r.unsubscribed_at ? "Unsubscribed" : "Subscribed"}
                  </span>
                </td>
                {isOwner && (
                  <td data-cell="full" className="text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center p-1.5 border border-[#ff9d8f]/35 text-[#ff9d8f] transition-colors hover:bg-[#ff9d8f]/10"
                      title={`Delete ${r.email}`}
                      aria-label={`Delete subscriber ${r.email}`}
                      disabled={busy}
                      onClick={() => handleDeleteSingle(r)}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="p-8 text-center text-xs opacity-60 flex flex-col items-center gap-2">
            <UserX size={24} className="opacity-40" />
            <p>
              {search
                ? `No subscribers match "${search}".`
                : "No subscribers recorded yet."}
            </p>
          </div>
        )}

        <AdminPagination
          totalItems={filtered.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
          alwaysShow={true}
        />
      </div>

      {/* Confirmation Modal */}
      <AdminModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        message={modalMessage}
        mode="danger"
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
