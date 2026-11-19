"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Megaphone,
  TriangleAlert,
  Plus,
  Pencil,
  Trash2,
  Copy,
  Radio,
  CheckCircle2,
  AlertCircle,
  LoaderCircle,
  ExternalLink,
  Eye,
  X,
} from "lucide-react";
import type { AnnouncementItem } from "@/lib/data";
import {
  saveAnnouncementAction,
  toggleAnnouncementActiveAction,
  deleteAnnouncementAction,
  duplicateAnnouncementAction,
} from "@/app/admin/(shell)/actions/announcements";
import { AdminModal } from "@/components/admin/AdminModal";

export function AnnouncementsManager({
  initial,
}: {
  initial: AnnouncementItem[];
}) {
  const [items, setItems] = useState<AnnouncementItem[]>(initial);
  const [pending, startTransition] = useTransition();

  // Composer Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [headline, setHeadline] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [variant, setVariant] = useState<"default" | "emergency">("default");
  const [active, setActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  // Feedback & Delete modal
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AnnouncementItem | null>(null);

  const activeAnnouncement = items.find((i) => i.active && i.message.trim());

  function resetForm() {
    setEditingId(null);
    setHeadline("");
    setMessage("");
    setLink("");
    setButtonText("");
    setVariant("default");
    setActive(false);
    setIsFormOpen(false);
  }

  function handleStartCreate() {
    resetForm();
    setIsFormOpen(true);
  }

  function handleStartEdit(item: AnnouncementItem) {
    setEditingId(item.id);
    setHeadline(item.headline || "");
    setMessage(item.message || "");
    setLink(item.link || "");
    setButtonText(item.buttonText || "");
    setVariant(item.variant || "default");
    setActive(item.active);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) {
      setFeedback({ type: "error", text: "Please provide an announcement message." });
      return;
    }
    setFeedback(null);

    startTransition(async () => {
      const res = await saveAnnouncementAction({
        id: editingId || undefined,
        headline: headline.trim(),
        message: message.trim(),
        link: link.trim() || undefined,
        buttonText: buttonText.trim() || undefined,
        variant,
        active,
      });

      if (!res.ok) {
        setFeedback({ type: "error", text: res.error || "Failed to save announcement." });
        return;
      }

      if (res.items) {
        setItems(res.items);
      }
      setFeedback({
        type: "success",
        text: editingId
          ? "Announcement updated successfully."
          : active
          ? "Announcement saved and now live on the site."
          : "Announcement saved to library.",
      });
      resetForm();
    });
  }

  function handleToggleActive(item: AnnouncementItem) {
    setFeedback(null);
    const newActiveState = !item.active;

    startTransition(async () => {
      const res = await toggleAnnouncementActiveAction(item.id, newActiveState);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error || "Failed to update status." });
        return;
      }
      if (res.items) {
        setItems(res.items);
      }
      setFeedback({
        type: "success",
        text: newActiveState
          ? `"${item.headline || "Announcement"}" is live across the site.`
          : `"${item.headline || "Announcement"}" has been deactivated.`,
      });
    });
  }

  function handleDuplicate(id: string) {
    setFeedback(null);
    startTransition(async () => {
      const res = await duplicateAnnouncementAction(id);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error || "Failed to duplicate." });
        return;
      }
      if (res.items) {
        setItems(res.items);
      }
      setFeedback({ type: "success", text: "Announcement duplicated as a draft." });
    });
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    const targetId = deleteTarget.id;
    setDeleteTarget(null);

    startTransition(async () => {
      const res = await deleteAnnouncementAction(targetId);
      if (!res.ok) {
        setFeedback({ type: "error", text: res.error || "Failed to delete announcement." });
        return;
      }
      if (res.items) {
        setItems(res.items);
      }
      setFeedback({ type: "success", text: "Announcement deleted permanently." });
      if (editingId === targetId) resetForm();
    });
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Live Status */}
      <div className="admin-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment/15 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Megaphone size={20} className="text-gold" />
              <h1 className="font-display text-2xl">Announcements</h1>
            </div>
            <p className="mt-1 text-xs opacity-65">
              Save multiple announcements, toggle which one is live on the site, or draft updates for future events.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/admin/settings" className="admin-btn admin-btn-ghost text-xs">
              &larr; Back to Settings
            </Link>
            {!isFormOpen && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="admin-btn admin-btn-gold"
              >
                <Plus size={14} /> New Announcement
              </button>
            )}
          </div>
        </div>

        {/* Live Status Card */}
        <div className="mt-5  border border-parchment/15 bg-ink-2/50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {activeAnnouncement ? (
                  <span className="relative flex h-3 w-3">
                    
                    <span className="relative inline-flex h-3 w-3  bg-ok-dark"></span>
                  </span>
                ) : (
                  <span className="inline-flex h-3 w-3  bg-parchment/30"></span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    {activeAnnouncement ? (
                      <span className="text-ok-dark">Live on Site Now</span>
                    ) : (
                      <span className="text-parchment/60">No Live Announcement</span>
                    )}
                  </span>
                  {activeAnnouncement && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        activeAnnouncement.variant === "emergency"
                          ? "bg-danger-dark/10 text-danger-dark border border-danger-dark/40"
                          : "bg-gold/15 text-gold-soft border border-gold/30"
                      }`}
                    >
                      {activeAnnouncement.variant === "emergency" ? "Urgent" : "Routine"}
                    </span>
                  )}
                </div>

                {activeAnnouncement ? (
                  <p className="mt-1 text-xs text-parchment/80 line-clamp-2">
                    <strong>{activeAnnouncement.headline || "Notice"}:</strong> {activeAnnouncement.message}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-parchment/50">
                    Nothing is showing on the site. Activate a saved announcement to publish it.
                  </p>
                )}
              </div>
            </div>

            {activeAnnouncement && (
              <button
                type="button"
                disabled={pending}
                onClick={() => handleToggleActive(activeAnnouncement)}
                className="admin-btn admin-btn-ghost text-xs text-danger-dark hover:text-danger-dark border-danger-dark/40 hover:border-danger-dark/40"
              >
                Deactivate Live Notice
              </button>
            )}
          </div>
        </div>

        {/* Feedback message */}
        {feedback && (
          <div
            role="status"
            className={`mt-4 rounded border p-3.5 text-xs ${
              feedback.type === "success"
                ? "border-ok-dark/30 bg-ok-dark/10 text-ok-dark"
                : "border-danger-dark/40 bg-danger-dark/10 text-danger-dark"
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === "success" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              <span>{feedback.text}</span>
            </div>
          </div>
        )}
      </div>

      {/* Composer Form (Create / Edit) */}
      {isFormOpen && (
        <div className="admin-surface p-6 border-l-4 border-l-gold">
          <div className="flex items-center justify-between border-b border-parchment/15 pb-3">
            <div className="flex items-center gap-2">
              <Pencil size={16} className="text-gold" />
              <h2 className="font-display text-lg">
                {editingId ? "Edit Announcement" : "Create New Announcement"}
              </h2>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="text-parchment/40 hover:text-parchment p-1"
              aria-label="Cancel editing"
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="admin-label">Headline (optional)</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Special Prophetic Convergence / Admissions Open"
                  className="admin-input"
                />
                <p className="mt-1 text-[11px] opacity-50">Appears prominently in the popup modal.</p>
              </div>

              <div>
                <label className="admin-label">Priority</label>
                <select
                  value={variant}
                  onChange={(e) => setVariant(e.target.value as "default" | "emergency")}
                  className="admin-input"
                >
                  <option value="default">Routine (Liturgical Gold Theme &amp; Megaphone)</option>
                  <option value="emergency">Urgent / Urgent Notice (Ember Theme &amp; Alert Icon)</option>
                </select>
                <p className="mt-1 text-[11px] opacity-50">Sets the colour and icon of the bar.</p>
              </div>
            </div>

            <div>
              <label className="admin-label">
                Message <span className="text-gold">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Details of the announcement, gathering time, or fellowship update..."
                className="admin-input resize-y"
              />
              <p className="mt-1 text-[11px] opacity-50">
                Shown in the top banner bar and inside the modal popup window.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="admin-label">Link (optional)</label>
                <input
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="e.g. /newsletter, /training, or WhatsApp invite URL"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="admin-label">Button label (optional)</label>
                <input
                  type="text"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                  placeholder="e.g. Subscribe Now / Learn More / Join Room"
                  className="admin-input"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center gap-3 pt-2">
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11  bg-border after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5  after:bg-parchment after:transition-all after:content-[''] peer-checked:bg-gold peer-checked:after:translate-x-full peer-focus:outline-none"></div>
              </label>
              <div>
                <span className="text-xs font-medium">Make this live on the site</span>
                <p className="text-[11px] opacity-50">
                  When enabled, this announcement will become the live banner and modal immediately.
                </p>
              </div>
            </div>

            {/* Live Visual Preview */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-1.5 text-xs text-gold hover:underline"
              >
                <Eye size={13} /> {showPreview ? "Hide preview" : "Show preview"}
              </button>

              {showPreview && (
                <div className="mt-3 rounded border border-parchment/15 bg-ink p-4 space-y-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment/50">
                      Bar preview
                    </span>
                    <div
                      className={`mt-1 py-2 text-center text-xs font-medium px-4 rounded ${
                        variant === "emergency"
                          ? "bg-ember text-parchment"
                          : "bg-gold text-ink"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {variant === "emergency" ? (
                          <TriangleAlert size={14} />
                        ) : (
                          <Megaphone size={14} />
                        )}
                        <span>{message || "Your announcement message will appear here..."}</span>
                        {link && <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-parchment/50">
                      Popup preview
                    </span>
                    <div className="mt-1 rounded border border-parchment/20 border-t-2 border-t-gold bg-ink-2 p-5 text-parchment max-w-md">
                      <p className="text-[11px] font-semibold uppercase tracking-widest text-gold-soft">
                        {variant === "emergency" ? "Notice" : "From the fellowship"}
                      </p>
                      <h4 className="mt-1.5 font-display text-lg">
                        {headline || (variant === "emergency" ? "An important notice" : "A word from the team")}
                      </h4>
                      <p className="mt-2 text-xs leading-relaxed text-parchment/70 whitespace-pre-line">
                        {message || "Announcement details will appear here inside the modal..."}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        {buttonText && (
                          <span className="btn btn-gold text-xs py-1.5 px-3">
                            {buttonText}
                          </span>
                        )}
                        <span className="btn btn-outline text-xs py-1.5 px-3 opacity-60">
                          Close
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-parchment/15 pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={pending}
                className="admin-btn admin-btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={pending}
                className="admin-btn admin-btn-gold"
              >
                {pending ? (
                  <LoaderCircle size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}
                {editingId ? "Update Announcement" : "Save Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements Library / List */}
      <div className="admin-surface p-6">
        <div className="flex items-center justify-between border-b border-parchment/15 pb-4">
          <div>
            <h2 className="font-display text-lg">Saved announcements</h2>
            <p className="mt-0.5 text-xs opacity-60">
              Every announcement saved here, whether live or waiting. ({items.length}). Activate, deactivate, or edit any entry.
            </p>
          </div>
          <span className="text-xs opacity-50">{items.length} saved</span>
        </div>

        {items.length === 0 ? (
          <div className="py-12 text-center">
            <Megaphone size={32} className="mx-auto text-parchment/30" />
            <h3 className="mt-3 font-display text-base">No announcements saved yet</h3>
            <p className="mt-1 text-xs text-parchment/60 max-w-sm mx-auto">
              Create announcements in advance for special meetings, admissions, fasting seasons, or notices.
            </p>
            <button
              type="button"
              onClick={handleStartCreate}
              className="admin-btn admin-btn-gold mt-4"
            >
              <Plus size={14} /> Write the first announcement
            </button>
          </div>
        ) : (
          <div className="mt-5 space-y-3.5">
            {items.map((item) => (
              <div
                key={item.id}
                className={` border p-4 transition-all ${
                  item.active
                    ? "border-gold/60 bg-gold/5 "
                    : "border-parchment/15 bg-ink-2/40 hover:border-parchment/15/80"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Status Pill */}
                    {item.active ? (
                      <span className="flex items-center gap-1.5  bg-ok-dark/10 border border-ok-dark/30 px-2.5 py-0.5 text-[10.5px] font-semibold text-ok-dark">
                        <span className="h-2 w-2 shrink-0 bg-ok-dark"></span>
                        Active on Site
                      </span>
                    ) : (
                      <span className="bg-ink/60 border border-parchment/15 px-2 py-0.5 text-[10.5px] text-parchment/50">
                        Inactive / Draft
                      </span>
                    )}

                    {/* Priority Badge */}
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                        item.variant === "emergency"
                          ? "bg-danger-dark/10 text-danger-dark border border-danger-dark/40"
                          : "bg-ink border border-parchment/15 text-parchment/65"
                      }`}
                    >
                      {item.variant === "emergency" ? "Urgent" : "Routine"}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {/* Activate / Deactivate Toggle */}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleToggleActive(item)}
                      className={`admin-btn text-xs !py-1 !px-2.5 ${
                        item.active
                          ? "border-danger-dark/40 text-danger-dark hover:bg-danger-dark/10"
                          : "admin-btn-gold"
                      }`}
                      title={item.active ? "Deactivate this announcement" : "Make this announcement live on the site"}
                    >
                      <Radio size={12} />
                      {item.active ? "Deactivate" : "Activate"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleStartEdit(item)}
                      className="admin-btn admin-btn-ghost text-xs !py-1 !px-2"
                      title="Edit announcement"
                    >
                      <Pencil size={12} />
                    </button>

                    {/* Duplicate */}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handleDuplicate(item.id)}
                      className="admin-btn admin-btn-ghost text-xs !py-1 !px-2"
                      title="Duplicate announcement"
                    >
                      <Copy size={12} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => setDeleteTarget(item)}
                      className="admin-btn admin-btn-danger text-xs !py-1 !px-2"
                      title="Delete announcement"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="mt-3">
                  {item.headline && (
                    <h3 className="font-display text-base font-semibold text-parchment">
                      {item.headline}
                    </h3>
                  )}
                  <p className="mt-1 text-xs text-parchment/80 leading-relaxed whitespace-pre-line">
                    {item.message}
                  </p>
                </div>

                {/* Meta & Links */}
                {(item.link || item.buttonText) && (
                  <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-parchment/15/40 pt-2.5 text-[11px] text-parchment/60">
                    {item.link && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={11} className="text-gold" />
                        <span className="font-mono text-gold-soft">{item.link}</span>
                      </span>
                    )}
                    {item.buttonText && (
                      <span>
                        Button: <strong>&ldquo;{item.buttonText}&rdquo;</strong>
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AdminModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Announcement"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.headline || deleteTarget.message.slice(0, 35)}..."? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete Permanently"
        cancelLabel="Cancel"
        variant="danger"
        isLoading={pending}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
