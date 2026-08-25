import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect, notFound } from "next/navigation";
import { ArticleEditorForm } from "@/components/article-editor-form";
import { saveArticle } from "../actions";

type ArticleRow = {
  id: number;
  author_id: number;
  title: string;
  subtitle: string | null;
  section_id: number;
  body_content: string;
  status: string;
  rejection_note: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "טיוטה",
  pending_review: "ממתין לאישור מנהל",
  published: "פורסם באתר",
  unpublished: "הוסר מהאתר",
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/dev-login");

  const { env } = await getCloudflareContext({ async: true });
  const article = await env.DB.prepare(
    `SELECT id, author_id, title, subtitle, section_id, body_content, status, rejection_note FROM articles WHERE id = ?1`
  )
    .bind(id)
    .first<ArticleRow>();

  if (!article || article.author_id !== user.userId) {
    notFound();
  }

  const editable = article.status === "draft" || article.status === "unpublished";

  if (!editable) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-2xl font-bold">{article.title}</h1>
        <p className="mt-2 text-black/60">סטטוס: {STATUS_LABELS[article.status] ?? article.status}</p>
        <div className="prose mt-6 max-w-none" dangerouslySetInnerHTML={{ __html: article.body_content }} />
      </div>
    );
  }

  const { results: sections } = await env.DB.prepare(
    `SELECT id, name FROM sections ORDER BY id`
  ).all<{ id: number; name: string }>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">עריכת מאמר</h1>
      {article.rejection_note && (
        <div className="mt-4 rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">
          הערת דחייה מהמנהל: {article.rejection_note}
        </div>
      )}
      <ArticleEditorForm
        action={saveArticle}
        articleId={article.id}
        initialTitle={article.title}
        initialSubtitle={article.subtitle ?? ""}
        initialSectionId={article.section_id}
        initialBody={article.body_content}
        sections={sections}
      />
    </div>
  );
}
