# TipTap Rich Text Editor — Commands & Knowledge Base

**Date:** 2026-02-25  
**Status:** Approved → Implementing  
**Approach:** A — TipTap + custom MarkdownV2 serializer

---

## Problem

Both the Command Menu drawer and Knowledge Base dialog use a plain `<Textarea>` for the message content field. Agents have no way to apply formatting (bold, italic, code blocks, links) when composing bot responses — they must memorise MarkdownV2 syntax manually.

---

## Goal

Replace `<Textarea>` in both editors with a TipTap rich text editor:
- Toolbar limited to Telegram-supported formatting only
- Live **split-panel** Telegram bubble preview (editor left, preview right)
- Output stored as **Telegram MarkdownV2** string — backend sends as-is, no extra conversion

---

## Packages

```
@tiptap/react
@tiptap/pm                        (peer dep)
@tiptap/starter-kit               (Bold, Italic, Strike, Code, CodeBlock, Lists, History)
@tiptap/extension-link
@tiptap/extension-underline
@tiptap/extension-placeholder
@tiptap/extension-character-count
```

---

## New Files

| File | Purpose |
|------|---------|
| `src/lib/tiptap-to-telegram.ts` | Serializer: TipTap JSON → Telegram MarkdownV2 |
| `src/lib/telegram-to-tiptap.ts` | Parser: MarkdownV2 → TipTap JSON (for edit init) |
| `src/components/ui/rich-text-editor.tsx` | `<RichTextEditor>` component |
| `src/components/ui/telegram-preview.tsx` | `<TelegramPreview>` dark bubble |

---

## Updated Files

| File | Change |
|------|--------|
| `src/app/(dashboard)/settings/_components/commands-tab.tsx` | Sheet → `max-w-[900px]`, replace Textarea+preview with split panel |
| `src/app/(dashboard)/settings/_components/knowledge-base-tab.tsx` | Dialog → `max-w-[880px]`, replace Textarea with split panel |
| `src/app/globals.css` | Add ProseMirror editor styles + placeholder |

---

## Data Flow

```
User types in TipTap editor
  └─ onUpdate (TipTap JSON doc)
      └─ tiptapToTelegramMarkdown(json)  → MarkdownV2 string
          ├─ form.setValue("content.text", markdown)  → saved to backend
          └─ <TelegramPreview markdown={...} />        → live preview
```

**Edit init flow:**
```
existing content.text (MarkdownV2)
  └─ telegramMarkdownToTiptap(str) → TipTap JSON
      └─ editor.setContent(json)
```

---

## MarkdownV2 Serializer

Walks TipTap JSON node tree recursively:

| TipTap | → Telegram MarkdownV2 |
|--------|----------------------|
| `bold` mark | `*text*` |
| `italic` mark | `_text_` |
| `underline` mark | `__text__` |
| `strike` mark | `~text~` |
| `code` mark | `` `text` `` |
| `link` mark (`href`) | `[text](url)` |
| `codeBlock` node | ` ```\ncontent\n``` ` |
| `bulletList` + `listItem` | `• item\n` |
| `orderedList` + `listItem` | `1\. item\n` |
| `paragraph` | text + `\n` |
| `hardBreak` | `\n` |

Special characters outside formatting are escaped with `\` per MarkdownV2 spec:  
`_ * [ ] ( ) ~ \` # + - = | { } . !`

---

## Reverse Parser (MarkdownV2 → TipTap)

Regex pipeline converts stored MarkdownV2 string to TipTap JSON for editing existing entries.  
Handles: bold, italic, underline, strike, inline code, code block, links, bullet/ordered lists, paragraphs.  
Edge case fallback: unrecognised syntax rendered as plain text.

---

## `<RichTextEditor>` Component API

```tsx
interface RichTextEditorProps {
  value: string;               // MarkdownV2 string (controlled)
  onChange: (md: string) => void;
  placeholder?: string;
  minHeight?: number;          // default 160px
  maxLength?: number;          // default 4096 (Telegram message limit)
  className?: string;
}
```

