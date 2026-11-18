"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import { Seal } from "@/components/Seal";
import { postForm } from "@/components/forms/Field";
import {
  AREAS,
  BETA_SHARE_URL,
  BETA_SITE_URL,
  CONSENT_OPTIONS,
  DEVICES,
  ISSUE_PAGES,
  RATING_LABELS,
  SEVERITIES,
  firstName,
  type StoryConsent,
} from "@/lib/beta";

type Issue = {
  page: string;
  description: string;
  severity: string;
  screenshots: string[];
};

type Draft = {
  name: string;
  email: string;
  whatsapp: string;
  location: string;
  device: string;
  overall_rating: number;
  area_ratings: Record<string, number>;
  liked: string;
  take: string;
  noticed: "yes" | "no" | "";
  issues: Issue[];
  improve: string;
  wish: string;
  story: string;
  story_consent: StoryConsent | "";
  display_ok: boolean;
  may_contact: boolean;
  wants_call: boolean;
  meta: {
    browser?: string;
    os?: string;
    screen?: string;
    referrer?: string;
    timestamp?: string;
  };
};

const DRAFT_KEY = "tsop-beta-draft";
const MAX_SHOTS = 3;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

const STEPS = [
  {
    title: "About you",
    note: "Take your time. There are no wrong answers.",
  },
  {
    title: "Your take",
    note: "One idea at a time. Say it the way you would say it to a friend.",
  },
  {
    title: "Improve",
    note: "Nothing here is a complaint. It is a gift.",
  },
  {
    title: "Your story",
    note: "Almost done, and this part is optional.",
  },
] as const;

const emptyIssue = (): Issue => ({
  page: "Home",
  description: "",
  severity: "Small annoyance",
  screenshots: [],
});

function blankDraft(): Draft {
  return {
    name: "",
    email: "",
    whatsapp: "",
    location: "",
    device: "",
    overall_rating: 0,
    area_ratings: {},
    liked: "",
    take: "",
    noticed: "",
    issues: [],
    improve: "",
    wish: "",
    story: "",
    story_consent: "",
    display_ok: false,
    may_contact: true,
    wants_call: false,
    meta: {},
  };
}

async function compressImage(file: File): Promise<string> {
  const readAsDataUrl = () =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });

  if (typeof createImageBitmap !== "function") return readAsDataUrl();

  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) return readAsDataUrl();
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.72);
  } catch {
    return readAsDataUrl();
  }
}

