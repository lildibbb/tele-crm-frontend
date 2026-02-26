"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Code2,
  Link as LinkIcon,
  Unlink,
  List,
  ListOrdered,
  Undo2,
  Redo2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { tiptapToTelegramMarkdown } from "@/lib/tiptap-to-telegram";
import { telegramMarkdownToHtml } from "@/lib/telegram-to-tiptap";

// ── Toolbar primitives ────────────────────────────────────────────────────────

interface ToolbarBtnProps {
  isActive?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}

function ToolbarBtn({
  isActive,
  onClick,
  title,
  children,
  disabled,
}: ToolbarBtnProps) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={cn(
        "p-1.5 rounded-md transition-colors",
        isActive
          ? "bg-elevated text-text-primary"
          : "text-text-muted hover:text-text-primary hover:bg-elevated",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <span className="w-px h-4 bg-border-subtle mx-0.5 flex-shrink-0 self-center" />
  );
}

// ── TipTap JSON types ─────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TiptapJsonDoc = Record<string, any>;

// ── Main component ────────────────────────────────────────────────────────────

export interface RichTextEditorProps {
  /** Legacy markdown string mode (default) */
  value?: string;
  onChange?: (markdown: string) => void;

  /** JSON mode — pass Tiptap JSON doc directly */
  jsonContent?: TiptapJsonDoc;
  onJsonChange?: (json: TiptapJsonDoc) => void;

  /** Which mode: "markdown" emits Telegram MarkdownV2 string, "json" emits native Tiptap JSON */
  mode?: "markdown" | "json";

  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  fillHeight?: boolean;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  jsonContent,
  onJsonChange,
  mode = "markdown",
  placeholder = "Start typing...",
  minHeight = 160,
  maxLength = 4096,
  fillHeight = false,
  className,
}: RichTextEditorProps) {
  const [showLinkInput, setShowLinkInput] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");
  const linkInputRef = React.useRef<HTMLInputElement>(null);

  // Track last emitted value so we don't re-parse on every render
  const lastEmittedMd = React.useRef(value);
  const lastEmittedJsonRef = React.useRef<string>(
    jsonContent ? JSON.stringify(jsonContent) : "",
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "tg-link",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      Underline,
      Placeholder.configure({ placeholder }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content:
      mode === "json"
        ? jsonContent || { type: "doc", content: [{ type: "paragraph" }] }
        : telegramMarkdownToHtml(value ?? ""),
    immediatelyRender: false,
    onUpdate: ({ editor: e }) => {
      if (mode === "json") {
        const json = e.getJSON();
        lastEmittedJsonRef.current = JSON.stringify(json);
        onJsonChange?.(json);
      } else {
        const md = tiptapToTelegramMarkdown(e.getJSON());
        lastEmittedMd.current = md;
        onChange?.(md);
      }
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none text-sm font-sans text-text-primary leading-relaxed",
      },
    },
  });

  // Sync when parent changes value externally (markdown mode)
  React.useEffect(() => {
    if (!editor || mode !== "markdown") return;
    if (value !== lastEmittedMd.current) {
      lastEmittedMd.current = value;
      editor.commands.setContent(telegramMarkdownToHtml(value ?? ""));
    }
  }, [editor, value, mode]);

  // Sync when parent changes jsonContent externally (json mode)
  React.useEffect(() => {
    if (!editor || mode !== "json" || !jsonContent) return;
    const incoming = JSON.stringify(jsonContent);
    if (incoming !== lastEmittedJsonRef.current) {
      lastEmittedJsonRef.current = incoming;
      editor.commands.setContent(jsonContent);
    }
  }, [editor, jsonContent, mode]);

  // ── Link helpers ────────────────────────────────────────────────────────────
  const applyLink = React.useCallback(() => {
    if (!editor) return;
    if (linkUrl.trim()) {
      editor.chain().focus().setLink({ href: linkUrl.trim() }).run();
    }
    setShowLinkInput(false);
    setLinkUrl("");
  }, [editor, linkUrl]);

  const toggleLink = React.useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    setShowLinkInput((v) => !v);
    setTimeout(() => linkInputRef.current?.focus(), 30);
  }, [editor]);

  // ── Char count ──────────────────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const charCount: number =
    (editor?.storage?.characterCount as any)?.characters?.() ?? 0;
  const isOverLimit = charCount >= maxLength;

  return (
    <div
      className={cn(
        "rounded-xl border border-border-default bg-card overflow-hidden transition-colors focus-within:border-crimson/40",
        fillHeight && "flex flex-col h-full",
        className,
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border-subtle flex-wrap">
        <ToolbarBtn
          isActive={editor?.isActive("bold")}
          onClick={() => editor?.chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          isActive={editor?.isActive("italic")}
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          isActive={editor?.isActive("underline")}
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          isActive={editor?.isActive("strike")}
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          isActive={editor?.isActive("code")}
          onClick={() => editor?.chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          isActive={editor?.isActive("codeBlock")}
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          title="Code Block"
        >
          <Code2 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          isActive={editor?.isActive("link")}
          onClick={toggleLink}
          title={editor?.isActive("link") ? "Remove Link" : "Insert Link"}
        >
          {editor?.isActive("link") ? (
            <Unlink className="h-3.5 w-3.5" />
          ) : (
            <LinkIcon className="h-3.5 w-3.5" />
          )}
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          isActive={editor?.isActive("bulletList")}
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <List className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          isActive={editor?.isActive("orderedList")}
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <Divider />

        <ToolbarBtn
          onClick={() => editor?.chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
          disabled={!editor?.can().undo()}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        <ToolbarBtn
          onClick={() => editor?.chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
          disabled={!editor?.can().redo()}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </ToolbarBtn>

        {/* ── Inline link URL input ── */}
        {showLinkInput && (
          <div className="flex items-center gap-1.5 w-full mt-1.5">
            <input
              ref={linkInputRef}
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
                if (e.key === "Escape") {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }
              }}
              placeholder="https://example.com"
              className="flex-1 h-7 px-2.5 text-xs rounded-lg bg-elevated border border-border-default focus:border-crimson/40 focus:outline-none text-text-primary placeholder:text-text-muted"
            />
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                applyLink();
              }}
              className="h-7 px-3 text-xs rounded-lg bg-crimson text-white hover:bg-crimson/90 transition-colors font-medium"
            >
              Apply
            </button>
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="h-7 w-7 flex items-center justify-center text-xs rounded-lg text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
            >
              <span aria-hidden>&#x2715;</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Editor body ── */}
      <div
        className={cn(
          "px-4 py-3 cursor-text",
          fillHeight && "flex-1 overflow-y-auto",
        )}
        style={fillHeight ? undefined : { minHeight }}
        onClick={() => editor?.commands.focus()}
      >
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer: char count ── */}
      <div className="px-4 py-2 border-t border-border-subtle">
        <span
          className={cn(
            "data-mono text-[11px] float-right",
            isOverLimit ? "text-danger" : "text-text-muted",
          )}
        >
          {charCount.toLocaleString()} / {maxLength.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
