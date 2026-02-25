/**
 * Serializes a TipTap editor JSON document to Telegram MarkdownV2 format.
 * @see https://core.telegram.org/bots/api#markdownv2-style
 */

type TipTapMark = {
  type: string;
  attrs?: Record<string, unknown>;
};

type TipTapNode = {
  type: string;
  text?: string;
  content?: TipTapNode[];
  marks?: TipTapMark[];
  attrs?: Record<string, unknown>;
};

type SerializeContext = {
  orderedIndex?: number;
};

/** MarkdownV2 special characters that must be escaped when used as literals */
const SPECIAL_RE = /([_*[\]()~`>#+=|{}.!\\-])/g;

function escapeV2(text: string): string {
  return text.replace(SPECIAL_RE, "\\$1");
}

/** Priority order for applying marks (innermost → outermost) */
const MARK_ORDER = ["code", "link", "underline", "strike", "italic", "bold"] as const;

function serializeTextNode(node: TipTapNode): string {
  const marks = node.marks ?? [];
  const hasCode = marks.some((m) => m.type === "code");

  // Inside code marks no escaping is needed
  let text = hasCode ? (node.text ?? "") : escapeV2(node.text ?? "");

  // Apply marks in priority order (innermost first)
  for (const markType of MARK_ORDER) {
    const mark = marks.find((m) => m.type === markType);
    if (!mark) continue;
    switch (mark.type) {
      case "bold":
        text = `*${text}*`;
        break;
      case "italic":
        text = `_${text}_`;
        break;
      case "underline":
        text = `__${text}__`;
        break;
      case "strike":
        text = `~${text}~`;
        break;
      case "code":
        text = `\`${text}\``;
        break;
      case "link": {
        const href = (mark.attrs?.href as string) ?? "";
        text = `[${text}](${href})`;
        break;
      }
    }
  }

  return text;
}

function serializeNode(node: TipTapNode, ctx: SerializeContext = {}): string {
  switch (node.type) {
    case "doc":
      return (node.content ?? [])
        .map((n) => serializeNode(n))
        .join("")
        .trimEnd();

    case "paragraph": {
      const inner = (node.content ?? []).map((n) => serializeNode(n)).join("");
      return inner + "\n";
    }

    case "text":
      return serializeTextNode(node);

    case "hardBreak":
      return "\n";

    case "codeBlock": {
      // No escaping inside code blocks
      const code = (node.content ?? []).map((n) => n.text ?? "").join("");
      return `\`\`\`\n${code}\n\`\`\`\n`;
    }

    case "bulletList":
      return (node.content ?? []).map((n) => serializeNode(n, {})).join("");

    case "orderedList":
      return (node.content ?? [])
        .map((n, i) => serializeNode(n, { orderedIndex: i + 1 }))
        .join("");

    case "listItem": {
      // Strip trailing newline from inner paragraph
      const inner = (node.content ?? [])
        .map((n) => serializeNode(n))
        .join("")
        .replace(/\n$/, "");
      if (ctx.orderedIndex !== undefined) {
        return `${ctx.orderedIndex}\\. ${inner}\n`;
      }
      return `• ${inner}\n`;
    }

    default:
      return (node.content ?? []).map((n) => serializeNode(n)).join("");
  }
}

export function tiptapToTelegramMarkdown(doc: TipTapNode): string {
  return serializeNode(doc);
}
