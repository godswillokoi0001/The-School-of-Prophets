"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bold, Code, Heading2, Heading3, Image as ImageIcon, Italic,
  Link2, List, ListOrdered, Quote, BookMarked, LoaderCircle,
} from "lucide-react";
import { ImageEditorModal } from "@/components/admin/ImageEditorModal";
import { focalPosition, type Focal, type RatioName } from "@/lib/media";

const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "strong", "em", "ul", "ol", "li", "blockquote",
  "a", "img", "br", "div", "span", "scripture", "figure", "figcaption",
]);

export function sanitizeRichText(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const walk = (node: Node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as Element;
        if (!ALLOWED_TAGS.has(el.tagName.toLowerCase())) {
          el.replaceWith(...el.childNodes);
          return;
        }
        if (el.tagName === "A") {
          const href = el.getAttribute("href") ?? "";
          if (!/^https?:\/\//.test(href)) el.removeAttribute("href");
          else {
            el.setAttribute("href", href);
            el.setAttribute("rel", "noopener noreferrer");
            el.setAttribute("target", "_blank");
          }
          [...el.attributes].forEach((a) => {
            if (a.name !== "href" && a.name !== "rel" && a.name !== "target")
              el.removeAttribute(a.name);
          });
        } else if (el.tagName === "IMG") {
          const src = el.getAttribute("src") ?? "";
          if (!/^https?:\/\//.test(src) && !src.startsWith("/")) {
            el.remove();
            return;
          }
          [...el.attributes].forEach((a) => {
            if (a.name !== "src" && a.name !== "alt") el.removeAttribute(a.name);
          });
          if (!el.getAttribute("alt")) el.setAttribute("alt", "");
        } else {
          [...el.attributes].forEach((a) => {
            if (a.name !== "class") el.removeAttribute(a.name);
          });
        }
        walk(el);
      } else if (child.nodeType === Node.COMMENT_NODE) {
        child.remove();
      }
    });
  };
  walk(doc.body);
  return doc.body.innerHTML;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({
  value,
  onChange,
  onImagePick,
  ariaLabel = "Rich text editor",
}: {
  value: string;
  onChange: (html: string) => void;
  onImagePick?: () => void;
  ariaLabel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [source, setSource] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value && document.activeElement !== ref.current) {
      ref.current.innerHTML = value;
    }
  }, [value]);

  const push = useCallback(() => {
    if (ref.current) onChange(sanitizeRichText(ref.current.innerHTML));
  }, [onChange]);

  function insertScripture() {
    const selection = window.getSelection();
    const text = selection?.toString() ?? "";
    exec("insertHTML", `<div class="scripture">${text || "Scripture reference and text"}</div><p></p>`);
    push();
  }

  function insertLink() {
    if (!linkUrl) return;
    exec("createLink", linkUrl);
    setLinkOpen(false);
    setLinkUrl("");
    push();
  }

  const tools = [
    { icon: Heading2, label: "Heading", act: () => { exec("formatBlock", "<h2>"); push(); } },
    { icon: Heading3, label: "Subheading", act: () => { exec("formatBlock", "<h3>"); push(); } },
    { icon: Bold, label: "Bold", act: () => { exec("bold"); push(); } },
    { icon: Italic, label: "Italic", act: () => { exec("italic"); push(); } },
    { icon: List, label: "Bullet list", act: () => { exec("insertUnorderedList"); push(); } },
    { icon: ListOrdered, label: "Numbered list", act: () => { exec("insertOrderedList"); push(); } },
    { icon: Quote, label: "Block quote", act: () => { exec("formatBlock", "<blockquote>"); push(); } },
    { icon: BookMarked, label: "Scripture block", act: insertScripture },
    { icon: Link2, label: "Insert link", act: () => setLinkOpen(true) },
    ...(onImagePick ? [{ icon: ImageIcon, label: "Insert image", act: onImagePick }] : []),
    { icon: Code, label: "Edit HTML", act: () => setSource((s) => !s) },
  ];

  return (
    <div className="admin-surface">
      <div className="flex flex-wrap items-center gap-1 border-b border-parchment/10 p-1" role="toolbar" aria-label="Formatting">
        {tools.map((t) => (
          <button
            key={t.label}
            type="button"
            onClick={t.act}
            title={t.label}
            aria-label={t.label}
            className="p-2 opacity-70 hover:opacity-100 hover:bg-parchment/5"
          >
            <t.icon size={14} />
          </button>
        ))}
      </div>
      {linkOpen && (
        <div className="flex gap-2 border-b border-parchment/10 p-2">
          <input
            className="admin-input flex-1"
            placeholder="https://…"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            aria-label="Link URL"
          />
          <button type="button" className="admin-btn admin-btn-gold !py-1" onClick={insertLink}>Add link</button>
        </div>
      )}
      {source ? (
        <textarea
          className="admin-textarea !min-h-72 font-mono text-xs"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="HTML source"
        />
      ) : (
        <div
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onInput={push}
          onBlur={push}
          role="textbox"
          aria-multiline="true"
          aria-label={ariaLabel}
          className="prose-editor min-h-72 px-4 py-3 text-sm outline-none"
        />
      )}
    </div>
  );
}

