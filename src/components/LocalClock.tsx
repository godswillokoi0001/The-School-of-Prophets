"use client";

import { useEffect, useState } from "react";
import type { Session } from "@/content/schedule";
import { formatLocal, nextStartFor } from "@/lib/time";

/** Renders the visitor's own time for a weekly session, after mount. */
export function LocalClock({
  day,
  start,
}: {
  day: Session["day"];
  start: string;
}) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    const session: Session = { id: "clock", day, title: "", focus: "", start };
    setLabel(formatLocal(nextStartFor(session)));
  }, [day, start]);

  return (
    <span className="tabular-nums" suppressHydrationWarning>
      {label ?? "—"}
    </span>
  );
}
