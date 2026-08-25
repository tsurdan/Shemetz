"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { useRef, type ReactNode } from "react";
import {
  Bold,
  Italic,
  Heading2,
  Quote,
  List,
  ListOrdered,
  Link2,
  ImageIcon,
} from "lucide-react";
import { clsx } from "@/lib/clsx";

export function RichTextEditor({
  initialContent = "",
  onChange,
}: {
  initialContent?: string;
  onChange: (html: string, text: string) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: { openOnClick: false },
      }),
      TiptapImage,
      Placeholder.configure({ placeholder: "כתבו את המאמר כאן..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "prose max-w-none min-h-[16rem] focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML(), editor.getText());
    },
  });

  if (!editor) return null;

  async function uploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch("/api/upload", { method: "POST", body: formData });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      alert(data.error ?? "העלאת התמונה נכשלה");
      return;
    }
    editor?.chain().focus().setImage({ src: data.url }).run();
  }

  function toggleLink() {
    if (editor?.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("כתובת הקישור:");
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }

  function toolbarButton(active: boolean, onClick: () => void, icon: ReactNode, label: string) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={clsx(
          "rounded p-1.5 hover:bg-black/5",
          active ? "bg-black/10 text-black" : "text-black/60"
        )}
      >
        {icon}
      </button>
    );
  }

  return (
    <div className="rounded border border-black/15">
      <BubbleMenu editor={editor} className="flex gap-1 rounded-lg border border-black/10 bg-white p-1 shadow-lg">
        {toolbarButton(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />, "מודגש")}
        {toolbarButton(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />, "נטוי")}
        {toolbarButton(editor.isActive("link"), toggleLink, <Link2 className="h-4 w-4" />, "קישור")}
      </BubbleMenu>

      <div className="flex flex-wrap items-center gap-1 border-b border-black/10 bg-black/[.02] p-1.5">
        {toolbarButton(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold className="h-4 w-4" />, "מודגש")}
        {toolbarButton(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic className="h-4 w-4" />, "נטוי")}
        {toolbarButton(editor.isActive("heading", { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 className="h-4 w-4" />, "כותרת")}
        {toolbarButton(editor.isActive("blockquote"), () => editor.chain().focus().toggleBlockquote().run(), <Quote className="h-4 w-4" />, "ציטוט")}
        {toolbarButton(editor.isActive("bulletList"), () => editor.chain().focus().toggleBulletList().run(), <List className="h-4 w-4" />, "רשימה")}
        {toolbarButton(editor.isActive("orderedList"), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered className="h-4 w-4" />, "רשימה ממוספרת")}
        {toolbarButton(editor.isActive("link"), toggleLink, <Link2 className="h-4 w-4" />, "קישור")}
        {toolbarButton(false, () => fileInputRef.current?.click(), <ImageIcon className="h-4 w-4" />, "הוספת תמונה")}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadImage(file);
            event.target.value = "";
          }}
        />
      </div>
      <div className="px-3 py-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
