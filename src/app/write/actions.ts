"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ARTICLE_WORD_LIMIT, countWords } from "@/lib/constants";

export async function saveArticle(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/dev-login");

  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim() || null;
  const sectionId = Number(formData.get("sectionId"));
  const bodyText = String(formData.get("body") ?? "");
  const intent = String(formData.get("intent") ?? "draft"); // "draft" | "submit"
  const wordCount = countWords(bodyText);

  if (!title || !sectionId || !bodyText.trim()) {
    throw new Error("כותרת, נושא ותוכן הם שדות חובה");
  }
  if (intent === "submit" && wordCount > ARTICLE_WORD_LIMIT) {
    throw new Error(`המאמר חורג ממגבלת ${ARTICLE_WORD_LIMIT} מילים (יש בו ${wordCount} מילים)`);
  }

  const bodyHtml = bodyText;
  const status = intent === "submit" ? "pending_review" : "draft";
  const { env } = await getCloudflareContext({ async: true });

  const issue = await env.DB.prepare(
    `SELECT id FROM issues WHERE status = 'open' ORDER BY id DESC LIMIT 1`
  ).first<{ id: number }>();
  if (!issue) throw new Error("אין כרגע גיליון פתוח");

  if (id) {
    const existing = await env.DB.prepare(`SELECT author_id FROM articles WHERE id = ?1`)
      .bind(id)
      .first<{ author_id: number }>();
    if (!existing || existing.author_id !== user.userId) {
      throw new Error("אין הרשאה לערוך מאמר זה");
    }
    await env.DB.prepare(
      `UPDATE articles
       SET title=?1, subtitle=?2, section_id=?3, body_content=?4, word_count=?5, status=?6, rejection_note=NULL,
           submitted_at = CASE WHEN ?6 = 'pending_review' THEN datetime('now') ELSE submitted_at END,
           updated_at = datetime('now')
       WHERE id=?7`
    )
      .bind(title, subtitle, sectionId, bodyHtml, wordCount, status, id)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO articles (issue_id, author_id, section_id, title, subtitle, body_content, word_count, status, submitted_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, CASE WHEN ?8 = 'pending_review' THEN datetime('now') ELSE NULL END)`
    )
      .bind(issue.id, user.userId, sectionId, title, subtitle, bodyHtml, wordCount, status)
      .run();
  }

  redirect("/write");
}
