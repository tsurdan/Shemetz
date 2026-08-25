import { getCloudflareContext } from "@opennextjs/cloudflare";
import { signInAs } from "./actions";
import { ShieldCheck, PenLine } from "lucide-react";

type UserRow = { id: number; name: string; email: string; role: string };

export default async function DevLoginPage() {
  const { env } = await getCloudflareContext({ async: true });
  const { results: users } = await env.DB.prepare(
    `SELECT id, name, email, role FROM users ORDER BY id`
  ).all<UserRow>();

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-bold">כניסה (זמנית, למצב פיתוח)</h1>
      <p className="mt-2 text-sm text-black/60">
        זהו מסך זמני שמחליף כניסה עם Google עד שיוגדרו פרטי ה-OAuth האמיתיים. בחרו משתמש להתחברות איתו.
      </p>
      <ul className="mt-6 space-y-3">
        {users.map((user) => (
          <li key={user.id}>
            <form action={signInAs}>
              <input type="hidden" name="userId" value={user.id} />
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded border border-black/10 px-4 py-3 text-right hover:bg-black/[.03]"
              >
                {user.role === "admin" ? (
                  <ShieldCheck className="h-5 w-5 text-emerald-700" />
                ) : (
                  <PenLine className="h-5 w-5 text-black/40" />
                )}
                <span>
                  <span className="font-medium">{user.name}</span>{" "}
                  <span className="text-black/50">({user.role === "admin" ? "מנהל" : "כותב"})</span>
                </span>
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
