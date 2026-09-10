import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { approveArticle, rejectArticle } from "../../actions";
import { Button } from "@/components/button";
import { Check, X, ArrowRight } from "lucide-react";

type ArticleRow = {
  id: number;
  title: string;
  subtitle: string | null;
  body_content: string;
  status: string;
  word_count: number;
  author_name: string;
  section_name: string;
  issue_title: string;
  issue_month: number;
  issue_year: number;
};

export default async function AdminArticlePreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/google/login");
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p>אין לכם הרשאת מנהל.</p>
      </div>
    );
  }

  const { id } = await params;
  const { env } = await getCloudflareContext({ async: true });
  const article = await env.DB.prepare(
    `SELECT articles.id, articles.title, articles.subtitle, articles.body_content, articles.status, articles.word_count,
            users.name AS author_name, sections.name AS section_name,
            issues.title AS issue_title, issues.month AS issue_month, issues.year AS issue_year
     FROM articles
     JOIN users ON users.id = articles.author_id
     JOIN sections ON sections.id = articles.section_id
     JOIN issues ON issues.id = articles.issue_id
     WHERE articles.id = ?1`
  )
    .bind(id)
    .first<ArticleRow>();

  if (!article) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/admin" className="flex items-center gap-1 text-sm text-black/60 hover:text-black">
        <ArrowRight className="h-4 w-4" />
        חזרה לאזור ניהול
      </Link>

      <div className="mt-4 rounded border border-black/10 bg-black/[.02] px-4 py-3 text-sm text-black/70">
        <span className="font-medium">{article.author_name}</span> · {article.section_name} ·{" "}
        {article.issue_title} ({article.issue_month}/{article.issue_year}) · {article.word_count} מילים
      </div>

      <h1 className="mt-4 text-3xl font-bold">{article.title}</h1>
      {article.subtitle && <p className="mt-2 text-lg text-black/60">{article.subtitle}</p>}
      <div className="prose mt-8 max-w-none" dangerouslySetInnerHTML={{ __html: article.body_content }} />

      {article.status === "pending_review" && (
        <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/10 pt-6">
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
      )}
    </div>
  );
}
