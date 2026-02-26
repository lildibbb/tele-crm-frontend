"use client";

import { cn } from "@/lib/utils";
import { tiptapToTelegramMarkdown } from "@/lib/tiptap-to-telegram";

function escapeHtmlPreview(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Convert Telegram MarkdownV2 -> safe HTML for the preview bubble */
function renderTelegramMarkdown(markdown: string): string {
  if (!markdown?.trim()) return "";

  let html = markdown;

  // Unescape MarkdownV2 escape sequences
  html = html.replace(/\\([_*[\]()~`>#+=|{}.!\\-])/g, "$1");

  // Code blocks (``` ... ```) — process first
  html = html.replace(/```([\s\S]*?)```/g, (_, code) => {
    return `<pre class="tg-pre"><code>${escapeHtmlPreview(code.trim())}</code></pre>`;
  });

  // Inline code
  html = html.replace(
    /`([^`\n]+)`/g,
    (_, code) => `<code class="tg-code">${escapeHtmlPreview(code)}</code>`,
  );

  // Links [text](url) — before other formatting
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safe =
      url.startsWith("http://") || url.startsWith("https://") ? url : "#";
    return `<a href="${safe}" target="_blank" rel="noopener noreferrer" class="tg-link">${text}</a>`;
  });

  // Underline __text__ (before italic)
  html = html.replace(/__([^_\n]+)__/g, "<u>$1</u>");

  // Bold *text*
  html = html.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");

  // Italic _text_
  html = html.replace(/_([^_\n]+)_/g, "<em>$1</em>");

  // Strikethrough ~text~
  html = html.replace(/~([^~\n]+)~/g, "<del>$1</del>");

  // Bullet list items
  html = html.replace(/^• (.+)$/gm, '<span class="tg-bullet">$1</span>');

  // Line breaks
  html = html.replace(/\n/g, "<br>");

  return html;
}

// ── Extract plain text from Tiptap JSON ───────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractPlainText(node: Record<string, any>): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (Array.isArray(node.content)) {
    return node.content
      .map((child: Record<string, unknown>) =>
        extractPlainText(child as Record<string, unknown>),
      )
      .join(node.type === "paragraph" ? "\n" : "");
  }
  return "";
}

// ── Component ─────────────────────────────────────────────────────────────────

interface TelegramPreviewProps {
  /** Legacy: Telegram MarkdownV2 string */
  markdown?: string;
  /** Preferred: native Tiptap JSON doc */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tiptapJson?: Record<string, any>;
  senderName?: string;
  className?: string;
}

export function TelegramPreview({
  markdown,
  tiptapJson,
  senderName = "Titan Journal CRM",
  className,
}: TelegramPreviewProps) {
  // Compute directly without useMemo — ensures preview always reflects latest content
  // even if React batches or defers the render. tiptapJson object ref changes on every
  // editor update, so no stale-cache risk here.
  const resolvedMarkdown = tiptapJson
    ? tiptapToTelegramMarkdown(
        tiptapJson as Parameters<typeof tiptapToTelegramMarkdown>[0],
      )
    : (markdown ?? "");

  const rendered = renderTelegramMarkdown(resolvedMarkdown);

  if (!rendered) {
    return (
      <div
        className={cn(
          "bg-[#17212B] rounded-xl p-4 flex items-center justify-center min-h-[100px]",
          className,
        )}
      >
        <p className="text-[#4A5568] text-xs font-sans text-center leading-relaxed">
          Preview will appear here
          <br />
          as you type...
        </p>
      </div>
    );
  }

  return (
    <div className={cn("bg-[#17212B] rounded-xl p-4", className)}>
      <div className="bg-[#2B5278] rounded-2xl rounded-tl-sm px-4 py-3 inline-block max-w-[90%]">
        <div
          className="text-white text-sm font-sans leading-relaxed break-words tg-preview-content"
          dangerouslySetInnerHTML={{ __html: rendered }}
        />
      </div>
      <p className="text-[#6C7883] text-[10px] font-mono mt-1.5 select-none">
        {senderName} &middot; just now
      </p>
    </div>
  );
}
