"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, LoaderCircle, Send, RotateCcw, Eye, CheckCircle2 } from "lucide-react";
import { sendBroadcast, snippetFor } from "@/app/admin/(shell)/actions/site-admin";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { RichTextEditor, RichTextView } from "@/components/admin/RichText";

type RefOption = { kind: "teaching" | "event"; id: string; label: string };

export type BroadcastRecord = {
  id: string;
  subject: string;
  body: string;
  segment: string;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
  stats: Record<string, unknown> | null;
  created_at: string;
};

export function BroadcastComposer({
  options,
  pastBroadcasts = [],
}: {
  options: RefOption[];
  pastBroadcasts?: BroadcastRecord[];
}) {
  const router = useRouter();
  const composerRef = useRef<HTMLFormElement>(null);
  const [broadcastList, setBroadcastList] =
    useState<BroadcastRecord[]>(pastBroadcasts);
  const [page, setPage] = useState(1);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [scheduled, setScheduled] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [snippet, setSnippet] = useState("");
  const [ref, setRef] = useState(options[0]?.id ?? "");

  useEffect(() => {
    setBroadcastList(pastBroadcasts);
  }, [pastBroadcasts]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalMode, setModalMode] = useState<
    "danger" | "warning" | "info" | "success"
  >("warning");
  const [modalConfirmLabel, setModalConfirmLabel] = useState<
    string | undefined
  >(undefined);
  const [pendingAction, setPendingAction] = useState<
    (() => Promise<void>) | null
  >(null);

  // Content Preview Modal
  const [previewContent, setPreviewContent] = useState<BroadcastRecord | null>(
    null,
  );

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

  function handleSendClick(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) return;

    if (scheduled) {
      openConfirm({
        title: "Schedule Broadcast",
        message: `Schedule this newsletter to be sent to the "${segment}" list on ${new Date(
          scheduled,
        ).toLocaleString("en-GB")}?`,
        mode: "info",
        confirmLabel: "Schedule Broadcast",
        onConfirm: async () => {
          setBusy(true);
          const res = (await sendBroadcast(
            subject,
            body,
            segment,
            scheduled,
          )) as {
            ok: boolean;
            message?: string;
            error?: string;
            broadcast?: BroadcastRecord;
          };
          setBusy(false);
          setMessage(
            res.ok
              ? (res.message ?? "Scheduled successfully.")
              : (res.error ?? "Failed"),
          );
          if (res.ok) {
            if (res.broadcast) {
              setBroadcastList((prev) => [res.broadcast!, ...prev]);
            }
            setSubject("");
            setBody("");
            setScheduled("");
            router.refresh();
          }
        },
      });
    } else {
      openConfirm({
        title: "Send Newsletter Now",
        message: `Send this newsletter to "${segment}" recipients right now? This action cannot be undone.`,
        mode: "warning",
        confirmLabel: "Send Now",
        onConfirm: async () => {
          setBusy(true);
          const res = (await sendBroadcast(subject, body, segment)) as {
            ok: boolean;
            message?: string;
            error?: string;
            broadcast?: BroadcastRecord;
          };
          setBusy(false);
          setMessage(
            res.ok
              ? (res.message ?? "Dispatched successfully.")
              : (res.error ?? "Failed"),
          );
          if (res.ok) {
            if (res.broadcast) {
              setBroadcastList((prev) => [res.broadcast!, ...prev]);
            }
            setSubject("");
            setBody("");
            setScheduled("");
            router.refresh();
          }
        },
      });
    }
  }

  function loadIntoComposer(b: BroadcastRecord) {
    setSubject(b.subject);
    setBody(b.body);
    setSegment(b.segment);
    setMessage(
      `Loaded broadcast "${b.subject}" into composer. You can now modify and resend or schedule it.`,
    );
    composerRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <form
          ref={composerRef}
          onSubmit={handleSendClick}
          className="admin-surface p-4"
        >
          <h2 className="mb-3 font-display text-lg">Compose Email Broadcast</h2>
          <div className="flex items-center justify-between mb-1">
            <label className="admin-label !mb-0">Subject</label>
            <span className="text-[10px] opacity-60">
              {Math.max(0, 120 - subject.length)} characters left
            </span>
          </div>
          <input
            className="admin-input mb-3"
            required
            maxLength={120}
            placeholder="e.g. A Word for the Season: The School of Prophets"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex items-center justify-between mb-1">
            <label className="admin-label !mb-0">Message & Announcement</label>
            <span className="text-[10px] opacity-60">
              Personalize with &#123;&#123;name&#125;&#125; or &#123;&#123;first_name&#125;&#125;
            </span>
          </div>
          <div className="mb-3">
            <RichTextEditor
              value={body}
              onChange={setBody}
              ariaLabel="Newsletter broadcast message"
            />
          </div>
          <label className="admin-label">Audience Segment</label>
          <select
            className="admin-select mb-3"
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
          >
            <option value="all">All subscribers (Site newsletter list)</option>
            <option value="waitlist">Waitlist entries (Training)</option>
            <option value="applicants">Applicants (Enrolments)</option>
          </select>
          <label className="admin-label">Schedule Date & Time (Optional)</label>
          <input
            className="admin-input mb-3"
            type="datetime-local"
            value={scheduled}
            onChange={(e) => setScheduled(e.target.value)}
          />
          <div className="flex items-center gap-2">
            <button className="admin-btn admin-btn-gold" disabled={busy}>
              {busy ? (
                <LoaderCircle size={13} className="animate-spin mr-1" />
              ) : (
                <Send size={13} className="mr-1 inline" />
              )}
              {scheduled ? "Schedule Broadcast" : "Send Newsletter Now"}
            </button>
            {subject && (
              <button
                type="button"
                className="admin-btn admin-btn-ghost text-xs"
                onClick={() => {
                  setSubject("");
                  setBody("");
                  setScheduled("");
                  setMessage("");
                }}
              >
                Clear
              </button>
            )}
          </div>
          {message && (
            <p className="mt-2 text-xs border border-gold/30 bg-gold/10 p-2 rounded text-gold">
              {message}
            </p>
          )}
        </form>

        <div className="admin-surface p-4">
          <h2 className="mb-3 font-display text-lg">
            WhatsApp / Telegram Snippet
          </h2>
          <p className="mb-2 text-xs opacity-60">
            Generate a ready-to-copy announcement for any published teaching or
            upcoming event.
          </p>
          <div className="flex gap-2">
            <select
              className="admin-select"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
              aria-label="Choose teaching or event"
            >
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="admin-btn admin-btn-ghost"
              onClick={async () => {
                const option = options.find((o) => o.id === ref);
                if (!option) return;
                setBusy(true);
                const res = await snippetFor(option.kind, ref);
                setBusy(false);
                setSnippet(res.ok ? res.text : "Not found.");
              }}
            >
              Generate
            </button>
          </div>
          {snippet && (
            <>
              <textarea
                className="admin-textarea mt-3 font-mono text-xs !min-h-36"
                value={snippet}
                readOnly
                aria-label="Generated snippet"
              />
              <button
                type="button"
                className="admin-btn admin-btn-gold mt-2"
                onClick={() => navigator.clipboard.writeText(snippet)}
              >
                <Copy size={13} className="mr-1 inline" /> Copy Snippet
              </button>
            </>
          )}
        </div>
      </div>

      {/* Past Sent Newsletters & Broadcasts */}
      <section className="admin-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg">
              Sent Newsletters & Past Broadcasts
            </h2>
            <p className="text-xs opacity-60">
              Access previously sent messages. Click &ldquo;Load & Modify&rdquo;
              to reuse, edit, and resend.
            </p>
          </div>
        </div>

        {broadcastList.length === 0 ? (
          <p className="p-6 text-center text-xs opacity-60">
            No previous broadcasts recorded. Sent newsletters will appear here.
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="admin-table min-w-[600px]">
                <thead>
                  <tr>
                    <th>Subject</th>
                    <th>Audience</th>
                    <th>Status</th>
                    <th>Date (WAT)</th>
                    <th>Delivery</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {broadcastList.slice((page - 1) * 10, page * 10).map((b) => {
                    const sentCount = (b.stats as { sent?: number })?.sent;
                    const recCount = (b.stats as { recipients?: number })
                      ?.recipients;
                    return (
                      <tr key={b.id} className="admin-row hover:bg-parchment/5">
                        <td className="max-w-[220px]">
                          <span className="font-medium text-parchment line-clamp-1">
                            {b.subject}
                          </span>
                          <span className="text-[0.7rem] opacity-60 line-clamp-1">
                            {b.body}
                          </span>
                        </td>
                        <td className="text-xs opacity-75 capitalize">
                          {b.segment}
                        </td>
                        <td>
                          <span
                            className={`admin-badge ${
                              b.status === "sent"
                                ? "admin-badge-ok"
                                : b.status === "scheduled"
                                  ? "admin-badge-warn"
                                  : ""
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="text-xs whitespace-nowrap opacity-70">
                          {new Date(
                            b.sent_at || b.scheduled_at || b.created_at,
                          ).toLocaleString("en-GB", {
                            timeZone: "Africa/Lagos",
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td className="text-xs opacity-75">
                          {sentCount !== undefined && recCount !== undefined ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <CheckCircle2 size={12} /> {sentCount} /{" "}
                              {recCount}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost !py-1 text-xs"
                              title="Load and modify this newsletter"
                              onClick={() => loadIntoComposer(b)}
                            >
                              <RotateCcw size={12} className="mr-1 inline" />{" "}
                              Load & Modify
                            </button>
                            <button
                              type="button"
                              className="admin-btn admin-btn-ghost !py-1 text-xs opacity-70 hover:opacity-100"
                              title="View content"
                              onClick={() => setPreviewContent(b)}
                            >
                              <Eye size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <AdminPagination
              totalItems={broadcastList.length}
              pageSize={10}
              currentPage={page}
              onPageChange={setPage}
            />
          </>
        )}
      </section>

      {/* Broadcast Content View Modal */}
      {previewContent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
          <div className="admin-surface max-w-xl w-full p-6 border border-gold/40 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-parchment/10 pb-3">
              <div>
                <span className="admin-badge admin-badge-ok mb-1 inline-block">
                  {previewContent.status}
                </span>
                <h3 className="font-display text-lg text-parchment">
                  {previewContent.subject}
                </h3>
                <p className="text-xs opacity-60">
                  Sent to: {previewContent.segment}
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn-ghost !p-1 text-xs"
                onClick={() => setPreviewContent(null)}
              >
                Close
              </button>
            </div>
            <div className="mt-4 text-sm leading-relaxed text-parchment/85 font-sans">
              <RichTextView html={previewContent.body} />
            </div>
            <div className="mt-6 flex justify-end gap-2 border-t border-parchment/10 pt-4">
              <button
                type="button"
                className="admin-btn admin-btn-gold text-xs"
                onClick={() => {
                  loadIntoComposer(previewContent);
                  setPreviewContent(null);
                }}
              >
                <RotateCcw size={12} className="mr-1 inline" /> Load into
                Composer to Modify
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Confirmation Modal */}
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
