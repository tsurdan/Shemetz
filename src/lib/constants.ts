export const ARTICLE_WORD_LIMIT = 900;

export function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