export function BetaFeedbackForm() {
  const [values, setValues] = useState<Draft>(blankDraft);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "error" | "done">("idle");
  const [message, setMessage] = useState("");
  const [shotError, setShotError] = useState("");
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Restore a draft so a refresh never costs the tester their words.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<Draft>;
        setValues((current) => ({ ...current, ...saved, meta: { ...current.meta, ...(saved.meta ?? {}) } }));
      }
    } catch {
      // a corrupt draft is not worth interrupting anyone over
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || status === "done") return;
    const timer = window.setTimeout(() => {
      try {
        sessionStorage.setItem(DRAFT_KEY, JSON.stringify(values));
      } catch {
        try {
          sessionStorage.setItem(
            DRAFT_KEY,
            JSON.stringify({
              ...values,
              issues: values.issues.map((issue) => ({ ...issue, screenshots: [] })),
            }),
          );
        } catch {
          // storage full; the answers in memory are still safe
        }
      }
    }, 400);
    return () => window.clearTimeout(timer);
  }, [values, ready, status]);

  // Quiet technical context: never asked for, simply recorded.
  useEffect(() => {
    if (typeof navigator === "undefined") return;
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua)
      ? "Edge"
      : /OPR\//.test(ua)
        ? "Opera"
        : /Chrome\//.test(ua)
          ? "Chrome"
          : /Firefox\//.test(ua)
            ? "Firefox"
            : /Safari\//.test(ua)
              ? "Safari"
              : "Other";
    const os = /Android/.test(ua)
      ? "Android"
      : /iPhone|iPad|iPod/.test(ua)
        ? "iOS"
        : /Windows/.test(ua)
          ? "Windows"
          : /Mac OS X/.test(ua)
            ? "macOS"
            : /Linux/.test(ua)
              ? "Linux"
              : "Other";
    setValues((current) =>
      current.meta.timestamp
        ? current
        : {
            ...current,
            meta: {
              browser,
              os,
              screen: `${window.screen.width}×${window.screen.height}`,
              referrer: (document.referrer || "").slice(0, 300),
              timestamp: new Date().toISOString(),
            },
          },
    );
  }, []);

  useEffect(() => {
    if (status === "done") window.scrollTo({ top: 0, behavior: "auto" });
    else headingRef.current?.focus({ preventScroll: true });
  }, [step, status]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const setIssue = (index: number, patch: Partial<Issue>) =>
    setValues((current) => ({
      ...current,
      issues: current.issues.map((issue, i) => (i === index ? { ...issue, ...patch } : issue)),
    }));

  function validate(index: number) {
    const next: Record<string, string> = {};
    if (index === 0) {
      if (values.name.trim().length < 2) next.name = "Please tell us your name so we can thank you.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
        next.email = "Please add your email so we can say thank you.";
      if (values.whatsapp.trim() && values.whatsapp.replace(/\D/g, "").length < 7)
        next.whatsapp = "That number looks a little short. You can leave it blank instead.";
    }
    if (index === 1) {
      if (!values.overall_rating) next.overall_rating = "Choose the mark that feels closest.";
      if (values.take.trim().length < 10)
        next.take = "A sentence or two is enough — just tell us how it felt.";
    }
    if (index === 2) {
      if (values.noticed === "yes" && values.issues.length === 0)
        next.issues = "Add one issue, or choose “No issues”.";
      values.issues.forEach((issue, i) => {
        if (!issue.description.trim()) next[`issue-${i}`] = "A line about what happened is enough.";
      });
      if (!values.improve.trim()) next.improve = "Tell us one thing we could do better.";
    }
    if (index === 3 && values.story.trim().length > 0 && !values.story_consent) {
      next.story_consent = "Please choose what we may do with your story.";
    }
    return next;
  }

  function goNext() {
    const found = validate(step);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setErrors({});
    setStep((s) => Math.max(0, s - 1));
  }

  async function addScreenshots(index: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    setShotError("");
    const current = values.issues[index]?.screenshots ?? [];
    const room = MAX_SHOTS - current.length;
    if (room <= 0) {
      setShotError("Three images per issue is the limit.");
      return;
    }
    const chosen = Array.from(files).slice(0, room);
    const accepted: string[] = [];
    for (const file of chosen) {
      if (!file.type.startsWith("image/")) {
        setShotError("Images only, please. A screenshot from your phone is perfect.");
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setShotError("That image is over 5 MB. A screenshot usually is much smaller.");
        continue;
      }
      try {
        accepted.push(await compressImage(file));
      } catch {
        setShotError("We could not read that image. Try another one.");
      }
    }
    if (accepted.length) setIssue(index, { screenshots: [...current, ...accepted].slice(0, MAX_SHOTS) });
  }

  async function submit() {
    setStatus("sending");
    setMessage("");
    setErrors({});

    const payload = {
      name: values.name.trim(),
      email: values.email.trim(),
      whatsapp: values.whatsapp.trim() || undefined,
      location: values.location.trim() || undefined,
      device: values.device || undefined,
      overall_rating: values.overall_rating,
      area_ratings: values.area_ratings,
      liked: values.liked.trim() || undefined,
      take: values.take.trim(),
      issues:
        values.noticed === "yes"
          ? values.issues.map((issue) => ({
              page: issue.page,
              description: issue.description.trim(),
              severity: issue.severity,
              screenshots: issue.screenshots,
            }))
          : [],
      improve: values.improve.trim(),
      wish: values.wish.trim() || undefined,
      story: values.story.trim() || undefined,
      story_consent: values.story.trim() ? values.story_consent || "private" : "private",
      display_name:
        values.story.trim() && values.story_consent === "public_named" && values.display_ok
          ? `${values.name.trim().split(/\s+/)[0]}${values.location.trim() ? `, ${values.location.trim()}` : ""}`
          : undefined,
      may_contact: values.may_contact,
      wants_call: values.wants_call,
      meta: values.meta,
    };

    const result = await postForm("/api/beta", {
      type: "beta_feedback",
      payload,
    });

    if (result.ok) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setStatus("done");
      return;
    }

    setStatus("error");
    setErrors(result.errors ?? {});
    setMessage(result.message ?? "That did not send. Your answers are still here — please try again.");
  }

  if (status === "done") {
    return <BetaThankYou name={values.name} copied={copied} onCopy={async () => {
      try {
        await navigator.clipboard.writeText(BETA_SHARE_URL);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 4000);
      } catch {
        setCopied(false);
      }
    }} />;
  }

  const showReview = step === 4;
  const progressIndex = Math.min(step, 3);

  return (
    <div id="review" className="border-t border-ink/20 pt-8">
      <ol className="grid grid-cols-4 gap-2 md:gap-4" aria-label="Progress">
        {STEPS.map((entry, index) => {
          const done = step > index || showReview;
          const current = !showReview && step === index;
          return (
            <li key={entry.title} aria-current={current ? "step" : undefined} className="min-w-0">
              <span
                aria-hidden="true"
                className={`block h-px w-full transition-colors duration-300 ${
                  done ? "bg-gold" : "bg-ink/20"
                }`}
              />
              <span
                className={`mt-2 block text-[0.58rem] font-semibold uppercase leading-tight tracking-[0.12em] ${
                  current ? "text-ink" : done ? "text-ember" : "text-quiet/70"
                }`}
              >
                0{index + 1} <span className="hidden sm:inline">· {entry.title}</span>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex items-baseline justify-between gap-4">
        <p className="label text-ember">
          {showReview ? "Review" : `Step ${progressIndex + 1} of 4`}
        </p>
        <p className="text-xs text-quiet">About five minutes · only name and email are required</p>
      </div>

      <h2
        ref={headingRef}
        tabIndex={-1}
        className="mt-3 font-display text-title outline-none"
        aria-live="polite"
      >
        {showReview ? "One last look." : STEPS[progressIndex].title}
      </h2>
      <p className="mt-2 max-w-[52ch] text-sm leading-relaxed text-quiet">
        {showReview
          ? "Change anything that is not right. Then send it, and it is with the team."
          : STEPS[progressIndex].note}
      </p>

      <div key={showReview ? "review" : step} className="beta-step mt-8">
        {step === 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="beta-name"
              label="Full name"
              value={values.name}
              onChange={(v) => set("name", v)}
              error={errors.name}
              autoComplete="name"
              required
            />
            <TextField
              id="beta-email"
              label="Email"
              type="email"
              value={values.email}
              onChange={(v) => set("email", v)}
              error={errors.email}
              hint="Only so we can thank you and follow up."
              autoComplete="email"
              required
            />
            <TextField
              id="beta-whatsapp"
              label="WhatsApp (optional)"
              value={values.whatsapp}
              onChange={(v) => set("whatsapp", v)}
              error={errors.whatsapp}
              hint="If you would rather we reach you there."
              autoComplete="tel"
              inputMode="tel"
            />
            <TextField
              id="beta-location"
              label="Country / city (optional)"
              value={values.location}
              onChange={(v) => set("location", v)}
              error={errors.location}
              autoComplete="address-level2"
            />

            <fieldset className="sm:col-span-2">
              <legend className="label text-ink/70">What device did you mostly use?</legend>
              <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DEVICES.map((device) => (
                  <label
                    key={device}
                    className={`flex min-h-12 cursor-pointer items-center justify-center border px-3 text-sm transition-colors ${
                      values.device === device
                        ? "border-gold bg-gold/10"
                        : "border-ink/20 bg-paper hover:border-ink/45"
                    }`}
                  >
                    <input
                      type="radio"
                      name="device"
                      value={device}
                      checked={values.device === device}
                      onChange={() => set("device", device)}
                      className="sr-only"
                    />
                    {device}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-9">
            <fieldset>
              <legend className="label text-ink/70">Overall, how did the site feel?</legend>
              <div className="mt-3 grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <label
                    key={n}
                    className={`flex min-h-[4.5rem] cursor-pointer flex-col items-center justify-center border transition-colors ${
                      values.overall_rating === n
                        ? "border-gold bg-gold/12"
                        : "border-ink/20 bg-paper hover:border-ink/45"
                    }`}
                  >
                    <input
                      type="radio"
                      name="overall-rating"
                      value={n}
                      checked={values.overall_rating === n}
                      onChange={() => set("overall_rating", n)}
                      className="sr-only"
                    />
                    <span className="font-display text-2xl" aria-hidden="true">
                      {n}
                    </span>
                    <span className="sr-only">{RATING_LABELS[n]}</span>
                  </label>
                ))}
              </div>
              <p aria-live="polite" className="mt-2 min-h-6 text-sm text-quiet">
                {values.overall_rating
                  ? RATING_LABELS[values.overall_rating]
                  : "Choose one mark. There is no wrong answer."}
              </p>
              {errors.overall_rating && <FieldError>{errors.overall_rating}</FieldError>}
            </fieldset>

            <fieldset>
              <legend className="label text-ink/70">A little more, if you like</legend>
              <p className="mt-1 text-xs text-quiet">All optional.</p>
              <div className="mt-4 space-y-3">
                {AREAS.map((area) => (
                  <div
                    key={area.key}
                    className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/10 pb-3 last:border-0"
                  >
                    <span className="text-sm">{area.label}</span>
                    <div className="flex gap-1" role="group" aria-label={`${area.label} rating`}>
                      {[1, 2, 3, 4, 5].map((n) => {
                        const active = values.area_ratings[area.key] === n;
                        return (
                          <button
                            key={n}
                            type="button"
                            aria-pressed={active}
                            aria-label={`${area.label}: ${n} — ${RATING_LABELS[n]}`}
                            onClick={() => {
                              const next: Record<string, number> = { ...values.area_ratings };
                              if (active) delete next[area.key];
                              else next[area.key] = n;
                              set("area_ratings", next);
                            }}
                            className={`h-10 w-10 border text-sm transition-colors ${
                              active
                                ? "border-gold bg-gold text-ink"
                                : "border-ink/20 bg-paper text-ink/70 hover:border-ink/45"
                            }`}
                          >
                            {n}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </fieldset>

            <TextField
              id="beta-liked"
              label="What did you like most? (optional)"
              as="textarea"
              rows={4}
              value={values.liked}
              onChange={(v) => set("liked", v)}
              error={errors.liked}
              maxLength={1200}
            />

            <TextField
              id="beta-take"
              label="Your take on the website, in your own words"
              as="textarea"
              rows={7}
              value={values.take}
              onChange={(v) => set("take", v)}
              error={errors.take}
              hint="Plain words are best. What worked, what did not, how it made you feel."
              maxLength={2000}
              counter
              required
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-9">
            <fieldset>
              <legend className="label text-ink/70">Did you notice any issues?</legend>
              <div className="mt-3 flex gap-2">
                {[
                  { value: "no", label: "No issues" },
                  { value: "yes", label: "Yes, something happened" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center border px-3 text-center text-sm transition-colors ${
                      values.noticed === option.value
                        ? "border-gold bg-gold/10"
                        : "border-ink/20 bg-paper hover:border-ink/45"
                    }`}
                  >
                    <input
                      type="radio"
                      name="noticed"
                      value={option.value}
                      checked={values.noticed === option.value}
                      onChange={() => {
                        set("noticed", option.value as "yes" | "no");
                        if (option.value === "yes" && values.issues.length === 0)
                          set("issues", [emptyIssue()]);
                      }}
                      className="sr-only"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
              {errors.issues && <FieldError>{errors.issues}</FieldError>}
            </fieldset>

            {values.noticed === "yes" && (
              <div className="space-y-6">
                {values.issues.map((issue, index) => (
                  <div key={index} className="border border-ink/20 bg-paper p-4 sm:p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="label text-ember">Issue {index + 1}</p>
                      {values.issues.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            set(
                              "issues",
                              values.issues.filter((_, i) => i !== index),
                            )
                          }
                          className="text-xs text-quiet underline decoration-ink/30 underline-offset-4 hover:text-ember"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <label className="block">
                        <span className="label text-ink/70">Where did it happen?</span>
                        <select
                          className="select mt-2"
                          value={issue.page}
                          onChange={(e) => setIssue(index, { page: e.target.value })}
                          aria-label={`Page for issue ${index + 1}`}
                        >
                          {ISSUE_PAGES.map((page) => (
                            <option key={page} value={page}>
                              {page}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="label text-ink/70">How serious?</span>
                        <select
                          className="select mt-2"
                          value={issue.severity}
                          onChange={(e) => setIssue(index, { severity: e.target.value })}
                          aria-label={`Severity for issue ${index + 1}`}
                        >
                          {SEVERITIES.map((severity) => (
                            <option key={severity} value={severity}>
                              {severity}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <label className="mt-4 block">
                      <span className="label text-ink/70">What happened?</span>
                      <textarea
                        className="textarea mt-2 min-h-[6rem]"
                        value={issue.description}
                        onChange={(e) => setIssue(index, { description: e.target.value })}
                        placeholder="What you tapped, what you expected, what you saw."
                        maxLength={2000}
                        aria-label={`What happened, issue ${index + 1}`}
                      />
                    </label>
                    {errors[`issue-${index}`] && <FieldError>{errors[`issue-${index}`]}</FieldError>}

                    <div className="mt-4">
                      <span className="label text-ink/70">Screenshot (optional, up to 3)</span>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        {issue.screenshots.map((shot, shotIndex) => (
                          <span key={shotIndex} className="relative block h-16 w-24 border border-ink/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={shot}
                              alt={`Screenshot ${shotIndex + 1} for issue ${index + 1}`}
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setIssue(index, {
                                  screenshots: issue.screenshots.filter((_, i) => i !== shotIndex),
                                })
                              }
                              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center border border-ink/20 bg-parchment text-xs text-ink"
                              aria-label={`Remove screenshot ${shotIndex + 1}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {issue.screenshots.length < MAX_SHOTS && (
                          <label className="flex min-h-12 cursor-pointer items-center border border-dashed border-ink/30 px-4 text-xs text-quiet hover:border-ink/60">
                            Add an image
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="sr-only"
                              onChange={(e) => {
                                void addScreenshots(index, e.target.files);
                                e.currentTarget.value = "";
                              }}
                            />
                          </label>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-quiet">
                        Images are compressed on your device and seen only by the team.
                      </p>
                      {shotError && <FieldError>{shotError}</FieldError>}
                    </div>
                  </div>
                ))}

                {values.issues.length < 5 && (
                  <button
                    type="button"
                    onClick={() => set("issues", [...values.issues, emptyIssue()])}
                    className="btn btn-outline"
                  >
                    Add another issue
                  </button>
                )}
              </div>
            )}

            <TextField
              id="beta-improve"
              label="What can we do to improve it?"
              as="textarea"
              rows={5}
              value={values.improve}
              onChange={(v) => set("improve", v)}
              error={errors.improve}
              hint="One clear change is more useful than a list."
              maxLength={2000}
              counter
              required
            />

            <TextField
              id="beta-wish"
              label="Is there something you wished the site could do? (optional)"
              as="textarea"
              rows={4}
              value={values.wish}
              onChange={(v) => set("wish", v)}
              maxLength={1200}
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-7">
            <div>
              <h3 className="font-display text-xl">How has the School of Prophets helped you?</h3>
              <p className="measure mt-2 text-sm leading-relaxed text-quiet">
                In a few sentences, tell us what God has done in your life through this
                fellowship. With your permission, we may share it on the website to
                encourage others.
              </p>
            </div>

            <TextField
              id="beta-story"
              label="Your story (optional)"
              as="textarea"
              rows={8}
              value={values.story}
              onChange={(v) => set("story", v)}
              error={errors.story}
              maxLength={1500}
              counter
            />

            <fieldset>
              <legend className="label text-ink/70">May we publish your story?</legend>
              <div className="mt-3 space-y-2">
                {CONSENT_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                      values.story_consent === option.value
                        ? "border-gold bg-gold/[0.07]"
                        : "border-ink/20 hover:border-ink/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="story-consent"
                      value={option.value}
                      checked={values.story_consent === option.value}
                      onChange={() => set("story_consent", option.value)}
                      className="mt-1 h-4 w-4 accent-[#9a4a22]"
                    />
                    <span>
                      <span className="block text-sm font-semibold">{option.label}</span>
                      <span className="block text-xs leading-relaxed text-quiet">
                        {option.description}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
              {errors.story_consent && <FieldError>{errors.story_consent}</FieldError>}
            </fieldset>

            {values.story.trim().length > 0 && (
              <div className="space-y-3 border-t border-ink/15 pt-5">
                <label className="flex cursor-pointer items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 accent-[#9a4a22]"
                    checked={values.display_ok}
                    onChange={(e) => set("display_ok", e.target.checked)}
                    disabled={values.story_consent !== "public_named"}
                  />
                  <span className={values.story_consent !== "public_named" ? "text-quiet" : ""}>
                    You may use my first name and country when sharing it.
                  </span>
                </label>
              </div>
            )}

            <div className="space-y-3 border-t border-ink/15 pt-5">
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#9a4a22]"
                  checked={values.may_contact}
                  onChange={(e) => set("may_contact", e.target.checked)}
                />
                <span>You may contact me about this feedback.</span>
              </label>
              <label className="flex cursor-pointer items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 accent-[#9a4a22]"
                  checked={values.wants_call}
                  onChange={(e) => set("wants_call", e.target.checked)}
                />
                <span>
                  I would like a short call to say more.{" "}
                  <Link href="/book" className="link-quiet font-semibold text-ember">
                    Choose a time
                  </Link>
                  .
                </span>
              </label>
            </div>
          </div>
        )}

        {showReview && (
          <ReviewSummary
            values={values}
            onEdit={(index) => {
              setErrors({});
              setStep(index);
            }}
          />
        )}
      </div>

      {step < 4 ? (
        <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-ink/15 pt-6">
          {step > 0 && (
            <button type="button" onClick={goBack} className="btn btn-outline">
              Back
            </button>
          )}
          <button type="button" onClick={goNext} className="btn btn-gold">
            Continue
          </button>
          <p className="text-xs text-quiet">
            {step === 0
              ? "Nothing is sent until the last step."
              : "Your answers are saved on this device as you go."}
          </p>
        </div>
      ) : (
        <div className="mt-8 border-t border-ink/15 pt-6">
          {message && (
            <p role="alert" className="mb-4 border-l-2 border-ember pl-4 text-sm text-ember">
              {message}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={submit}
              disabled={status === "sending"}
              className="btn btn-gold min-w-40"
            >
              {status === "sending" ? (
                <>
                  <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : status === "error" ? (
                "Try again"
              ) : (
                "Send my review"
              )}
            </button>
            <button type="button" onClick={goBack} className="btn btn-outline" disabled={status === "sending"}>
              Back
            </button>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-quiet">
            Your answers go only to the School of Prophets team. We never sell them or
            use them for advertising.
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewSummary({ values, onEdit }: { values: Draft; onEdit: (step: number) => void }) {
  const rows: { label: string; value: string; step: number }[] = [
    { label: "Name", value: values.name, step: 0 },
    { label: "Email", value: values.email, step: 0 },
    { label: "WhatsApp", value: values.whatsapp || "Not given", step: 0 },
    { label: "Location", value: values.location || "Not given", step: 0 },
    { label: "Device", value: values.device || "Not given", step: 0 },
    {
      label: "Overall",
      value: values.overall_rating
        ? `${values.overall_rating}/5 — ${RATING_LABELS[values.overall_rating]}`
        : "Not rated",
      step: 1,
    },
    {
      label: "Your take",
      value: values.take || "—",
      step: 1,
    },
    {
      label: "Issues",
      value:
        values.noticed === "no"
          ? "None reported"
          : values.noticed === "yes"
            ? `${values.issues.length} reported (${values.issues.map((i) => i.page).join(", ")})`
            : "Not answered",
      step: 2,
    },
    { label: "How to improve", value: values.improve || "—", step: 2 },
    ...(values.wish ? [{ label: "Wished for", value: values.wish, step: 2 }] : []),
    ...(values.story
      ? [
          { label: "Story", value: values.story, step: 3 },
          {
            label: "Story permission",
            value:
              CONSENT_OPTIONS.find((o) => o.value === values.story_consent)?.label ??
              "Not chosen yet",
            step: 3,
          },
        ]
      : []),
    {
      label: "Follow-up",
      value: `${values.may_contact ? "May contact" : "No contact"} · ${
        values.wants_call ? "wants a call" : "no call needed"
      }`,
      step: 3,
    },
  ];

  return (
    <div>
      <dl>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-b border-ink/12 py-4 sm:grid-cols-[10rem_1fr_auto] sm:items-baseline sm:gap-4"
          >
            <dt className="label text-quiet">{row.label}</dt>
            <dd className="whitespace-pre-line text-sm leading-relaxed">{row.value}</dd>
            <button
              type="button"
              onClick={() => onEdit(row.step)}
              className="justify-self-start text-xs text-ember underline decoration-ember/40 underline-offset-4 hover:decoration-ember sm:justify-self-end"
            >
              Edit
            </button>
          </div>
        ))}
      </dl>
      <p className="mt-5 text-xs leading-relaxed text-quiet">
        Sending this does not subscribe you to anything. If you asked us not to
        contact you, we will only use your email to send this one confirmation.
      </p>
    </div>
  );
}

function BetaThankYou({
  name,
  copied,
  onCopy,
}: {
  name: string;
  copied: boolean;
  onCopy: () => void;
}) {
  const shareText = `I tested the new School of Prophets site and shared a review. If you are part of the fellowship, they are still listening: ${BETA_SHARE_URL}`;
  return (
    <div className="flex min-h-[70vh] flex-col items-start justify-center border-t border-ink/20 py-14">
      <div className="beta-seal">
        <Seal size={132} idKey="beta-thanks" />
      </div>
      <h2 className="mt-8 font-display text-hero">Thank you, {firstName(name)}.</h2>
      <span aria-hidden="true" className="beta-rule mt-6 block h-px w-24 bg-gold" />
      <div className="measure mt-6 space-y-3 text-base leading-relaxed text-ink/85">
        <p>Your review is with the team. It will genuinely shape what this site becomes.</p>
        <p>
          We read every one — not a summary of them, the words themselves. If you found
          something broken, someone will look at it this week.
        </p>
        <p>A confirmation is on its way to your inbox, with a copy of what you sent.</p>
      </div>

      <div className="mt-10 w-full border-t border-ink/15 pt-6">
        <p className="label text-ember">Share with someone in the fellowship</p>
        <p className="measure mt-2 text-sm leading-relaxed text-quiet">
          If another member would want to say something, send them the page. The more
          honest the room, the better this gets.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={onCopy} className="btn btn-outline">
            {copied ? "Link copied" : "Copy the link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline"
          >
            Send on WhatsApp
          </a>
          <Link href="/" className="btn btn-gold">
            Back to the site
          </Link>
        </div>
        <p aria-live="polite" className="mt-3 min-h-5 text-xs text-quiet">
          {copied ? "The link is on your clipboard." : ""}
        </p>
      </div>
    </div>
  );
}

function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  type = "text",
  as = "input",
  rows,
  maxLength,
  counter,
  required,
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  as?: "input" | "textarea";
  rows?: number;
  maxLength?: number;
  counter?: boolean;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "tel" | "text" | "email";
}) {
  return (
    <div className="field">
      <label htmlFor={id}>
        {label}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {as === "textarea" ? (
        <textarea
          id={id}
          className="textarea min-h-[7rem]"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          rows={rows}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          className="input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          autoComplete={autoComplete}
          inputMode={inputMode}
          required={required}
        />
      )}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        {hint && !error ? (
          <p id={`${id}-hint`} className="text-xs text-quiet">
            {hint}
          </p>
        ) : (
          <span />
        )}
        {counter && maxLength ? (
          <p className={`text-xs ${value.length > maxLength * 0.9 ? "text-ember" : "text-quiet"}`}>
            {value.length} / {maxLength}
          </p>
        ) : null}
      </div>
      {error && <FieldError>{error}</FieldError>}
    </div>
  );
}

function FieldError({ children }: { children: React.ReactNode }) {
  return <p className="mt-1 text-xs font-semibold text-ember">{children}</p>;
}
