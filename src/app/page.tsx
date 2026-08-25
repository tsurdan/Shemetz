import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";

type ArticleRow = {
  id: number;
  title: string;
  subtitle: string | null;
  section_name: string;
};

export default async function Home() {
  const { env } = await getCloudflareContext({ async: true });
  const { results: articles } = await env.DB.prepare(
    `SELECT articles.id, articles.title, articles.subtitle, sections.name AS section_name
     FROM articles
     JOIN sections ON sections.id = articles.section_id
     JOIN issues ON issues.id = articles.issue_id
     WHERE articles.status = 'published' AND issues.status = 'open'
     ORDER BY articles.published_at DESC`
  ).all<ArticleRow>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">הגיליון הנוכחי</h1>
      {articles.length === 0 ? (
        <p className="mt-4 text-black/60">
          עדיין אין כאן מאמרים - הגיליון הראשון בדרך.
        </p>
      ) : (
        <ul className="mt-6 space-y-6">
          {articles.map((article) => (
            <li key={article.id} className="border-b border-black/10 pb-6">
              <span className="text-xs font-medium text-black/50">{article.section_name}</span>
              <h2 className="text-lg font-semibold">
                <Link href={`/article/${article.id}`} className="hover:underline">
                  {article.title}
                </Link>
              </h2>
              {article.subtitle && (
                <p className="text-black/60">{article.subtitle}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
