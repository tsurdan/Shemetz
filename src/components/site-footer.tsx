export function SiteFooter() {
  return (
    <footer className="border-t border-black/10 dark:border-white/15">
      <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-black/60 dark:text-white/60">
        <p>© {new Date().getFullYear()} שמץ</p>
      </div>
    </footer>
  );
}
