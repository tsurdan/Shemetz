export const ARTICLE_WORD_LIMIT = 900;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

// Escapes plain-text writer input before storing it as HTML, to avoid stored XSS
// until the real rich-text editor (Phase 3, TipTap) ships with proper HTML sanitization.
export function plainTextToSafeHtml(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
  return escaped
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${paragraph.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}
