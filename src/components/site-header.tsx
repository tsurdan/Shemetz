import Link from "next/link";

const sections = [
  { slug: "cinema", name: "קולנוע" },
  { slug: "architecture", name: "אדריכלות" },
  { slug: "philosophy", name: "פילוסופיה" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-black/10 dark:border-white/15">
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
        </nav>
      </div>
    </header>
  );
}
