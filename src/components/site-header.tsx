import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/lib/session-actions";
import { PenLine, ShieldCheck, LogIn, LogOut, ChevronDown } from "lucide-react";

export async function SiteHeader() {
  const [user, { env }] = await Promise.all([getCurrentUser(), getCloudflareContext({ async: true })]);
  const { results: sections } = await env.DB.prepare(
    `SELECT slug, name FROM sections ORDER BY name`
  ).all<{ slug: string; name: string }>();

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xl font-bold">
            שמץ
          </Link>
          <nav className="hidden items-center gap-5 border-e border-black/10 pe-6 text-sm text-black/70 sm:flex">
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 hover:text-black [&::-webkit-details-marker]:hidden">
                נושאים
                <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
              </summary>
              <div className="absolute end-0 top-full z-30 mt-2 w-48 rounded-lg border border-black/10 bg-white p-1 shadow-lg">
                {sections.map((section) => (
                  <Link
                    key={section.slug}
                    href={`/section/${section.slug}`}
                    className="block rounded px-3 py-2 hover:bg-black/[.04]"
                  >
                    {section.name}
                  </Link>
                ))}
              </div>
            </details>
            <Link href="/archive" className="hover:text-black">
              גיליונות קודמים
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4 text-sm text-black/70">
          {user ? (
            <>
              <Link href="/write" className="flex items-center gap-1 hover:text-black">
                <PenLine className="h-4 w-4" />
                כתיבה
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1 hover:text-black">
                  <ShieldCheck className="h-4 w-4" />
                  ניהול
                </Link>
              )}
              <Link href="/profile" className="flex items-center gap-2 hover:text-black">
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-800">
                    {user.name[0]}
                  </span>
                )}
                {user.name}
              </Link>
              <form action={signOut}>
                <button type="submit" aria-label="יציאה" className="flex items-center text-black/50 hover:text-black">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <Link href="/api/auth/google/login" className="flex items-center gap-1 hover:text-black">
              <LogIn className="h-4 w-4" />
              כניסה
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
