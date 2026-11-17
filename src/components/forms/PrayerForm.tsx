"use client";

import { useState } from "react";
import {
  Field,
  FormNotice,
  Honeypot,
  SuccessPanel,
  postForm,
} from "@/components/forms/Field";

export function PrayerForm() {
  const [values, setValues] = useState({
    name: "",
    request: "",
    whatsapp: "",
    isPrivate: false,
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: "name" | "request" | "whatsapp" | "website") => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    const result = await postForm("/api/prayer", values);
    if (result.ok) {
      setStatus("ok");
      setValues({ name: "", request: "", whatsapp: "", isPrivate: false, website: "" });
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "That did not send. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <SuccessPanel title="Your request has been received.">
        The prayer team will stand with you. Nothing here is published on this
        site. If you left a WhatsApp number, someone may reach out to pray with
        you.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot value={values.website} onChange={set("website")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name (optional)"
          htmlFor="prayer-name"
          error={errors.name}
          hint="Leave blank and we will pray without a name."
        >
          <input
            id="prayer-name"
            className="input"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
          />
        </Field>
        <Field
          label="WhatsApp (optional)"
          htmlFor="prayer-whatsapp"
          error={errors.whatsapp}
          hint="Only if you would like a follow-up."
        >
          <input
            id="prayer-whatsapp"
            className="input"
            value={values.whatsapp}
            onChange={(e) => set("whatsapp")(e.target.value)}
            autoComplete="tel"
            inputMode="tel"
          />
        </Field>
      </div>

      <Field
        label="Your request"
        htmlFor="prayer-request"
        error={errors.request}
        hint="Write as much or as little as you need to."
      >
        <textarea
          id="prayer-request"
          className="textarea"
          value={values.request}
          onChange={(e) => set("request")(e.target.value)}
          aria-invalid={Boolean(errors.request)}
          required
        />
      </Field>

      <label className="flex cursor-pointer items-start gap-3 border border-ink/15 p-4">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 accent-[#9a4a22]"
          checked={values.isPrivate}
          onChange={(e) => setValues((v) => ({ ...v, isPrivate: e.target.checked }))}
        />
        <span className="text-sm leading-relaxed">
          <span className="font-semibold">Keep this private.</span> Seen only by
          the prayer team, never shared in the group.
        </span>
      </label>

      <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send request"}
      </button>
      <FormNotice status={status} message={message} />
    </form>
  );
}
