"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] route error", error.digest ?? error.message);
  }, [error]);

  return (
    <section className="wrap grid gap-10 py-24 md:grid-cols-12 md:py-32">
      <div className="md:col-span-7">
        <p className="label text-ember">A fault</p>
        <h1 className="mt-5 font-display text-hero">This page did not load.</h1>
        <p className="measure mt-5 text-quiet">
          Something on our side failed while building this page. Try once more; if
          it happens again, write to the team and tell us which page you were on.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-5">
          <button type="button" onClick={reset} className="btn btn-gold">
            Try again
          </button>
          <Link href="/contact" className="link-quiet text-sm font-semibold text-ink">
            Tell the team
          </Link>
          <Link href="/" className="link-quiet text-sm text-quiet">
            Back to the beginning
          </Link>
        </div>
        {error.digest && (
          <p className="mt-8 text-xs text-quiet">Reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
