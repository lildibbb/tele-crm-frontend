/**
 * Converts a Telegram MarkdownV2 string to HTML that TipTap can parse.
 * Used for initialising the editor when editing existing content.
 *
 * TipTap HTML conventions used:
 *   <strong>  bold       <em>      italic
 *   <u>       underline  <s>       strikethrough
 *   <code>    inline code
 *   <pre><code>  code block
 *   <ul><li><p>  bullet list
 *   <ol><li><p>  ordered list
 *   <a href>  link
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Apply inline MarkdownV2 formatting and return HTML */
function processInline(raw: string): string {
  // First unescape MarkdownV2 escape sequences
  let s = raw.replace(/\\([_*[\]()~`>#+=|{}.!\\-])/g, "$1");

  // Links [text](url) — process before other formatting
  s = s.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    (_, text, url) => {
      const safe = url.startsWith("http://") || url.startsWith("https://") ? url : "#";
      return `<a href="${escapeHtml(safe)}">${text}</a>`;
    },
  );

  // Underline __text__ — must come before italic _text_
  s = s.replace(/__([^_\n]+)__/g, "<u>$1</u>");

  // Bold *text*
  s = s.replace(/\*([^*\n]+)\*/g, "<strong>$1</strong>");

  // Italic _text_
  s = s.replace(/_([^_\n]+)_/g, "<em>$1</em>");

  // Strikethrough ~text~
  s = s.replace(/~([^~\n]+)~/g, "<s>$1</s>");

  // Inline code `text`
  s = s.replace(/`([^`\n]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`);

  return s;
}

export function telegramMarkdownToHtml(markdown: string): string {
  if (!markdown?.trim()) return "<p></p>";

  const lines = markdown.split("\n");
  const output: string[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // ── Code block: ``` ... ``` ───────────────────────────────────────────
    if (line.trim() === "```") {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== "```") {
        codeLines.push(lines[i]);
        i++;
      }
      output.push(
        `<pre><code>${escapeHtml(codeLines.join("\n"))}</code></pre>`,
      );
      i++; // skip closing ```
      continue;
    }

    // ── Bullet list items (• item) ────────────────────────────────────────
    if (line.startsWith("• ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("• ")) {
        items.push(`<li><p>${processInline(lines[i].slice(2))}</p></li>`);
        i++;
      }
      output.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // ── Ordered list items (1\. item  or  1. item) ────────────────────────
    if (/^\d+\\?\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\\?\. /.test(lines[i])) {
        const text = lines[i].replace(/^\d+\\?\. /, "");
        items.push(`<li><p>${processInline(text)}</p></li>`);
        i++;
      }
      output.push(`<ol>${items.join("")}</ol>`);
      continue;
    }

    // ── Empty line → paragraph separator ─────────────────────────────────
    if (line.trim() === "") {
      i++;
      continue;
    }

    // ── Regular paragraph (collect consecutive normal lines) ──────────────
    const paragraphLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !lines[i].startsWith("• ") &&
      !/^\d+\\?\. /.test(lines[i]) &&
      lines[i].trim() !== "```"
    ) {
      paragraphLines.push(processInline(lines[i]));
      i++;
    }
    if (paragraphLines.length > 0) {
      output.push(`<p>${paragraphLines.join("<br>")}</p>`);
    }
  }

  return output.length > 0 ? output.join("") : "<p></p>";
}
