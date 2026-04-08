"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { normalizeDescriptionForEditor } from "@/lib/html/rich-text";

type Props = {
  /** 初始內容（純文字或 HTML）；搭配父層 key 在切換商品時重掛 */
  initialDescription?: string;
  invalid?: boolean;
};

export function ProductDescriptionEditor({ initialDescription, invalid }: Props) {
  const initialHtml = normalizeDescriptionForEditor(initialDescription);
  const [html, setHtml] = useState(initialHtml);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-2",
        },
      }),
      Placeholder.configure({
        placeholder: "輸入商品描述…",
      }),
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        id: "description",
        class: cn(
          "min-h-[220px] px-3 py-2 text-sm leading-relaxed outline-none",
          "[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold",
        ),
      },
    },
    onUpdate: ({ editor: ed }) => setHtml(ed.getHTML()),
  });

  if (!editor) {
    return (
      <div className="min-h-[260px] rounded-lg border border-border bg-muted/20 animate-pulse" />
    );
  }

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("連結網址", prev ?? "https://");
    if (url === null) return;
    const t = url.trim();
    if (t === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: t }).run();
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name="description" value={html} />

      <div
        className={cn(
          "overflow-hidden rounded-lg border bg-background transition-all",
          invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus-within:ring-2 focus-within:ring-primary/20",
        )}
      >
        <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/30 p-1.5">
          <Button
            type="button"
            variant={editor.isActive("bold") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleBold().run()}
            title="粗體"
            aria-label="粗體"
          >
            <Bold className="size-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("italic") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            title="斜體"
            aria-label="斜體"
          >
            <Italic className="size-4" />
          </Button>
          <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 1 }) ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            title="標題 1"
            aria-label="標題 1"
          >
            <Heading1 className="size-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("heading", { level: 2 }) ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            title="標題 2"
            aria-label="標題 2"
          >
            <Heading2 className="size-4" />
          </Button>
          <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />
          <Button
            type="button"
            variant={editor.isActive("bulletList") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            title="項目符號清單"
            aria-label="項目符號清單"
          >
            <List className="size-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("orderedList") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            title="編號清單"
            aria-label="編號清單"
          >
            <ListOrdered className="size-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive("blockquote") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            title="引用"
            aria-label="引用"
          >
            <Quote className="size-4" />
          </Button>
          <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />
          <Button
            type="button"
            variant={editor.isActive("link") ? "secondary" : "ghost"}
            size="icon-sm"
            className="size-8"
            onClick={() => setLink()}
            title="連結"
            aria-label="連結"
          >
            <Link2 className="size-4" />
          </Button>
          <span className="mx-0.5 w-px self-stretch bg-border" aria-hidden />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            title="復原"
            aria-label="復原"
          >
            <Undo className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="size-8"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            title="重做"
            aria-label="重做"
          >
            <Redo className="size-4" />
          </Button>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
