"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Renders its children only on public-facing routes, omitting them from the
 * /admin dashboard and login portal.
 */
export function PublicOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}
