import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { approveArticle, rejectArticle, unpublishArticle, addWriter, openIssue, closeIssue } from "./actions";
import { Button } from "@/components/button";
import { Check, X, EyeOff, UserPlus, BookOpen, Lock } from "lucide-react";

type IssueRow = {
  id: number;
  title: string;
  month: number;
  year: number;
};

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

type WriterRow = {
  id: number;
  name: string;
  email: string;
  role: string;
  google_sub: string;
};

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/api/auth/google/login");
  if (user.role !== "admin") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p>אין לכם הרשאת מנהל.</p>
      </div>
    );
  }

  const { env } = await getCloudflareContext({ async: true });
  const openIssueRow = await env.DB.prepare(
    `SELECT id, title, month, year FROM issues WHERE status = 'open' ORDER BY id DESC LIMIT 1`
  ).first<IssueRow>();

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

  const { results: writers } = await env.DB.prepare(
    `SELECT id, name, email, role, google_sub FROM users ORDER BY id`
  ).all<WriterRow>();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">אזור ניהול</h1>

      <h2 className="mt-8 text-lg font-semibold">הגיליון הנוכחי</h2>
      {openIssueRow ? (
        <div className="mt-2 flex items-center justify-between rounded border border-black/10 px-4 py-3">
          <div>
            <div className="font-medium">{openIssueRow.title}</div>
            <div className="text-sm text-black/60">
              {openIssueRow.month}/{openIssueRow.year} · פתוח לכתיבה
            </div>
          </div>
          <form action={closeIssue}>
            <input type="hidden" name="id" value={openIssueRow.id} />
            <Button type="submit" variant="danger">
              <Lock className="h-4 w-4" />
              סגירת הגיליון
            </Button>
          </form>
        </div>
      ) : (
        <form action={openIssue} className="mt-2 flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-black/60">חודש</label>
            <input
              name="month"
              type="number"
              min={1}
              max={12}
              defaultValue={new Date().getMonth() + 1}
              required
              className="w-20 rounded border border-black/15 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-black/60">שנה</label>
            <input
              name="year"
              type="number"
              defaultValue={new Date().getFullYear()}
              required
              className="w-24 rounded border border-black/15 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-black/60">כותרת הגיליון</label>
            <input name="title" required className="rounded border border-black/15 px-2 py-1.5 text-sm" />
          </div>
          <Button type="submit" variant="primary">
            <BookOpen className="h-4 w-4" />
            פתיחת גיליון
          </Button>
        </form>
      )}

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

      <h2 className="mt-10 text-lg font-semibold">כותבים מאושרים</h2>
      <p className="mt-1 text-sm text-black/60">
        הוסיפו כתובת אימייל כאן לפני שהכותב/ת מתחבר/ת לראשונה עם Google - כדי שיוכלו להתחבר בכלל.
      </p>
      <form action={addWriter} className="mt-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs text-black/60">שם</label>
          <input name="name" required className="rounded border border-black/15 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-black/60">אימייל</label>
          <input name="email" type="email" required className="rounded border border-black/15 px-2 py-1.5 text-sm" />
        </div>
        <div>
          <label className="block text-xs text-black/60">תפקיד</label>
          <select name="role" className="rounded border border-black/15 px-2 py-1.5 text-sm">
            <option value="writer">כותב/ת</option>
            <option value="admin">מנהל/ת</option>
          </select>
        </div>
        <Button type="submit" variant="primary">
          <UserPlus className="h-4 w-4" />
          הוספת כותב/ת
        </Button>
      </form>
      <ul className="mt-4 space-y-2">
        {writers.map((writer) => (
          <li key={writer.id} className="flex items-center justify-between rounded border border-black/10 px-4 py-2 text-sm">
            <span>
              <span className="font-medium">{writer.name}</span>{" "}
              <span className="text-black/50">({writer.email})</span>
            </span>
            <span className="flex items-center gap-2 text-black/50">
              {writer.role === "admin" ? "מנהל/ת" : "כותב/ת"}
              {writer.google_sub.startsWith("pending:") && (
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800">טרם התחבר/ה</span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
