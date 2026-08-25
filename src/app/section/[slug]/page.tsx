import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { notFound } from "next/navigation";

type ArticleRow = {
  id: number;
  title: string;
  subtitle: string | null;
};

export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const section = await env.DB.prepare(
    `SELECT id, name FROM sections WHERE slug = ?1`
  )
    .bind(slug)
    .first<{ id: number; name: string }>();

  if (!section) {
    notFound();
  }

  const { results: articles } = await env.DB.prepare(
    `SELECT id, title, subtitle FROM articles
     WHERE section_id = ?1 AND status = 'published'
     ORDER BY published_at DESC`
  )
    .bind(section.id)
    .all<ArticleRow>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">{section.name}</h1>
      {articles.length === 0 ? (
        <p className="mt-4 text-black/60">אין עדיין מאמרים בנושא זה.</p>
      ) : (
        <ul className="mt-6 space-y-6">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-black/10 pb-6">
              <Link href={`/article/${article.id}`} className="text-lg font-semibold hover:underline">
                {article.title}
              </Link>
              {article.subtitle && <p className="text-black/60">{article.subtitle}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
