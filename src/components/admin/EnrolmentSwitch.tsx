"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { toggleEnrolment } from "@/app/admin/(shell)/actions/enrolment";

export function EnrolmentSwitch({
  initialStatus,
  compact = false,
}: {
  initialStatus: "open" | "closed";
  compact?: boolean;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<"open" | "closed">(initialStatus);
  const [busy, setBusy] = useState(false);

  async function handleToggle() {
    if (busy) return;
    const nextStatus = status === "open" ? "closed" : "open";
    setStatus(nextStatus); // Optimistic update
    setBusy(true);

    try {
      const res = await toggleEnrolment();
      if (res.ok) {
        setStatus(res.status);
        router.refresh();
      } else {
        setStatus(status); // Revert on failure
      }
    } catch {
      setStatus(status);
    } finally {
      setBusy(false);
    }
  }

  const isOpen = status === "open";

  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`admin-badge font-semibold transition-colors ${
          isOpen ? "admin-badge-ok" : "admin-badge-warn"
        } ${compact ? "!text-[0.65rem] !py-0.5" : ""}`}
      >
        {isOpen ? "Open" : "Closed"}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={isOpen}
        disabled={busy}
        onClick={handleToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gold/50 ${
          isOpen ? "bg-gold" : "bg-white/20 hover:bg-white/30"
        } ${busy ? "opacity-75 cursor-wait" : ""}`}
        title={`Click to ${isOpen ? "Close" : "Open"} enrolment`}
      >
        <span className="sr-only">Toggle enrolment status</span>
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-ink shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
            isOpen ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {busy && <LoaderCircle size={10} className="animate-spin text-parchment" />}
        </span>
      </button>
    </div>
  );
}
