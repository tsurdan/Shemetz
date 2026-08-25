import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";

type ArticleRow = {
  id: number;
  title: string;
  status: string;
  word_count: number;
  rejection_note: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "טיוטה",
  pending_review: "ממתין לאישור",
  published: "פורסם",
  unpublished: "הוסר מהאתר",
};

export default async function WriteDashboard() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/dev-login");
  }

  const { env } = await getCloudflareContext({ async: true });
  const { results: articles } = await env.DB.prepare(
    `SELECT id, title, status, word_count, rejection_note FROM articles WHERE author_id = ?1 ORDER BY updated_at DESC`
  )
    .bind(user.userId)
    .all<ArticleRow>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">אזור כתיבה</h1>
        <Link href="/write/new" className="rounded bg-black px-4 py-2 text-white">
          מאמר חדש
        </Link>
      </div>

      {articles.length === 0 ? (
        <p className="mt-6 text-black/60">עדיין לא כתבתם מאמרים.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {articles.map((article) => (
            <li key={article.id} className="rounded border border-black/10 px-4 py-3">
              <Link href={`/write/${article.id}`} className="font-medium hover:underline">
                {article.title}
              </Link>
              <div className="mt-1 text-sm text-black/60">
                {STATUS_LABELS[article.status] ?? article.status} · {article.word_count} מילים
              </div>
              {article.status === "draft" && article.rejection_note && (
                <div className="mt-2 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  הערת דחייה: {article.rejection_note}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
