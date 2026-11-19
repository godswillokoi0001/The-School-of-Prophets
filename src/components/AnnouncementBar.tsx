import Link from "next/link";
import { ArrowRight, Megaphone, TriangleAlert } from "lucide-react";
import { getAnnouncement } from "@/lib/data";
import { AnnouncementPopup } from "@/components/AnnouncementPopup";

export async function AnnouncementBar() {
  const a = await getAnnouncement();
  if (!a.active || !a.message.trim()) return null;

  const emergency = a.variant === "emergency";
  const body = (
    <span className="flex flex-wrap items-center justify-center gap-2 px-4">
      {emergency ? (
        <TriangleAlert aria-hidden="true" className="h-3.5 w-3.5" />
      ) : (
        <Megaphone aria-hidden="true" className="h-3.5 w-3.5" />
      )}
      <span>{a.message}</span>
      {a.link && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
    </span>
  );

  const className = emergency
    ? "block bg-ember py-2.5 text-center text-sm font-semibold text-parchment"
    : "block bg-gold py-2.5 text-center text-sm text-ink";

  return (
    <>
      <AnnouncementPopup data={a} />
      <div role="status" aria-live="polite">
        {a.link ? (
          <Link href={a.link} className={`${className} hover:opacity-90`}>
            {body}
          </Link>
        ) : (
          <div className={className}>{body}</div>
        )}
      </div>
    </>
  );
}
