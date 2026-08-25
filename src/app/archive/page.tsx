import { getCloudflareContext } from "@opennextjs/cloudflare";

type IssueRow = {
  id: number;
  title: string;
  month: number;
  year: number;
};

export default async function ArchivePage() {
  const { env } = await getCloudflareContext({ async: true });
  const { results: issues } = await env.DB.prepare(
    `SELECT id, title, month, year FROM issues WHERE status = 'published' ORDER BY year DESC, month DESC`
  ).all<IssueRow>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-2xl font-bold">גיליונות קודמים</h1>
      {issues.length === 0 ? (
        <p className="mt-4 text-black/60">עדיין לא פורסם אף גיליון.</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {issues.map((issue) => (
            <li key={issue.id}>{issue.title}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
