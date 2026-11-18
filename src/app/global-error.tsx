"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[public] fatal error", error.digest ?? error.message);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f2ece0",
          color: "#101317",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "24px",
        }}
      >
        <main style={{ maxWidth: "38rem" }}>
          <p
            style={{
              margin: 0,
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#8a4a22",
              fontFamily: "system-ui, sans-serif",
            }}
          >
            The School of Prophets
          </p>
          <h1 style={{ margin: "16px 0 0", fontSize: "2.25rem", lineHeight: 1.05 }}>
            The site could not start.
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: "1rem", lineHeight: 1.6, color: "#57524a" }}>
            This is not your connection. Reload the page, and if it persists the
            team has already been notified by the error.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              minHeight: "44px",
              padding: "0 20px",
              background: "#b0803a",
              color: "#101317",
              border: 0,
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </main>
      </body>
    </html>
  );
}
