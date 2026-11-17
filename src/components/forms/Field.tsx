import type { ReactNode } from "react";

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={htmlFor}>{label}</label>
      {children}
      {hint && !error && (
        <p id={`${htmlFor}-hint`} className="text-xs text-quiet">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="text-xs font-semibold text-ember">
          {error}
        </p>
      )}
    </div>
  );
}

/** Off-screen bait. Bots fill it; people never see it. */
export function Honeypot({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="absolute left-[-9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
      <label htmlFor="website">Website</label>
      <input
        id="website"
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function FormNotice({
  status,
  message,
}: {
  status: "idle" | "sending" | "ok" | "error";
  message?: string;
}) {
  if (status === "idle" || status === "sending") return null;
  return (
    <p
      role={status === "error" ? "alert" : "status"}
      className={`mt-4 border-l-2 pl-4 text-sm leading-relaxed ${
        status === "error" ? "border-ember text-ember" : "border-gold text-ink"
      }`}
    >
      {message}
    </p>
  );
}

export function SuccessPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div role="status" className="border border-ink/20 bg-parchment-2/60 p-8">
      <p className="label text-ember">Received</p>
      <p className="mt-3 font-display text-2xl">{title}</p>
      <div className="measure mt-2 text-sm leading-relaxed text-quiet">{children}</div>
    </div>
  );
}

export type FormResponse = {
  ok?: boolean;
  message?: string;
  errors?: Record<string, string>;
};

export async function postForm(url: string, payload: unknown): Promise<FormResponse> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json()) as FormResponse;
    if (!res.ok) {
      return {
        ok: false,
        message: data.message ?? "That did not send. Please try again.",
        errors: data.errors,
      };
    }
    return { ok: true, ...data };
  } catch {
    return {
      ok: false,
      message:
        "We could not reach the server. Check your connection and try again, or message us in the community.",
    };
  }
}
