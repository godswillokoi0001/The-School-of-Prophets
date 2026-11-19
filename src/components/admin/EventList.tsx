"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PlusCircle, ExternalLink, Edit } from "lucide-react";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type EventRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  starts_at: string;
  format: string;
  registration_required: boolean;
};

export function EventList({ rows }: { rows: EventRow[] }) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const past = new Date().toISOString();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl">Events</h1>
          <p className="text-xs opacity-60">
            Conferences, anniversary services and special gatherings. Click any event to edit details and cover image.
          </p>
        </div>
        <Link href="/admin/events/new" className="admin-btn admin-btn-gold">
          <PlusCircle size={13} /> New event
        </Link>
      </div>

      <div className="admin-surface overflow-x-auto">
        <table data-stack className="admin-table min-w-[560px]">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>When (WAT)</th>
              <th>Format</th>
              <th>Registration</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((page - 1) * pageSize, page * pageSize).map((e) => (
              <tr
                key={e.id}
                onClick={() => router.push(`/admin/events/${e.slug}`)}
                className="admin-row cursor-pointer transition-colors hover:bg-parchment/10"
              >
                <td data-label="Event">
                  <span className="font-medium text-parchment transition-colors hover:text-gold">
                    {e.title}
                  </span>
                </td>
                <td data-label="Status">
                  <span
                    className={`status ${
                      e.status === "published"
                        ? "status-ok"
                        : e.status === "cancelled"
                        ? "status-bad"
                        : "status-neutral"
                    }`}
                  >
                    {e.status}
                    {e.starts_at < past && e.status === "published" ? " (past)" : ""}
                  </span>
                </td>
                <td data-label="When" className="whitespace-nowrap text-xs opacity-75">
                  {new Date(e.starts_at).toLocaleString("en-GB", {
                    timeZone: "Africa/Lagos",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td data-label="Format" className="text-xs capitalize opacity-75">{e.format}</td>
                <td data-label="Registration" className="text-xs opacity-75">
                  {e.registration_required ? "Required" : "Not needed"}
                </td>
                <td data-cell="full" className="text-right" onClick={(ev) => ev.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/admin/events/${e.slug}`}
                      className="admin-btn admin-btn-ghost !py-1 text-xs"
                      title="Edit event"
                    >
                      <Edit size={12} className="mr-1 inline" /> Edit
                    </Link>
                    <a
                      href="/events"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="admin-btn admin-btn-ghost !py-1 text-xs opacity-70 hover:opacity-100"
                      title="View on site"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && (
          <p className="p-8 text-center text-sm opacity-60">
            No events in database. Click &ldquo;New event&rdquo; to create one.
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
