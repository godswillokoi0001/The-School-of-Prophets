"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

/**
 * Global handler that catches password recovery redirects (e.g. if Supabase
 * redirects to the root site or another page with recovery tokens or errors in the hash/query).
 * Immediately forwards the recovery session to /admin/reset-password.
 */
export function AuthRecoveryHandler() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already on the reset-password page; do nothing
    if (pathname?.startsWith("/admin/reset-password")) return;

    const hash = window.location.hash || "";
    const search = window.location.search || "";

    const isRecoveryHash =
      hash.includes("type=recovery") ||
      (hash.includes("access_token=") && hash.includes("recovery"));

    const isRecoverySearch =
      search.includes("type=recovery") ||
      (search.includes("code=") && (hash.includes("recovery") || search.includes("recovery")));

    const isAuthError =
      (hash.includes("error_code=") || search.includes("error_code=")) &&
      (hash.includes("otp_expired") ||
        search.includes("otp_expired") ||
        hash.includes("access_denied") ||
        search.includes("access_denied"));

    if (isRecoveryHash || isRecoverySearch || isAuthError) {
      window.location.replace(`/admin/reset-password${search}${hash}`);
      return;
    }

    try {
      const sb = createSupabaseBrowser();
      const {
        data: { subscription },
      } = sb.auth.onAuthStateChange((event) => {
        if (event === "PASSWORD_RECOVERY") {
          window.location.replace(
            `/admin/reset-password${window.location.search}${window.location.hash}`
          );
        }
      });

      return () => {
        subscription?.unsubscribe();
      };
    } catch {
      // In non-auth contexts, silently ignore
    }
  }, [pathname]);

  return null;
}
