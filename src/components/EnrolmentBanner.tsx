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
      className={`border p-6 ${dark ? "border-parchment/20 bg-ink-2/60 text-parchment" : "border-ink/20 bg-parchment-2/50 text-ink"}`}
    >
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`h-2 w-2 ${isOpen ? "bg-gold" : "bg-ember/70"}`}
        />
        <p className={`label ${dark ? "text-parchment/60" : "text-quiet"}`}>
          {training.cohortLabel} · Enrolment {isOpen ? "open" : "closed"}
        </p>
      </div>

      <p className="mt-3 font-display text-2xl leading-tight">
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
