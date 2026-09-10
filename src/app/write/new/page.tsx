import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { ArticleEditorForm } from "@/components/article-editor-form";
import { saveArticle } from "../actions";

export default async function NewArticlePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/google/login");

  const { env } = await getCloudflareContext({ async: true });
  const { results: sections } = await env.DB.prepare(
    `SELECT id, name FROM sections ORDER BY id`
  ).all<{ id: number; name: string }>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">מאמר חדש</h1>
      <ArticleEditorForm action={saveArticle} sections={sections} />
    </div>
  );
}