**Visual structure:**
```
┌──────────────────────────────────────────────┐  border-border-default, rounded-xl
│  B  I  U  S  │  `  {}  │  🔗  │  •  1.     │  toolbar, bg-card, border-b
├──────────────────────────────────────────────┤
│  Start typing…                               │  ProseMirror, min-h-[160px], px-4 py-3
│                                              │
├──────────────────────────────────────────────┤
│                                  142 / 4096  │  char count, data-mono, text-muted
└──────────────────────────────────────────────┘
focus-within: border-crimson/40
```

Toolbar buttons: active state via `editor.isActive('bold')` etc. → `bg-elevated text-text-primary`

---

## `<TelegramPreview>` Component API

```tsx
interface TelegramPreviewProps {
  markdown: string;            // MarkdownV2 string to render
  senderName?: string;         // default: "Titan Journal CRM"
  className?: string;
}
```

**Render pipeline:**  
`MarkdownV2 string → renderTelegramMarkdown(str) → safe HTML string → dangerouslySetInnerHTML`

Format mapping for preview rendering:  
`*bold*` → `<strong>`, `_italic_` → `<em>`, `__underline__` → `<u>`,  
`~strike~` → `<del>`, `` `code` `` → `<code>`,  
` ```block``` ` → `<pre><code>`, `[text](url)` → `<a target="_blank">`

**Visual:**
```
┌───────────────────────────────┐  bg-[#17212B], rounded-xl p-4
│  ┌──────────────────────┐     │
│  │ Hello *World*        │     │  bg-[#2B5278], rounded-2xl rounded-tl-sm
│  │ formatted rendering  │     │  text-white text-sm, whitespace-pre-wrap
│  └──────────────────────┘     │
│  Titan Journal CRM · just now │  text-[#6C7883], text-[10px], font-mono
└───────────────────────────────┘
```

---

## Layout: Commands Sheet

**Before:** `max-w-[480px]` Sheet, vertical stack, Textarea + separate preview block  
**After:** `max-w-[900px]` Sheet, two-column layout:

```
┌─────────────────────────────────────────────────────┐
│  Header: "Edit Command" / "New Command"              │
├──────────────────────┬──────────────────────────────┤
│  Command, Label,     │                              │
│  Description fields  │  Telegram Preview            │
│                      │  (sticky top)                │
│  ── Content ──       │  dark bubble, live           │
│  RichTextEditor      │                              │
│  (full width left)   │                              │
├──────────────────────┴──────────────────────────────┤
│  Cancel      Save Command                           │
└─────────────────────────────────────────────────────┘
```

Left column: `flex-1`, right column: `w-[320px]` sticky preview panel

---

## Layout: KB Dialog

**Before:** `max-w-lg` Dialog, Textarea in text tab  
**After:** `max-w-[880px]` Dialog, split panel in text tab:

```
┌──────────────────────────────────────────────────────┐
│  Title field (full width)                            │
├───────────────────────┬──────────────────────────────┤
│  RichTextEditor       │  Telegram Preview            │
│                       │                              │
└───────────────────────┴──────────────────────────────┘
```

---

## ProseMirror Global Styles (globals.css)

```css
/* TipTap editor */
.ProseMirror { outline: none; }
.ProseMirror p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--text-muted);
  pointer-events: none;
  float: left;
  height: 0;
}
.ProseMirror code { background: var(--bg-elevated); border-radius: 4px; padding: 1px 4px; font-family: var(--font-mono); font-size: 12px; }
.ProseMirror pre { background: var(--bg-elevated); border-radius: 8px; padding: 12px; overflow-x: auto; }
.ProseMirror pre code { background: transparent; padding: 0; }
.ProseMirror ul { list-style: disc; padding-left: 1.25rem; }
.ProseMirror ol { list-style: decimal; padding-left: 1.25rem; }
.ProseMirror a { color: var(--color-info); text-decoration: underline; }
```

---

## Acceptance Criteria

- [ ] TipTap editor renders in Commands drawer (split panel, 900px)
- [ ] TipTap editor renders in KB text tab (split panel, 880px)
- [ ] Toolbar reflects active formatting state
- [ ] MarkdownV2 output stored in `content.text` / `content`
- [ ] Telegram preview renders bold, italic, code, links visually
- [ ] Editing existing command/KB entry pre-populates editor correctly
- [ ] Character count shown, max 4096
- [ ] Light mode + dark mode compatible
- [ ] `pnpm build` passes (22/22)
