import Link from "next/link";
import { training } from "@/content/ministry";

export function EnrolmentBanner({
  tone = "dark",
  showLink = true,
  status,
}: {
  tone?: "dark" | "light";
  showLink?: boolean;
  status?: "open" | "closed";
}) {
  const isOpen = (status ?? training.status) === "open";
  const dark = tone === "dark";

  return (
    <div
      className={`rounded-xl border p-6 ${
        dark
          ? "border-parchment/15 bg-parchment/[0.04] text-parchment"
          : "border-line bg-parchment text-ink"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`h-2 w-2 rounded-full ${isOpen ? "bg-gold" : "bg-ember/70"}`}
        />
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>
          {training.cohortLabel} · Enrolment {isOpen ? "open" : "closed"}
        </p>
      </div>

      <p className="mt-3 text-xl font-semibold leading-snug tracking-tight">
        {isOpen ? "The application is live." : "The waitlist is open."}
      </p>
      <p className={`mt-2 text-sm leading-relaxed ${dark ? "text-parchment/60" : "text-quiet"}`}>
        {isOpen
          ? "Complete the short application and the Prophet's team will review it personally."
          : training.cohortNote}
      </p>

      {showLink && (
        <Link href="/training" className="btn btn-gold mt-5">
          {isOpen ? "Apply for training" : "Join the waitlist"}
        </Link>
      )}
    </div>
  );
}
