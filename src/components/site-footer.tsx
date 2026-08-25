export function SiteFooter() {
  return (
    <footer className="border-t border-black/10">
      <div className="mx-auto max-w-4xl px-4 py-6 text-sm text-black/60">
        <p>© {new Date().getFullYear()} שמץ</p>
      </div>
    </footer>
  );
}
