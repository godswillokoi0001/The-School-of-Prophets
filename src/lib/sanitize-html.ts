/**
 * Server-safe allowlist sanitizer for admin-authored rich text.
 * Runs alongside the client-side sanitizer in RichText.tsx so that
 * teaching/event bodies can be rendered safely during SSR.
 */

const ALLOWED_TAGS = new Set([
  "p", "h2", "h3", "strong", "em", "ul", "ol", "li", "blockquote",
  "a", "img", "br", "div", "span", "scripture", "figure", "figcaption",
]);

function safeUrl(value: string): string {
  const v = value.trim().toLowerCase();
  if (v.startsWith("javascript:") || v.startsWith("data:") || v.startsWith("vbscript:")) {
    return "#";
  }
  return value;
}

export function sanitizeServerHtml(html: string): string {
  let out = html;

  // Drop script/style/iframe blocks and HTML comments entirely.
  out = out
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<iframe[\s\S]*?(?:<\/iframe>|\/?>)/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  // Strip disallowed tags but keep their text content.
  out = out.replace(/<\/?([a-z][a-z0-9]*)\b[^>]*>/gi, (match, tag: string) => {
    if (ALLOWED_TAGS.has(tag.toLowerCase())) return match;
    return "";
  });

  // Neutralise event handlers and unsafe URL attributes.
  out = out
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, "")
    .replace(/\son\w+\s*=\s*'[^']*'/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, "")
    .replace(/(href|src)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi, (match, attr, _all, dq, sq, bare) => {
      const url = safeUrl(dq ?? sq ?? bare ?? "");
      return `${attr}="${url.replace(/"/g, "&quot;")}"`;
    });

  return out;
}
