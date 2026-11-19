"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Edit3, ExternalLink, LoaderCircle, Trash2 } from "lucide-react";
import {
  bulkTeachings,
  duplicateTeaching,
} from "@/app/admin/(shell)/actions/teachings";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type TeachingRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  series_title: string | null;
  date_taught: string | null;
  featured: boolean;
};

const statusBadge: Record<string, string> = {
  published: "admin-badge-ok",
  scheduled: "admin-badge-warn",
  draft: "admin-badge-warn",
};

export function TeachingList({
  rows,
  seriesOptions,
}: {
  rows: TeachingRow[];
  seriesOptions: { id: string; title: string }[];
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const pageSize = 12;
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState(false);
  const [bulkTag, setBulkTag] = useState("");
  const [bulkSeries, setBulkSeries] = useState("");

  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: "danger" | "warning" | "info" | "success";
    confirmLabel?: string;
    onConfirm?: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    variant: "info",
  });

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function run(action: string, value?: string, confirmMsg?: string) {
    if (confirmMsg) {
      setModalConfig({
        isOpen: true,
        title: "Confirm Bulk Action",
        description: confirmMsg,
        variant: action === "delete" ? "danger" : "info",
        confirmLabel: action === "delete" ? "Delete All" : "Confirm",
        onConfirm: () => {
          setModalConfig((m) => ({ ...m, isOpen: false }));
          executeBulk(action, value);
        },
      });
      return;
    }
    executeBulk(action, value);
  }

  function executeBulk(action: string, value?: string) {
    start(async () => {
      setBusy(true);
      await bulkTeachings([...selected], action, value);
      setBusy(false);
      window.location.reload();
    });
  }

  return (
    <div>
      <AdminModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        description={modalConfig.description}
        variant={modalConfig.variant}
        confirmLabel={modalConfig.confirmLabel}
        onConfirm={modalConfig.onConfirm}
        onCancel={() => setModalConfig((m) => ({ ...m, isOpen: false }))}
      />

      {selected.size > 0 && (
        <div className="admin-surface mb-3 flex flex-wrap items-center gap-2 p-3 text-xs">
          <span className="font-semibold text-gold">
            {selected.size} selected
          </span>
          <button
            className="admin-btn admin-btn-ghost !py-1"
            disabled={pending}
            onClick={() => run("publish")}
          >
            Publish
          </button>
          <button
            className="admin-btn admin-btn-ghost !py-1"
            disabled={pending}
            onClick={() => run("unpublish")}
          >
            Unpublish
          </button>
          <select
            className="admin-select !w-auto !py-1"
            value={bulkSeries}
            onChange={(e) => {
              setBulkSeries(e.target.value);
              if (e.target.value) run("series", e.target.value);
            }}
            aria-label="Move to series"
          >
            <option value="">Move to series…</option>
            {seriesOptions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
          <input
            className="admin-input !w-32 !py-1"
            placeholder="Add tag…"
            value={bulkTag}
            onChange={(e) => setBulkTag(e.target.value)}
            aria-label="Tag to add"
          />
          <button
            className="admin-btn admin-btn-ghost !py-1"
            disabled={!bulkTag || pending}
            onClick={() => run("tag", bulkTag)}
          >
            Tag
          </button>
          <button
            className="admin-btn admin-btn-danger !py-1"
            disabled={pending}
            onClick={() =>
              run(
                "delete",
                undefined,
                `Are you sure you want to permanently delete ${selected.size} teaching(s)? This action cannot be undone.`,
              )
            }
          >
            <Trash2 size={12} /> Delete
          </button>
          {busy && (
            <LoaderCircle size={12} className="animate-spin text-gold" />
          )}
        </div>
      )}

      <div className="admin-surface overflow-x-auto">
        <table data-stack className="admin-table min-w-[640px]">
          <thead>
            <tr>
              <th className="w-8"></th>
              <th>Title</th>
              <th>Series</th>
              <th>Status</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * pageSize, page * pageSize).map((t) => (
              <tr
                key={t.id}
                onClick={() =>
                  router.push(`/admin/teachings/${t.slug || t.id}`)
                }
                className="admin-row hover:bg-gold/10 cursor-pointer transition-colors group"
              >
                <td data-label="" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="accent-gold h-4 w-4"
                    checked={selected.has(t.id)}
                    onChange={() => toggle(t.id)}
                    aria-label={`Select ${t.title}`}
                  />
                </td>
                <td data-label="Title">
                  <span className="font-medium text-parchment transition-colors group-hover:text-gold">
                    {t.title}
                  </span>
                  {t.featured && (
                    <span className="ml-2 text-[0.65rem] uppercase tracking-[0.1em] text-gold-soft">
                      Featured
                    </span>
                  )}
                </td>
                <td data-label="Series" className="text-xs opacity-70">{t.series_title ?? "—"}</td>
                <td data-label="Status">
                  <span className={`status text-xs ${statusBadge[t.status] ?? "status-neutral"}`}>
                    {t.status}
                  </span>
                </td>
                <td data-label="Taught" className="text-xs tabular-nums opacity-70">{t.date_taught ?? "—"}</td>
                <td data-cell="full" className="text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      type="button"
                      className="admin-btn admin-btn-ghost !py-1 !px-2 text-xs"
                      title="Edit teaching"
                      onClick={() =>
                        router.push(`/admin/teachings/${t.slug || t.id}`)
                      }
                    >
                      <Edit3 size={12} className="mr-1" /> Edit
                    </button>
                    {t.status === "published" && (
                      <a
                        href={`/teachings/${t.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 opacity-60 hover:opacity-100 hover:text-gold transition-colors"
                        title="View live on website"
                      >
                        <ExternalLink size={13} />
                      </a>
                    )}
                    <button
                      type="button"
                      className="p-1.5 opacity-60 hover:opacity-100 transition-colors"
                      aria-label={`Duplicate ${t.title}`}
                      title="Duplicate as new draft"
                      onClick={() => {
                        setModalConfig({
                          isOpen: true,
                          title: "Duplicate Teaching",
                          description: `Create a duplicate draft of "${t.title}"?`,
                          variant: "info",
                          confirmLabel: "Duplicate",
                          onConfirm: async () => {
                            setModalConfig((m) => ({ ...m, isOpen: false }));
                            setBusy(true);
                            const res = await duplicateTeaching(t.id);
                            setBusy(false);
                            if (res.ok && res.id)
                              router.push(`/admin/teachings/${res.id}`);
                          },
                        });
                      }}
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-6 text-center text-sm opacity-60">
            No teachings found. Use “New teaching” to write and publish your
            first one.
          </p>
        )}
        <AdminPagination
          totalItems={rows.length}
          pageSize={pageSize}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
