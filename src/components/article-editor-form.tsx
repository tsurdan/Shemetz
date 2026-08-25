"use client";

import { useState } from "react";
import { ARTICLE_WORD_LIMIT, countWords } from "@/lib/constants";
import { Button } from "@/components/button";
import { Save, Send } from "lucide-react";

type Section = { id: number; name: string };

export function ArticleEditorForm({
  action,
  articleId,
  initialTitle = "",
  initialSubtitle = "",
  initialSectionId,
  initialBody = "",
  sections,
}: {
  action: (formData: FormData) => void;
  articleId?: number;
  initialTitle?: string;
  initialSubtitle?: string;
  initialSectionId?: number;
  initialBody?: string;
  sections: Section[];
}) {
  const [body, setBody] = useState(initialBody);
  const wordCount = countWords(body);
  const overLimit = wordCount > ARTICLE_WORD_LIMIT;

  return (
    <form action={action} className="mt-6 space-y-4">
      {articleId && <input type="hidden" name="id" value={articleId} />}

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
      <select
        name="sectionId"
        defaultValue={initialSectionId}
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
      </select>
      <textarea
        name="body"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="תוכן המאמר"
        required
        rows={16}
        className="w-full rounded border border-black/15 px-3 py-2"
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
