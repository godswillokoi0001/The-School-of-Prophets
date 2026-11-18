"use client";

import { useState } from "react";
import { AdminPagination } from "@/components/admin/AdminPagination";

export type SubscriberRow = {
  id: string;
  email: string;
  name: string;
  consent_at: string;
  unsubscribed_at: string | null;
};

export function SubscribersTable({ rows }: { rows: SubscriberRow[] }) {
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const currentRows = rows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="admin-surface overflow-x-auto">
      <table className="admin-table min-w-[480px]">
        <thead>
          <tr>
            <th>Email</th>
            <th>Name</th>
            <th>Consent</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((r) => (
            <tr key={r.id} className="admin-row">
              <td className="font-medium text-parchment">{r.email}</td>
              <td className="opacity-70">{r.name || "—"}</td>
              <td className="text-xs opacity-70">{r.consent_at.slice(0, 10)}</td>
              <td>
                <span
                  className={`admin-badge ${
                    r.unsubscribed_at ? "admin-badge-warn" : "admin-badge-ok"
                  }`}
                >
                  {r.unsubscribed_at ? "Unsubscribed" : "Active"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <p className="p-6 text-center text-sm opacity-60">No subscribers yet.</p>
      )}
      <AdminPagination
        totalItems={rows.length}
        pageSize={pageSize}
        currentPage={page}
        onPageChange={setPage}
      />
    </div>
  );
}
