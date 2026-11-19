"use client";

import { useState } from "react";
import {
  Field,
  FormNotice,
  Honeypot,
  SuccessPanel,
  postForm,
} from "@/components/forms/Field";

export function EventRegisterForm({
  eventSlug,
  eventTitle,
}: {
  eventSlug: string;
  eventTitle: string;
}) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    guests: "0",
    notes: "",
    website: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    const result = await postForm("/api/submit", {
      type: "registration",
      payload: {
        name: values.name,
        email: values.email,
        phone: values.phone.trim() || undefined,
        whatsapp: values.phone.trim() || undefined,
        guests: values.guests === "" ? 0 : Number(values.guests),
        notes: values.notes || undefined,
        eventSlug,
        eventTitle,
      },
      website: values.website,
    });
    if (result.ok) {
      setStatus("ok");
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "That did not send. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <SuccessPanel title="Your place is noted.">
        You are registered for {eventTitle}. A confirmation is on its way to your
        email, and any joining details will be posted in the community before the
        day.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot value={values.website} onChange={set("website")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="reg-name" error={errors.name}>
          <input
            id="reg-name"
            className="input"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            required
          />
        </Field>
        <Field label="Email" htmlFor="reg-email" error={errors.email}>
          <input
            id="reg-email"
            type="email"
            className="input"
            value={values.email}
            onChange={(e) => set("email")(e.target.value)}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            required
          />
        </Field>
      </div>

      <Field
        label="Phone / WhatsApp (optional)"
        htmlFor="reg-phone"
        error={errors.phone}
        hint="Optional. If you would like gathering reminders or updates via WhatsApp."
      >
        <input
          id="reg-phone"
          type="tel"
          className="input"
          value={values.phone}
          onChange={(e) => set("phone")(e.target.value)}
          autoComplete="tel"
          inputMode="tel"
          placeholder="Include country code, e.g. +234..."
        />
      </Field>

      <Field
        label="Additional guests"
        htmlFor="reg-guests"
        hint="How many people are coming with you?"
        error={errors.guests}
      >
        <input
          id="reg-guests"
          type="number"
          min={0}
          max={20}
          className="input"
          value={values.guests}
          onChange={(e) => set("guests")(e.target.value)}
        />
      </Field>

      <Field
        label="Anything we should know?"
        htmlFor="reg-notes"
        hint="Optional. A question for the team, or how you heard about it."
        error={errors.notes}
      >
        <textarea
          id="reg-notes"
          className="textarea"
          value={values.notes}
          onChange={(e) => set("notes")(e.target.value)}
        />
      </Field>

      <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Register for this event"}
      </button>
      <FormNotice status={status} message={message} />
    </form>
  );
}
