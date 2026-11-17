"use client";

export function WeekChart({
  data,
  labels,
}: {
  data: { type: string; count: number }[];
  labels: Record<string, string>;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  if (data.length === 0)
    return (
      <p className="text-xs opacity-60">
        No submissions in the last 7 days. When they arrive you will see a
        simple chart here, by form type.
      </p>
    );
  return (
    <ul className="space-y-2" role="img" aria-label="Submissions per form type this week">
      {data.map((d) => (
        <li key={d.type} className="flex items-center gap-3 text-xs">
          <span className="w-32 shrink-0 truncate opacity-70">
            {labels[d.type] ?? d.type}
          </span>
          <div className="h-3 flex-1 bg-parchment/5">
            <div
              className="h-3 bg-gold"
              style={{ width: `${(d.count / max) * 100}%` }}
            />
          </div>
          <span className="w-6 text-right opacity-70">{d.count}</span>
        </li>
      ))}
    </ul>
  );
}
