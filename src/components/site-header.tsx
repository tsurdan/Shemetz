import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/app/dev-login/actions";
import { PenLine, ShieldCheck, LogIn, LogOut } from "lucide-react";

const sections = [
  { slug: "cinema", name: "קולנוע" },
  { slug: "architecture", name: "אדריכלות" },
  { slug: "philosophy", name: "פילוסופיה" },
];

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold">
          שמץ
        </Link>
        <nav className="flex items-center gap-4 text-sm text-black/70">
          {sections.map((section) => (
            <Link key={section.slug} href={`/section/${section.slug}`} className="hover:text-black">
              {section.name}
            </Link>
          ))}
          <Link href="/archive" className="hover:text-black">
            גיליונות קודמים
          </Link>
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
                <button type="submit" className="flex items-center gap-1 text-black/50 hover:text-black">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </>
          ) : (
            <Link href="/dev-login" className="flex items-center gap-1 hover:text-black">
              <LogIn className="h-4 w-4" />
              כניסה
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
