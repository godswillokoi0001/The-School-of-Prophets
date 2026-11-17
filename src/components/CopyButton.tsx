"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyButton({
  value,
  label = "Copy",
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`btn btn-outline !px-3 !py-2 ${className}`}
      aria-label={`${label}: ${value}`}
    >
      {copied ? (
        <Check aria-hidden="true" className="h-3.5 w-3.5 text-ember" />
      ) : (
        <Copy aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      <span aria-live="polite">{copied ? "Copied" : label}</span>
    </button>
  );
}
