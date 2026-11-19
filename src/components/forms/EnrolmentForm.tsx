"use client";

import { useState } from "react";
import {
  Field,
  FormNotice,
  Honeypot,
  SuccessPanel,
  postForm,
} from "@/components/forms/Field";

type Values = {
  fullName: string;
  email: string;
  whatsapp: string;
  country: string;
  church: string;
  inMinistry: "yes" | "no" | "preparing";
  reason: string;
  heardVia: string;
  website: string;
};

const initial: Values = {
  fullName: "",
  email: "",
  whatsapp: "",
  country: "",
  church: "",
  inMinistry: "no",
  reason: "",
  heardVia: "",
  website: "",
};

export function EnrolmentForm({ isOpen }: { isOpen: boolean }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function next(event: React.FormEvent) {
    event.preventDefault();
    const problems: Record<string, string> = {};
    if (values.fullName.trim().length < 2) problems.fullName = "Please give your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      problems.email = "Use a valid email address.";
    if (values.whatsapp.trim().length > 0 && values.whatsapp.trim().length < 5)
      problems.whatsapp = "Please enter a valid WhatsApp number with country code.";
    if (values.country.trim().length < 2) problems.country = "Please tell us your country.";
    if (values.church.trim().length < 2)
      problems.church = "Please name your church or denomination.";
    setErrors(problems);
    if (Object.keys(problems).length === 0) setStep(1);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");
    setErrors({});
    const result = await postForm("/api/enrolment", { ...values, isOpen });
    if (result.ok) {
      setStatus("ok");
      setValues(initial);
      setStep(0);
    } else {
      setStatus("error");
      setErrors(result.errors ?? {});
      setMessage(result.message ?? "That did not send. Please try again.");
    }
  }

  if (status === "ok") {
    return (
      <SuccessPanel
        title={isOpen ? "Your application has been received." : "You are on the waitlist."}
      >
        {isOpen
          ? "The Prophet's team reviews every application personally and will message you on WhatsApp."
          : "You will be told first when the next cohort opens. Nothing else is required from you now."}
      </SuccessPanel>
    );
  }

  return (
    <form onSubmit={step === 0 ? next : submit} className="relative space-y-6" noValidate>
      <Honeypot value={values.website} onChange={(v) => set("website", v)} />

      <div className="flex items-center gap-4">
        <p className="label text-ember">
          Step {step + 1} of 2 · {step === 0 ? "Who you are" : "Your calling"}
        </p>
        <span className="h-px flex-1 bg-ink/15" aria-hidden="true" />
      </div>

      {step === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="enr-name" error={errors.fullName}>
            <input
              id="enr-name"
              className="input"
              value={values.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              required
            />
          </Field>
          <Field label="Email" htmlFor="enr-email" error={errors.email}>
            <input
              id="enr-email"
              type="email"
              className="input"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              required
            />
          </Field>
          <Field
            label="WhatsApp number (optional)"
            htmlFor="enr-whatsapp"
            error={errors.whatsapp}
            hint="Include the country code (optional)."
          >
            <input
              id="enr-whatsapp"
              className="input"
              value={values.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(errors.whatsapp)}
            />
          </Field>
          <Field label="Country" htmlFor="enr-country" error={errors.country}>
            <input
              id="enr-country"
              className="input"
              value={values.country}
              onChange={(e) => set("country", e.target.value)}
              autoComplete="country-name"
              aria-invalid={Boolean(errors.country)}
              required
            />
          </Field>
          <div className="sm:col-span-2">
            <Field
              label="Church / denomination"
              htmlFor="enr-church"
              error={errors.church}
            >
              <input
                id="enr-church"
                className="input"
                value={values.church}
                onChange={(e) => set("church", e.target.value)}
                aria-invalid={Boolean(errors.church)}
                required
              />
            </Field>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <Field label="Are you in ministry?" htmlFor="enr-ministry" error={errors.inMinistry}>
            <select
              id="enr-ministry"
              className="select"
              value={values.inMinistry}
              onChange={(e) => set("inMinistry", e.target.value as Values["inMinistry"])}
            >
              <option value="yes">Yes, I serve in ministry</option>
              <option value="preparing">Not yet, but I am preparing</option>
              <option value="no">No</option>
            </select>
          </Field>

          <Field
            label="Why do you want to enrol?"
            htmlFor="enr-reason"
            error={errors.reason}
            hint="A few honest sentences are enough."
          >
            <textarea
              id="enr-reason"
              className="textarea min-h-[10rem]"
              value={values.reason}
              onChange={(e) => set("reason", e.target.value)}
              aria-invalid={Boolean(errors.reason)}
              required
            />
          </Field>

          <Field
            label="How did you hear about us? (optional)"
            htmlFor="enr-heard"
            error={errors.heardVia}
          >
            <input
              id="enr-heard"
              className="input"
              value={values.heardVia}
              onChange={(e) => set("heardVia", e.target.value)}
            />
          </Field>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {step === 1 && (
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setStep(0)}
          >
            Back
          </button>
        )}
        <button type="submit" className="btn btn-gold" disabled={status === "sending"}>
          {status === "sending"
            ? "Sending…"
            : step === 0
              ? "Continue"
              : isOpen
                ? "Submit application"
                : "Join the waitlist"}
        </button>
      </div>

      <FormNotice status={status} message={message} />
    </form>
  );
}
