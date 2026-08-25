import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";
import { plainTextToSafeHtml } from "@/lib/constants";

type ArticleRow = {
  id: number;
  title: string;
  subtitle: string | null;
  body_content: string;
  section_name: string;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const article = await env.DB.prepare(
    `SELECT articles.id, articles.title, articles.subtitle, articles.body_content, sections.name AS section_name
     FROM articles
     JOIN sections ON sections.id = articles.section_id
     WHERE articles.id = ?1 AND articles.status = 'published'`
  )
    .bind(id)
    .first<ArticleRow>();

  if (!article) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-2xl px-4 py-12">
      <span className="text-xs font-medium text-black/50">{article.section_name}</span>
      <h1 className="text-3xl font-bold">{article.title}</h1>
      {article.subtitle && <p className="mt-2 text-lg text-black/60">{article.subtitle}</p>}
      {/* body_content is plain text today (Phase 3's real rich-text editor will store HTML directly, sanitized). */}
      <div
        className="prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: plainTextToSafeHtml(article.body_content) }}
      />
    </article>
  );
}
