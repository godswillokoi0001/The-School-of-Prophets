"use client";

import { useState } from "react";
import {
  Field,
  FormNotice,
  Honeypot,
  SuccessPanel,
  postForm,
} from "@/components/forms/Field";

export function TestimonyForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    body: "",
    consent: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: "name" | "email" | "body" | "website") => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    const result = await postForm("/api/testimony", values);
    if (result.ok) {
      setStatus("ok");
      setValues({ name: "", email: "", body: "", consent: false, website: "" });
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "That did not send. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <SuccessPanel title="Thank you for telling it.">
        Every testimony is read before it is published. If we would like to
        share yours, an admin will confirm the wording with you first.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot value={values.website} onChange={set("website")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name (or “Anonymous”)"
          htmlFor="testimony-name"
          error={errors.name}
          hint="Leave blank to appear as Anonymous."
        >
          <input
            id="testimony-name"
            className="input"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field
          label="Email (optional)"
          htmlFor="testimony-email"
          error={errors.email}
          hint="Only for confirming the wording with you."
        >
          <input
            id="testimony-email"
            type="email"
            className="input"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            autoComplete="email"
          />
        </Field>
      </div>

      <Field
        label="Your testimony"
        htmlFor="testimony-body"
        error={errors.body}
        hint="What God did, in your own words. No need to polish it."
      >
        <textarea
          id="testimony-body"
          className="textarea min-h-[12rem]"
          value={values.body}
          onChange={(e) => set("body")(e.target.value)}
          aria-invalid={Boolean(errors.body)}
          required
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 border border-ink/15 p-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#9a4a22]"
          checked={values.consent}
          onChange={(e) => setValues((v) => ({ ...v, consent: e.target.checked }))}
          aria-invalid={Boolean(errors.consent)}
        />
        <span className="text-sm leading-relaxed">
          I consent to this being published, with my name as written above.
          {errors.consent && (
            <span className="mt-1 block text-xs font-semibold text-ember">
              {errors.consent}
            </span>
          )}
        </span>
      </label>

      <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Submit testimony"}
      </button>
      <FormNotice status={status} message={message} />
    </form>
  );
}
