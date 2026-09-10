"use client";

import { useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { ImageIcon, X, Loader2 } from "lucide-react";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

export function CoverImageUploader({
  name,
  initialUrl = null,
}: {
  name: string;
  initialUrl?: string | null;
}) {
  const [url, setUrl] = useState<string | null>(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);
    if (!ALLOWED_TYPES.has(file.type)) {
      setError("סוג קובץ לא נתמך - יש להעלות PNG, JPEG, WebP או GIF");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(`תגובה לא צפויה מהשרת (${response.status})`);
      }
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "העלאת התמונה נכשלה");
      }
      setUrl(data.url);
    } catch (uploadError) {
      console.error("Cover image upload failed", uploadError);
      setError(uploadError instanceof Error ? uploadError.message : "העלאת התמונה נכשלה");
    } finally {
      setUploading(false);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(event.clipboardData.items).find((entry) => entry.type.startsWith("image/"));
    const file = item?.getAsFile();
    if (file) {
      event.preventDefault();
      upload(file);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) upload(file);
  }

  return (
    <div>
      <label className="mb-1 block text-sm text-black/60">
        תמונה ראשית (מוצגת בעמוד הבית וברשימת המאמרים)
      </label>
      <input type="hidden" name={name} value={url ?? ""} />

      {url ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="h-40 w-full rounded object-cover" />
          <button
            type="button"
            onClick={() => setUrl(null)}
            aria-label="הסרת התמונה"
            className="absolute end-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          tabIndex={0}
          onPaste={handlePaste}
          onDrop={handleDrop}
          onDragOver={(event) => event.preventDefault()}
          onClick={() => fileInputRef.current?.click()}
          className="flex h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded border border-dashed border-black/20 text-sm text-black/50 hover:bg-black/[.02] focus:outline-none focus:ring-2 focus:ring-black/20"
        >
          {uploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <ImageIcon className="h-5 w-5" />
              <span>לחצו לבחירת תמונה, גררו לכאן, או הדביקו מהלוח (Ctrl+V)</span>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) upload(file);
              event.target.value = "";
            }}
          />
        </div>
      )}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
