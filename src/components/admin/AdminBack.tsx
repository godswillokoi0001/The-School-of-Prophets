"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function AdminBack({
  href,
  label = "Back",
}: {
  href?: string;
  label?: string;
}) {
  const router = useRouter();

  if (href) {
    return (
      <Link
        href={href}
        className="group mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-parchment/60 transition-colors hover:text-parchment"
      >
        <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
        <span>{label}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="group mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-parchment/60 transition-colors hover:text-parchment"
    >
      <ArrowLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </button>
  );
}
