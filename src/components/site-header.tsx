import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { signOut } from "@/app/dev-login/actions";

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
        <nav className="flex items-center gap-4 text-sm">
          {sections.map((section) => (
            <Link key={section.slug} href={`/section/${section.slug}`}>
              {section.name}
            </Link>
          ))}
          <Link href="/archive">גיליונות קודמים</Link>
          {user ? (
            <>
              <Link href="/write">כתיבה</Link>
              {user.role === "admin" && <Link href="/admin">ניהול</Link>}
              <form action={signOut}>
                <button type="submit" className="text-black/60 hover:underline">
                  יציאה ({user.name})
                </button>
              </form>
            </>
          ) : (
            <Link href="/dev-login">כניסה</Link>
          )}
        </nav>
      </div>
    </header>
  );
}
