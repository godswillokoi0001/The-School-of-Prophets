"use client";

import { useState } from "react";
import {
  Field,
  FormNotice,
  Honeypot,
  SuccessPanel,
  postForm,
} from "@/components/forms/Field";

export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  const set = (key: keyof typeof values) => (value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    const result = await postForm("/api/contact", { ...values });
    if (result.ok) {
      setStatus("ok");
      setValues({ name: "", email: "", message: "", website: "" });
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "That did not send. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <SuccessPanel title="Your message is with the team.">
        We reply to enquiries in the order they arrive, usually within a few
        days. If it is urgent, the community group is the faster route.
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative space-y-5" noValidate>
      <Honeypot value={values.website} onChange={set("website")} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="contact-name" error={errors.name}>
          <input
            id="contact-name"
            className="input"
            value={values.name}
            onChange={(e) => set("name")(e.target.value)}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            required
          />
        </Field>
        <Field label="Email" htmlFor="contact-email" error={errors.email}>
          <input
            id="contact-email"
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
        label="Message"
        htmlFor="contact-message"
        error={errors.message}
        hint="Tell us who you are and what you would like to know."
      >
        <textarea
          id="contact-message"
          className="textarea"
          value={values.message}
          onChange={(e) => set("message")(e.target.value)}
          aria-invalid={Boolean(errors.message)}
          required
        />
      </Field>

      <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
      <FormNotice status={status} message={message} />
    </form>
  );
}
