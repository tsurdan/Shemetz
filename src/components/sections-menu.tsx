"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { clsx } from "@/lib/clsx";

export function SectionsMenu({ sections }: { sections: { slug: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex cursor-pointer items-center gap-1 hover:text-black"
      >
        נושאים
        <ChevronDown className={clsx("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute end-0 top-full z-30 mt-2 w-48 rounded-lg border border-black/10 bg-white p-1 shadow-lg">
          {sections.map((section) => (
            <Link
              key={section.slug}
              href={`/section/${section.slug}`}
              onClick={() => setOpen(false)}
              className="block rounded px-3 py-2 hover:bg-black/[.04]"
            >
              {section.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
