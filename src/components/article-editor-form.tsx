"use client";

import { useState } from "react";
import { ARTICLE_WORD_LIMIT, countWords } from "@/lib/constants";
import { Button } from "@/components/button";
import { RichTextEditor } from "@/components/rich-text-editor";
import { CoverImageUploader } from "@/components/cover-image-uploader";
import { Save, Send } from "lucide-react";

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
  const [sectionValue, setSectionValue] = useState<string>(
    initialSectionId ? String(initialSectionId) : ""
  );
  const wordCount = countWords(bodyText);
  const overLimit = wordCount > ARTICLE_WORD_LIMIT;

  return (
    <form action={action} className="mt-6 space-y-4">
      {articleId && <input type="hidden" name="id" value={articleId} />}
      <input type="hidden" name="body" value={bodyHtml} />

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

      <CoverImageUploader name="coverImageUrl" initialUrl={initialCoverImageUrl} />

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
