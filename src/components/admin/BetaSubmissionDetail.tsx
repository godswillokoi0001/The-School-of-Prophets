"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, MailCheck, Phone } from "lucide-react";
import { AdminBack } from "@/components/admin/AdminBack";
import { AdminModal } from "@/components/admin/AdminModal";
import { replyByEmail } from "@/app/admin/(shell)/actions/inbox";
import {
  addBetaNote,
  assignBetaReview,
  createTestimonyFromBeta,
  setBetaConsent,
  setBetaStatus,
  setBetaStory,
  setBetaTags,
} from "@/app/admin/(shell)/actions/beta";
import {
  AREAS,
  BETA_STATUSES,
  BETA_TAGS,
  CONSENT_OPTIONS,
  RATING_LABELS,
  consentLabel,
  isHighPriority,
  type BetaPayload,
  type StoryConsent,
} from "@/lib/beta";
import type { Role } from "@/lib/admin";

export type BetaDetailRow = {
  id: string;
  status: string;
  payload: BetaPayload;
  name: string;
  email: string;
  whatsapp: string;
  created_at: string;
  tags: string[];
  assignee: string | null;
  notes: { body: string; created_at: string }[];
};

type Member = { id: string; name: string; email: string };

export function BetaSubmissionDetail({
  row,
  role,
  team,
}: {
  row: BetaDetailRow;
  role: Role;
  team: Member[];
}) {
  const p = row.payload;
  const priority = isHighPriority(p);
  const canSeeContact = role !== "viewer";
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState("");
  const [status, setStatus] = useState(row.status);
  const [notifyFixed, setNotifyFixed] = useState(true);
  const [tags, setTags] = useState<string[]>(row.tags ?? []);
  const [assignee, setAssignee] = useState(row.assignee ?? "");
  const [story, setStory] = useState(String(p.story ?? ""));
  const [consent, setConsent] = useState<StoryConsent>(p.story_consent ?? "private");
  const [note, setNote] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [replySubject, setReplySubject] = useState("About your review of The School of Prophets site");
  const [replyBody, setReplyBody] = useState("");
  const [modal, setModal] = useState<{ title: string; message: string; action: () => void } | null>(null);

  async function run(fn: () => Promise<{ ok?: boolean; error?: string; message?: string }>, done: string) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    setResult(res?.ok ? res.message || done : res?.error || "That did not work.");
    if (res?.ok) window.setTimeout(() => window.location.reload(), 900);
  }

  const waNumber = String(p.whatsapp ?? "").replace(/[^\d]/g, "");
  const rating = Number(p.overall_rating ?? 0);
  const canPublish = consent === "public_named" || consent === "public_anonymous";

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <AdminBack href="/admin/beta" label="Back to beta feedback" />
        <div className="flex gap-2">
          <Link href="/admin/inbox" className="admin-btn admin-btn-ghost !py-1">
            Inbox
          </Link>
          <button className="admin-btn admin-btn-ghost !py-1" onClick={() => window.print()}>
            Print
          </button>
        </div>
      </div>

      <div className="admin-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-xl">{row.name || "A tester"}</h1>
          <span className="admin-badge admin-badge-new">Beta review</span>
          {priority && <span className="admin-badge admin-badge-bad">Priority</span>}
          <span className="admin-badge">{status.replace("_", " ")}</span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-[13rem_1fr]">
          <div>
            <p className="admin-label">Overall</p>
            <div className="flex items-end gap-1" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={`w-5 ${n <= rating ? "bg-gold" : "bg-parchment/15"}`}
                  style={{ height: `${14 + n * 6}px` }}
                />
              ))}
            </div>
            <p className="mt-2 text-sm">
              {rating > 0 ? `${rating}/5 — ${RATING_LABELS[rating]}` : "Not rated"}
            </p>
            <p className="mt-3 text-[0.7rem] opacity-60">
              Received {new Date(row.created_at).toLocaleString("en-GB")}
            </p>
          </div>

          <dl className="grid gap-x-5 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="admin-label">Email</dt>
              <dd className="break-words">{canSeeContact ? row.email || "—" : "Hidden for viewers"}</dd>
            </div>
            <div>
              <dt className="admin-label">WhatsApp</dt>
              <dd>{canSeeContact ? p.whatsapp || "—" : "Hidden for viewers"}</dd>
            </div>
            <div>
              <dt className="admin-label">Location</dt>
              <dd>{p.location || "—"}</dd>
            </div>
            <div>
              <dt className="admin-label">Device</dt>
              <dd>
                {p.device || "—"}
                {p.meta?.browser ? ` · ${p.meta.browser}` : ""}
                {p.meta?.os ? ` · ${p.meta.os}` : ""}
              </dd>
            </div>
            <div>
              <dt className="admin-label">Screen</dt>
              <dd>{p.meta?.screen || "—"}</dd>
            </div>
            <div>
              <dt className="admin-label">Arrived from</dt>
              <dd className="truncate" title={p.meta?.referrer || ""}>
                {p.meta?.referrer || "Direct"}
              </dd>
            </div>
            <div>
              <dt className="admin-label">May contact</dt>
              <dd>{p.may_contact ? "Yes" : "No"}</dd>
            </div>
            <div>
              <dt className="admin-label">Wants a call</dt>
              <dd>{p.wants_call ? "Yes" : "No"}</dd>
            </div>
          </dl>
        </div>

        {(p.area_ratings && Object.keys(p.area_ratings).length > 0) || p.meta?.screenshot_errors ? (
          <div className="mt-4 border-t border-parchment/10 pt-3">
            <p className="admin-label">Area ratings</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {AREAS.map((area) => {
                const value = Number(p.area_ratings?.[area.key] ?? 0);
                return (
                  <div key={area.key} className="flex items-center gap-2 text-xs">
                    <span className="w-36 opacity-70">{area.label}</span>
                    <span className="h-1.5 flex-1 bg-parchment/10">
                      <span
                        className="block h-full bg-gold"
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </span>
                    <span className="w-8 text-right opacity-80">{value ? `${value}/5` : "—"}</span>
                  </div>
                );
              })}
            </div>
            {p.meta?.screenshot_errors ? (
              <p className="mt-2 text-[0.7rem] text-ember">
                {p.meta.screenshot_errors} screenshot(s) could not be stored.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-2">
        <section className="admin-surface p-4">
          <h2 className="font-display text-base">Their take</h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{p.take || "—"}</p>
          {p.liked && (
            <>
              <p className="admin-label mt-4">Liked most</p>
              <p className="whitespace-pre-line text-sm leading-relaxed opacity-85">{p.liked}</p>
            </>
          )}
          <p className="admin-label mt-4">What we can improve</p>
          <p className="whitespace-pre-line text-sm leading-relaxed opacity-85">{p.improve || "—"}</p>
          {p.wish && (
            <>
              <p className="admin-label mt-4">Wished the site could</p>
              <p className="whitespace-pre-line text-sm leading-relaxed opacity-85">{p.wish}</p>
            </>
          )}
        </section>

        <section className="admin-surface p-4">
          <h2 className="font-display text-base">
            Issues {p.issues?.length ? `(${p.issues.length})` : ""}
          </h2>
          {!p.issues || p.issues.length === 0 ? (
            <p className="mt-2 text-sm opacity-60">None reported.</p>
          ) : (
            <ul className="mt-2 space-y-3">
              {p.issues.map((issue, index) => (
                <li key={index} className="border-b border-parchment/10 pb-3 last:border-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="admin-badge">{issue.page}</span>
                    <span
                      className={`admin-badge ${
                        issue.severity === "Something broke"
                          ? "admin-badge-bad"
                          : issue.severity === "Hard to use"
                            ? "admin-badge-warn"
                            : ""
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
                    {issue.description}
                  </p>
                  {issue.screenshots?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {issue.screenshots.map((shot) => (
                        <a
                          key={shot}
                          href={`/api/admin/beta/screenshot?path=${encodeURIComponent(shot)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="block h-16 w-24 border border-parchment/20"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/api/admin/beta/screenshot?path=${encodeURIComponent(shot)}`}
                            alt={`Screenshot for issue ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="admin-surface mt-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-display text-base">Story &amp; consent</h2>
          <span
            className={`admin-badge ${
              consent === "private" ? "admin-badge-warn" : "admin-badge-ok"
            }`}
          >
            {consentLabel(consent)}
          </span>
          {p.story_status === "approved" && <span className="admin-badge admin-badge-ok">Approved</span>}
        </div>
        {p.story ? (
          <>
            <textarea
              className="admin-textarea mt-3"
              value={story}
              onChange={(e) => setStory(e.target.value)}
              maxLength={1500}
              aria-label="Story text"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                className="admin-btn admin-btn-ghost"
                disabled={busy}
                onClick={() => run(() => setBetaStory(row.id, story, "draft"), "Story saved")}
              >
                Save edits
              </button>
              <button
                className="admin-btn admin-btn-ghost"
                disabled={busy}
                onClick={() => run(() => setBetaStory(row.id, story, "approved"), "Story approved")}
              >
                Approve for publishing
              </button>
              <button
                className="admin-btn admin-btn-gold"
                disabled={busy || !canPublish}
                title={canPublish ? undefined : "The tester has not consented to publication"}
                onClick={() => run(() => createTestimonyFromBeta(row.id), "Testimony draft created")}
              >
                Create testimony
              </button>
              <p className="text-[0.7rem] opacity-60">
                Creates a draft in the Testimonies inbox. Nothing is public until approved there.
              </p>
            </div>
            <div className="mt-3">
              <label className="admin-label" htmlFor="beta-consent">
                Consent on record (change only with their written permission)
              </label>
              <div className="flex flex-wrap gap-2">
                <select
                  id="beta-consent"
                  className="admin-select max-w-xs"
                  value={consent}
                  onChange={(e) => setConsent(e.target.value as StoryConsent)}
                >
                  {CONSENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <button
                  className="admin-btn admin-btn-ghost"
                  disabled={busy || consent === p.story_consent}
                  onClick={() => run(() => setBetaConsent(row.id, consent), "Consent updated")}
                >
                  Save consent
                </button>
              </div>
            </div>
          </>
        ) : (
          <p className="mt-2 text-sm opacity-60">No story was shared with this review.</p>
        )}
      </section>

      <section className="admin-surface mt-3 p-4">
        <h2 className="font-display text-base">Workflow</h2>
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <div>
            <label className="admin-label" htmlFor="beta-status">
              Status
            </label>
            <select
              id="beta-status"
              className="admin-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {BETA_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="admin-label" htmlFor="beta-assignee">
              Assignee
            </label>
            <select
              id="beta-assignee"
              className="admin-select"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            >
              <option value="">Unassigned</option>
              {team.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email}
                </option>
              ))}
            </select>
          </div>
          <button
            className="admin-btn admin-btn-gold"
            disabled={busy}
            onClick={() => {
              const apply = async () => {
                await run(() => setBetaStatus(row.id, status, status === "fixed" && notifyFixed), "Status updated");
                if (assignee !== (row.assignee ?? "")) {
                  await run(() => assignBetaReview(row.id, assignee || null), "Assigned");
                }
              };
              if (status === "fixed" && notifyFixed) {
                setModal({
                  title: "Notify the tester?",
                  message: `Mark this review fixed and email ${row.name || "the tester"} the “We fixed what you found” note?`,
                  action: () => void apply(),
                });
              } else {
                void apply();
              }
            }}
          >
            Apply
          </button>
          {status === "fixed" && (
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                className="accent-gold"
                checked={notifyFixed}
                onChange={(e) => setNotifyFixed(e.target.checked)}
              />
              Email the tester
            </label>
          )}
        </div>

        <div className="mt-4">
          <p className="admin-label">Tags</p>
          <div className="flex flex-wrap items-center gap-2">
            {BETA_TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <label key={tag} className="flex items-center gap-1 text-xs capitalize">
                  <input
                    type="checkbox"
                    className="accent-gold"
                    checked={active}
                    onChange={() =>
                      setTags((current) =>
                        active ? current.filter((t) => t !== tag) : [...current, tag],
                      )
                    }
                  />
                  {tag}
                </label>
              );
            })}
            <button
              className="admin-btn admin-btn-ghost !py-1"
              disabled={busy}
              onClick={() => run(() => setBetaTags(row.id, tags), "Tags saved")}
            >
              Save tags
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-parchment/10 pt-3">
          {canSeeContact && row.email && (
            <>
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() => setReplyOpen((open) => !open)}
                disabled={busy}
              >
                <MailCheck size={13} /> Reply by email
              </button>
              <button
                className="admin-btn admin-btn-ghost"
                onClick={() => navigator.clipboard.writeText(row.email)}
              >
                Copy email
              </button>
            </>
          )}
          {canSeeContact && waNumber && (
            <a
              className="admin-btn admin-btn-ghost"
              href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                `Hello ${row.name || "there"}, thank you for reviewing The School of Prophets site.`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              <Phone size={13} /> Open WhatsApp
            </a>
          )}
          <Link
            href={`/admin/inbox/${row.id}`}
            className="admin-btn admin-btn-ghost"
            title="Open the general submission view"
          >
            Full record
          </Link>
        </div>

        {replyOpen && row.email && (
          <form
            className="mt-3 flex flex-col gap-3 border-t border-parchment/10 pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => replyByEmail(row.id, row.email, replySubject, replyBody), "Reply sent");
            }}
          >
            <div>
              <label className="admin-label" htmlFor="beta-reply-subject">
                Subject
              </label>
              <input
                id="beta-reply-subject"
                className="admin-input"
                value={replySubject}
                onChange={(e) => setReplySubject(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="admin-label" htmlFor="beta-reply-body">
                Message
              </label>
              <textarea
                id="beta-reply-body"
                className="admin-textarea"
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                required
              />
            </div>
            <button className="admin-btn admin-btn-gold self-start" disabled={busy}>
              <MailCheck size={13} /> Send reply
            </button>
          </form>
        )}
      </section>

      <section className="admin-surface mt-3 p-4">
        <h2 className="font-display text-base">Internal notes</h2>
        <ul className="mb-2 mt-2 text-sm">
          {row.notes.length === 0 && (
            <li className="admin-hint">No notes yet. Notes are private to the team.</li>
          )}
          {row.notes.map((entry, index) => (
            <li key={index} className="admin-row py-1">
              {entry.body}
              <span className="block text-[0.6rem] opacity-50">
                {new Date(entry.created_at).toLocaleString("en-GB")}
              </span>
            </li>
          ))}
        </ul>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void run(() => addBetaNote(row.id, note), "Note saved");
            setNote("");
          }}
        >
          <input
            className="admin-input flex-1"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a private note…"
            aria-label="New note"
          />
          <button className="admin-btn admin-btn-ghost" disabled={busy || !note.trim()}>
            Save note
          </button>
        </form>
      </section>

      {result && (
        <p className="mt-3 flex items-center gap-2 text-xs opacity-80">
          {busy && <LoaderCircle size={12} className="animate-spin" />}
          {result}
        </p>
      )}

      <AdminModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        mode="info"
        confirmLabel="Send and mark fixed"
        onConfirm={
          modal
            ? async () => {
                modal.action();
                setModal(null);
              }
            : undefined
        }
      />
    </div>
  );
}