export function RichTextView({ html }: { html: string }) {
  return (
    <div
      className="prose-editor"
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  );
}

export function ImagePickerDialog({
  open, onClose, onPick, list,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (path: string) => void;
  list: { path: string; alt: string }[];
}) {
  const [busy, setBusy] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="admin-surface max-h-[70vh] w-full max-w-lg overflow-y-auto p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Choose an image">
        <h3 className="mb-2 font-display">Media library</h3>
        {busy && <p className="flex gap-2 text-xs"><LoaderCircle size={12} className="animate-spin" /> Uploading…</p>}
        <UploadButton onUploaded={(path) => onPick(path)} setBusy={setBusy} />
        <div className="mt-3 grid grid-cols-3 gap-2">
          {list.map((m) => (
            <button key={m.path} className="admin-surface p-2 text-left" onClick={() => onPick(m.path)}>
              {/* Thumbnails show the whole picture; framing is decided by the focal point. */}
              <div className="aspect-square w-full overflow-hidden bg-ink">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.path}
                  alt={m.alt}
                  className="h-full w-full object-contain"
                  style={{ objectPosition: focalPosition() }}
                />
              </div>
              <span className="mt-1 block truncate text-[0.6rem] opacity-60">{m.path.split("/").pop()}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function UploadButton({
  onUploaded,
  setBusy,
  label = "Upload image",
  ratio = "hero",
  aspectPreset,
}: {
  onUploaded: (path: string, alt?: string) => void;
  setBusy: (b: boolean) => void;
  label?: string;
  ratio?: RatioName;
  /** @deprecated use `ratio`; kept so older call sites keep working. */
  aspectPreset?: "16:9" | "1:1" | "4:5" | "free";
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);

  const legacyRatio: RatioName =
    aspectPreset === "1:1" ? "thumb" : aspectPreset === "4:5" ? "portrait" : ratio;

  async function directUpload(
    file: File,
    customAlt?: string,
    focal?: Focal,
    size?: { w: number; h: number },
  ) {
    setBusy(true);
    const compressed = await compressImage(file);
    const form = new FormData();
    form.append("file", compressed);
    form.append("alt", customAlt || file.name.replace(/\.[^.]+$/, ""));
    if (focal) {
      form.append("focalX", String(focal.x));
      form.append("focalY", String(focal.y));
    }
    if (size?.w && size?.h) {
      form.append("width", String(size.w));
      form.append("height", String(size.h));
    }
    const res = await fetch("/api/admin/media", { method: "POST", body: form });
    const data = await res.json();
    setBusy(false);
    if (data.path) onUploaded(data.path, customAlt);
  }

  return (
    <>
      <label className="admin-btn admin-btn-ghost cursor-pointer inline-flex items-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) {
              setSelectedFile(f);
              setEditorOpen(true);
            }
            e.target.value = "";
          }}
        />
        {label}
      </label>

      {editorOpen && selectedFile && (
        <ImageEditorModal
          file={selectedFile}
          isOpen={editorOpen}
          ratio={legacyRatio}
          onClose={() => {
            setEditorOpen(false);
            setSelectedFile(null);
          }}
          onApplyAndUpload={async (editedFile, alt, focalPoint, dims) => {
            await directUpload(editedFile, alt, focalPoint, dims);
            setEditorOpen(false);
            setSelectedFile(null);
          }}
        />
      )}
    </>
  );
}

/** Client-side resize: cap the long edge at 1920px and re-encode. */
export async function compressImage(file: File, maxEdge = 1920): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 600_000) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.85),
    );
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", {
      type: "image/webp",
    });
  } catch {
    return file;
  }
}
