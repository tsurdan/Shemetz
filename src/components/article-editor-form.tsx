"use client";

import { useState } from "react";
import { ARTICLE_WORD_LIMIT, countWords } from "@/lib/constants";
import { Button } from "@/components/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { Save, Send, ImageIcon, X } from "lucide-react";

type Section = { id: number; name: string };

const NEW_SECTION_VALUE = "__new__";

export function ArticleEditorForm({
  action,
  articleId,
  initialTitle = "",
  initialSubtitle = "",
  initialSectionId,
  initialBody = "",
  initialCoverImageUrl = null,
  sections,
}: {
  action: (formData: FormData) => void;
  articleId?: number;
  initialTitle?: string;
  initialSubtitle?: string;
  initialSectionId?: number;
  initialBody?: string;
  initialCoverImageUrl?: string | null;
  sections: Section[];
}) {
  const [bodyText, setBodyText] = useState(""); // plain text, used only for the live word count
  const [bodyHtml, setBodyHtml] = useState(initialBody);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initialCoverImageUrl);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [sectionValue, setSectionValue] = useState<string>(
    initialSectionId ? String(initialSectionId) : ""
  );
  const wordCount = countWords(bodyText);
  const overLimit = wordCount > ARTICLE_WORD_LIMIT;

  async function uploadCoverImage(file: File) {
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", { method: "POST", body: formData });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        alert(data.error ?? "העלאת התמונה נכשלה");
        return;
      }
      setCoverImageUrl(data.url);
    } finally {
      setUploadingCover(false);
    }
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      {articleId && <input type="hidden" name="id" value={articleId} />}
      <input type="hidden" name="body" value={bodyHtml} />
      <input type="hidden" name="coverImageUrl" value={coverImageUrl ?? ""} />

      <input
        name="title"
        defaultValue={initialTitle}
        placeholder="כותרת"
        required
        className="w-full rounded border border-black/15 px-3 py-2 text-lg font-semibold"
      />
      <input
        name="subtitle"
        defaultValue={initialSubtitle}
        placeholder="תת כותרת (אופציונלי)"
        className="w-full rounded border border-black/15 px-3 py-2"
      />

      <div>
        <label className="mb-1 block text-sm text-black/60">תמונת ראשית (מוצגת בעמוד הבית וברשימת המאמרים)</label>
        {coverImageUrl ? (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={coverImageUrl} alt="" className="h-40 w-full rounded object-cover" />
            <button
              type="button"
              onClick={() => setCoverImageUrl(null)}
              aria-label="הסרת התמונה"
              className="absolute end-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex h-24 w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-black/20 text-sm text-black/50 hover:bg-black/[.02]">
            <ImageIcon className="h-4 w-4" />
            {uploadingCover ? "מעלה..." : "בחרת תמונה"}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadCoverImage(file);
              }}
            />
          </label>
        )}
      </div>

      <div>
        <select
          name={sectionValue === NEW_SECTION_VALUE ? undefined : "sectionId"}
          value={sectionValue}
          onChange={(event) => setSectionValue(event.target.value)}
          required
          className="w-full rounded border border-black/15 px-3 py-2"
        >
          <option value="" disabled>
            בחרו נושא
          </option>
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.name}
            </option>
          ))}
          <option value={NEW_SECTION_VALUE}>+ הוספת נושא חדש</option>
        </select>
        {sectionValue === NEW_SECTION_VALUE && (
          <input
            name="newSectionName"
            placeholder="שם הנושא החדש"
            required
            autoFocus
            className="mt-2 w-full rounded border border-black/15 px-3 py-2"
          />
        )}
      </div>

      <RichTextEditor
        initialContent={initialBody}
        onChange={(html, text) => {
          setBodyHtml(html);
          setBodyText(text);
        }}
      />

      <p className={overLimit ? "text-sm font-medium text-red-600" : "text-sm text-black/60"}>
        {wordCount} / {ARTICLE_WORD_LIMIT} מילים
        {overLimit && " - יש לקצר כדי לשלוח לאישור (טיוטה ניתן לשמור בכל אורך)"}
      </p>

      <div className="flex gap-3">
        <Button type="submit" name="intent" value="draft" variant="neutral">
          <Save className="h-4 w-4" />
          שמירת טיוטה
        </Button>
        <Button type="submit" name="intent" value="submit" disabled={overLimit} variant="primary">
          <Send className="h-4 w-4" />
          שליחה לאישור
        </Button>
      </div>
    </form>
  );
}
