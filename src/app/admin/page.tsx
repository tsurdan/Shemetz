import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { approveArticle, rejectArticle, unpublishArticle } from "./actions";
import { Button } from "@/components/button";
import { Check, X, EyeOff } from "lucide-react";

type PendingRow = {
  id: number;
  title: string;
  word_count: number;
  author_name: string;
  section_name: string;
};

type PublishedRow = {
  id: number;
  title: string;
  author_name: string;
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/dev-login");
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p>אין לכם הרשאת מנהל.</p>
      </div>
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const { results: pending } = await env.DB.prepare(
    `SELECT articles.id, articles.title, articles.word_count, users.name AS author_name, sections.name AS section_name
     FROM articles
     JOIN users ON users.id = articles.author_id
     JOIN sections ON sections.id = articles.section_id
     WHERE articles.status = 'pending_review'
     ORDER BY articles.submitted_at ASC`
  ).all<PendingRow>();

  const { results: published } = await env.DB.prepare(
    `SELECT articles.id, articles.title, users.name AS author_name
     FROM articles
     JOIN users ON users.id = articles.author_id
     WHERE articles.status = 'published'
     ORDER BY articles.published_at DESC`
  ).all<PublishedRow>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">אזור ניהול</h1>

      <h2 className="mt-8 text-lg font-semibold">ממתינים לאישור</h2>
      {pending.length === 0 ? (
        <p className="mt-2 text-black/60">אין מאמרים הממתינים לאישור.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {pending.map((article) => (
            <li key={article.id} className="rounded border border-black/10 px-4 py-3">
              <div className="font-medium">{article.title}</div>
              <div className="text-sm text-black/60">
                {article.author_name} · {article.section_name} · {article.word_count} מילים
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <form action={approveArticle}>
                  <input type="hidden" name="id" value={article.id} />
                  <Button type="submit" variant="primary">
                    <Check className="h-4 w-4" />
                    אישור ופרסום
                  </Button>
                </form>
                <form action={rejectArticle} className="flex items-center gap-2">
                  <input type="hidden" name="id" value={article.id} />
                  <input
                    name="note"
                    placeholder="הערת דחייה (אופציונלי)"
                    className="rounded border border-black/15 px-2 py-1.5 text-sm"
                  />
                  <Button type="submit" variant="danger">
                    <X className="h-4 w-4" />
                    דחייה
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-10 text-lg font-semibold">מפורסמים כרגע</h2>
      {published.length === 0 ? (
        <p className="mt-2 text-black/60">אין מאמרים מפורסמים כרגע.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {published.map((article) => (
            <li key={article.id} className="flex items-center justify-between rounded border border-black/10 px-4 py-3">
              <div>
                <div className="font-medium">{article.title}</div>
                <div className="text-sm text-black/60">{article.author_name}</div>
              </div>
              <form action={unpublishArticle}>
                <input type="hidden" name="id" value={article.id} />
                <Button type="submit" variant="danger">
                  <EyeOff className="h-4 w-4" />
                  הסרה מהאתר
                </Button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
