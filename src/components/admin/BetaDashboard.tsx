"use client";

import { useState } from "react";
import Link from "next/link";
import { Download, LoaderCircle, Trash2 } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import {
  createTestimonyFromBeta,
  removeSampleBeta,
  setBetaConsent,
  setBetaOpen,
  setBetaStatus,
  setBetaStory,
} from "@/app/admin/(shell)/actions/beta";
import {
  AREAS,
  CONSENT_OPTIONS,
  RATING_LABELS,
  consentLabel,
  isHighPriority,
  type BetaPayload,
  type StoryConsent,
} from "@/lib/beta";

export type BetaListRow = {
  id: string;
  status: string;
  created_at: string;
  tags: string[];
  assignee: string | null;
  payload: BetaPayload;
};

export type BetaStats = {
  total: number;
  average: number;
  rated: number;
  priority: number;
  distribution: { rating: number; count: number }[];
  areas: { key: string; average: number; count: number }[];
  issues: {
    page: string;
    description: string;
    severity: string;
    submissionId: string;
    name: string;
    email: string;
    created_at: string;
    status: string;
  }[];
  devices: { label: string; count: number }[];
  browsers: { label: string; count: number }[];
  words: { word: string; count: number }[];
  tags: { label: string; count: number }[];
};

export function BetaDashboard({
  rows,
  stats,
  open,
  sampleCount,
}: {
  rows: BetaListRow[];
  stats: BetaStats;
  open: boolean;
  sampleCount: number;
}) {
  const [tab, setTab] = useState<"overview" | "issues" | "stories">("overview");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [betaOpen, setOpen] = useState(open);
  const [pageFilter, setPageFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [modal, setModal] = useState<{ title: string; message: string; action: () => void } | null>(null);

  async function run(
    fn: () => Promise<{ ok?: boolean; error?: string; message?: string }>,
    done: string,
  ) {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    setMessage(res?.ok ? res.message || done : res?.error || "That did not work.");
    if (res?.ok) window.setTimeout(() => window.location.reload(), 900);
  }

  const stories = rows.filter((row) => row.payload.story && String(row.payload.story).trim().length > 0);
  const pages = [...new Set(stats.issues.map((issue) => issue.page))].sort();
  const severities = [...new Set(stats.issues.map((issue) => issue.severity))];
  const filteredIssues = stats.issues.filter(
    (issue) =>
      (pageFilter === "all" || issue.page === pageFilter) &&
      (severityFilter === "all" || issue.severity === severityFilter),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Beta feedback</h1>
          <p className="text-xs opacity-60">
            Reviews from the fellowship, in their own words. Every one also lands in the
            Inbox and the notification bell.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/api/admin/beta/export" className="admin-btn admin-btn-ghost">
            <Download size={13} /> Export CSV
          </a>
          <Link href="/admin/inbox?type=beta_feedback" className="admin-btn admin-btn-ghost">
            Open in inbox
          </Link>
        </div>
      </div>

      <div className="admin-surface mb-3 flex flex-wrap items-center justify-between gap-3 p-3">
        <div>
          <p className="admin-label">Accepting reviews</p>
          <p className="text-sm">
            {betaOpen ? (
              <span className="text-[#8fd0a0]">Open — /beta-testers shows the form.</span>
            ) : (
              <span className="text-[#e6b566]">Closed — the page shows a thank-you and no form.</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {sampleCount > 0 && (
            <button
              className="admin-btn admin-btn-ghost"
              disabled={busy}
              onClick={() =>
                setModal({
                  title: "Remove sample reviews",
                  message: `Delete ${sampleCount} sample review${sampleCount === 1 ? "" : "s"}? Real responses are untouched. This cannot be undone.`,
                  action: () => void run(() => removeSampleBeta(), "Samples removed"),
                })
              }
            >
              <Trash2 size={13} /> Remove {sampleCount} sample{sampleCount === 1 ? "" : "s"}
            </button>
          )}
          <button
            disabled={busy}
            onClick={() => {
              const next = !betaOpen;
              setModal({
                title: next ? "Reopen the beta?" : "Stop accepting feedback?",
                message: next
                  ? "The form will return on /beta-testers and reviews will be collected again."
                  : "The form is replaced with a thank-you message and the page is removed from navigation. Every response already received is kept.",
                action: () => {
                  setOpen(next);
                  void run(() => setBetaOpen(next), next ? "Beta reopened" : "Beta closed");
                },
              });
            }}
            className={`admin-btn ${betaOpen ? "admin-btn-danger" : "admin-btn-gold"}`}
          >
            {betaOpen ? "Stop accepting feedback" : "Reopen the beta"}
          </button>
        </div>
      </div>

      <div className="mb-3 flex gap-1 border-b border-parchment/15">
        {[
          { key: "overview", label: "Overview" },
          { key: "issues", label: `Issues (${stats.issues.length})` },
          { key: "stories", label: `Stories (${stories.length})` },
        ].map((entry) => (
          <button
            key={entry.key}
            onClick={() => setTab(entry.key as typeof tab)}
            data-active={tab === entry.key}
            className="border-b-2 border-transparent px-3 py-2 text-xs font-semibold uppercase tracking-widest opacity-60 data-[active=true]:border-gold data-[active=true]:text-gold-soft data-[active=true]:opacity-100"
          >
            {entry.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Responses" value={String(stats.total)} />
            <Stat
              label="Average rating"
              value={stats.rated ? `${stats.average.toFixed(1)}/5` : "—"}
              hint={stats.rated ? `${stats.rated} rated` : "No ratings yet"}
            />
            <Stat label="Priority" value={String(stats.priority)} hint="1–2 ratings or something broke" />
            <Stat label="Stories" value={String(stories.length)} hint="Shared with consent" />
          </div>

          <section className="admin-surface p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg">Rating distribution</h2>
              <span className="text-[0.65rem] uppercase tracking-widest opacity-50">All time</span>
            </div>
            <div className="mt-3 space-y-2">
              {[...stats.distribution].reverse().map((entry) => {
                const max = Math.max(1, ...stats.distribution.map((d) => d.count));
                return (
                  <div key={entry.rating} className="flex items-center gap-3 text-xs">
                    <span className="w-24 opacity-70">
                      {entry.rating} · {RATING_LABELS[entry.rating]}
                    </span>
                    <span className="h-2 flex-1 bg-parchment/10">
                      <span
                        className="block h-full bg-gold"
                        style={{ width: `${(entry.count / max) * 100}%` }}
                      />
                    </span>
                    <span className="w-6 text-right">{entry.count}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-2">
            <section className="admin-surface p-4">
              <h2 className="font-display text-lg">Average by area</h2>
              <div className="mt-3 space-y-2">
                {stats.areas.map((area) => (
                  <div key={area.key} className="flex items-center gap-3 text-xs">
                    <span className="w-36 opacity-70">
                      {AREAS.find((a) => a.key === area.key)?.label ?? area.key}
                    </span>
                    <span className="h-2 flex-1 bg-parchment/10">
                      <span
                        className="block h-full bg-gold"
                        style={{ width: `${(area.average / 5) * 100}%` }}
                      />
                    </span>
                    <span className="w-16 text-right">
                      {area.count ? `${area.average.toFixed(1)}/5` : "—"}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-surface p-4">
              <h2 className="font-display text-lg">Device &amp; browser</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <CountList title="Device" rows={stats.devices} />
                <CountList title="Browser" rows={stats.browsers} />
              </div>
            </section>
          </div>

          <section className="admin-surface p-4">
            <h2 className="font-display text-lg">Themes</h2>
            <p className="admin-hint">Counted words and tags. No interpretation, no claims.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {stats.words.length === 0 && <span className="text-xs opacity-60">No words yet.</span>}
              {stats.words.map((entry) => (
                <span key={entry.word} className="admin-badge">
                  {entry.word} <span className="opacity-60">×{entry.count}</span>
                </span>
              ))}
            </div>
            {stats.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 border-t border-parchment/10 pt-3">
                {stats.tags.map((entry) => (
                  <span key={entry.label} className="admin-badge admin-badge-new">
                    {entry.label} <span className="opacity-60">×{entry.count}</span>
                  </span>
                ))}
              </div>
            )}
          </section>

          <section className="admin-surface p-4">
            <h2 className="font-display text-lg">Recent reviews</h2>
            <ul className="mt-2 text-sm">
              {rows.slice(0, 8).map((row) => (
                <li key={row.id} className="admin-row flex items-center justify-between gap-3 py-2">
                  <Link href={`/admin/inbox/${row.id}`} className="min-w-0 hover:text-gold-soft">
                    <span className="font-semibold">{row.payload.name || "A tester"}</span>
                    <span className="opacity-70">
                      {" "}
                      · {row.payload.overall_rating ?? "—"}/5 · {row.status.replace("_", " ")}
                    </span>
                    {isHighPriority(row.payload) && (
                      <span className="admin-badge admin-badge-bad ml-2">Priority</span>
                    )}
                  </Link>
                  <span className="shrink-0 text-[0.65rem] opacity-50">
                    {new Date(row.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </li>
              ))}
              {rows.length === 0 && (
                <li className="py-2 text-xs opacity-60">
                  No reviews yet. Share /beta-testers with the fellowship.
                </li>
              )}
            </ul>
          </section>
        </div>
      )}

      {tab === "issues" && (
        <div className="admin-surface p-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display text-lg">Reported issues</h2>
            <div className="flex flex-wrap gap-2">
              <select
                className="admin-select !w-auto"
                value={pageFilter}
                onChange={(e) => setPageFilter(e.target.value)}
                aria-label="Filter by page"
              >
                <option value="all">All pages</option>
                {pages.map((page) => (
                  <option key={page} value={page}>
                    {page}
                  </option>
                ))}
              </select>
              <select
                className="admin-select !w-auto"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                aria-label="Filter by severity"
              >
                <option value="all">All severities</option>
                {severities.map((severity) => (
                  <option key={severity} value={severity}>
                    {severity}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <table data-stack className="admin-table mt-3">
            <thead>
              <tr>
                <th>Page</th>
                <th>Severity</th>
                <th>What happened</th>
                <th>Reporter</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map((issue, index) => (
                <tr key={`${issue.submissionId}-${index}`} className="admin-row">
                  <td data-label="Where" className="whitespace-nowrap">{issue.page}</td>
                  <td data-label="Severity">
                    <span
                      className={`status ${
                        issue.severity === "Something broke"
                          ? "status-bad"
                          : issue.severity === "Hard to use"
                            ? "status-warn"
                            : "status-neutral"
                      }`}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td data-label="What happened" className="max-w-xs">
                    <span className="line-clamp-2">{issue.description}</span>
                  </td>
                  <td data-label="Reporter" className="whitespace-nowrap">
                    <Link href={`/admin/inbox/${issue.submissionId}`} className="admin-link">
                      {issue.name || "A tester"}
                    </Link>
                  </td>
                  <td data-label="Status">
                    <span className="status status-neutral">{issue.status.replace("_", " ")}</span>
                  </td>
                  <td data-cell="full">
                    <button
                      className="admin-btn admin-btn-ghost !py-1"
                      disabled={busy}
                      onClick={() =>
                        setModal({
                          title: "Mark fixed",
                          message:
                            "Mark this review fixed and email the tester the “We fixed what you found” note?",
                          action: () =>
                            void run(
                              () => setBetaStatus(issue.submissionId, "fixed", true),
                              "Marked fixed and emailed",
                            ),
                        })
                      }
                    >
                      Mark fixed
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredIssues.length === 0 && (
            <p className="py-4 text-center text-xs opacity-60">Nothing reported in this filter.</p>
          )}
        </div>
      )}

      {tab === "stories" && (
        <div className="space-y-3">
          {stories.length === 0 && (
            <p className="admin-surface p-4 text-xs opacity-60">
              No stories yet. The last step of the form invites them, with consent.
            </p>
          )}
          {stories.map((row) => (
            <StoryCard
              key={row.id}
              row={row}
              busy={busy}
              onSave={(story, status) =>
                run(() => setBetaStory(row.id, story, status), status === "approved" ? "Approved" : "Saved")
              }
              onConsent={(consent) => run(() => setBetaConsent(row.id, consent), "Consent updated")}
              onCreate={() =>
                setModal({
                  title: "Create a testimony draft",
                  message:
                    "This adds the story to the Testimonies inbox as a draft, using the consent on record. Nothing becomes public until you approve it there.",
                  action: () => void run(() => createTestimonyFromBeta(row.id), "Draft created"),
                })
              }
            />
          ))}
        </div>
      )}

      {(busy || message) && (
        <p className="mt-3 flex items-center gap-2 text-xs opacity-80">
          {busy && <LoaderCircle size={12} className="animate-spin" />}
          {message}
        </p>
      )}

      <AdminModal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.title ?? ""}
        message={modal?.message ?? ""}
        mode="info"
        confirmLabel="Continue"
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

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="admin-surface p-4">
      <p className="admin-label">{label}</p>
      <p className="font-display text-3xl text-gold-soft">{value}</p>
      {hint && <p className="text-[0.65rem] opacity-60">{hint}</p>}
    </div>
  );
}

function CountList({ title, rows }: { title: string; rows: { label: string; count: number }[] }) {
  return (
    <div>
      <p className="admin-label">{title}</p>
      <ul className="mt-1 text-xs">
        {rows.length === 0 && <li className="opacity-60">No data</li>}
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between border-b border-parchment/10 py-1">
            <span className="opacity-80">{row.label}</span>
            <span>{row.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StoryCard({
  row,
  busy,
  onSave,
  onConsent,
  onCreate,
}: {
  row: BetaListRow;
  busy: boolean;
  onSave: (story: string, status: "draft" | "approved") => void;
  onConsent: (consent: StoryConsent) => void;
  onCreate: () => void;
}) {
  const [story, setStory] = useState(String(row.payload.story ?? ""));
  const [consent, setConsent] = useState<StoryConsent>(row.payload.story_consent ?? "private");
  const canPublish = consent === "public_named" || consent === "public_anonymous";

  return (
    <section className="admin-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="font-display text-base">{row.payload.name || "A tester"}</h2>
        <span className={`admin-badge ${consent === "private" ? "admin-badge-warn" : "admin-badge-ok"}`}>
          {consentLabel(consent)}
        </span>
        {row.payload.story_status === "approved" && (
          <span className="admin-badge admin-badge-ok">Approved</span>
        )}
        <Link href={`/admin/inbox/${row.id}`} className="admin-link ml-auto text-xs">
          Full review
        </Link>
      </div>
      <textarea
        className="admin-textarea mt-2"
        value={story}
        onChange={(e) => setStory(e.target.value)}
        maxLength={1500}
        aria-label={`Story from ${row.payload.name || "tester"}`}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button className="admin-btn admin-btn-ghost" disabled={busy} onClick={() => onSave(story, "draft")}>
          Save edits
        </button>
        <button
          className="admin-btn admin-btn-ghost"
          disabled={busy}
          onClick={() => onSave(story, "approved")}
        >
          Approve
        </button>
        <select
          className="admin-select !w-auto"
          value={consent}
          onChange={(e) => setConsent(e.target.value as StoryConsent)}
          aria-label="Consent"
        >
          {CONSENT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button
          className="admin-btn admin-btn-ghost"
          disabled={busy || consent === row.payload.story_consent}
          onClick={() => onConsent(consent)}
        >
          Save consent
        </button>
        <button
          className="admin-btn admin-btn-gold"
          disabled={busy || !canPublish}
          title={canPublish ? undefined : "The tester asked us to keep this private"}
          onClick={onCreate}
        >
          Create testimony
        </button>
      </div>
      <p className="mt-2 text-[0.7rem] opacity-60">
        Display name:{" "}
        {row.payload.story_consent === "public_named"
          ? row.payload.display_name || row.payload.name || "—"
          : row.payload.story_consent === "public_anonymous"
            ? "Anonymous"
            : "Not for publication"}
      </p>
    </section>
  );
}
