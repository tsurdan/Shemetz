import { getCloudflareContext } from "@opennextjs/cloudflare";
import { notFound } from "next/navigation";

type ArticleRow = {
  id: number;
  title: string;
  subtitle: string | null;
  body_content: string;
  cover_image_url: string | null;
  section_name: string;
  author_name: string;
  author_avatar_url: string | null;
};

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const article = await env.DB.prepare(
    `SELECT articles.id, articles.title, articles.subtitle, articles.body_content, articles.cover_image_url, sections.name AS section_name,
            users.name AS author_name, users.avatar_url AS author_avatar_url
     FROM articles
     JOIN sections ON sections.id = articles.section_id
     JOIN users ON users.id = articles.author_id
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

      <div className="mt-6 flex items-center gap-3 border-y border-black/10 py-4">
        {article.author_avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={article.author_avatar_url} alt="" className="h-10 w-10 rounded-full object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5 text-sm font-semibold text-black/40">
            {article.author_name[0]}
          </div>
        )}
        <span className="font-medium text-black/80">{article.author_name}</span>
      </div>

      {article.cover_image_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.cover_image_url}
          alt=""
          className="mt-6 h-auto w-full rounded-lg object-cover"
        />
      )}

      {/* body_content is sanitized HTML from the rich-text editor (sanitize-html on save, see write/actions.ts). */}
      <div
        className="prose mt-8 max-w-none"
        dangerouslySetInnerHTML={{ __html: article.body_content }}
      />
    </article>
  );
}
