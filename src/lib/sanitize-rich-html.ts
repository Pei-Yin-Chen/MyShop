import sanitizeHtml from "sanitize-html";

/**
 * 後台／商品可含 HTML；前台輸出前消毒。使用 sanitize-html（純 JS、無 jsdom），
 * 避免 isomorphic-dompurify 在 Vercel 上觸發 ESM/CJS 與 jsdom 相依問題。
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "blockquote",
    "p",
    "a",
    "ul",
    "ol",
    "li",
    "b",
    "i",
    "strong",
    "em",
    "strike",
    "s",
    "code",
    "hr",
    "br",
    "div",
    "span",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "caption",
    "pre",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
  },
  allowedSchemesByTag: {
    img: ["http", "https"],
    a: ["http", "https", "mailto"],
  },
  allowProtocolRelative: false,
};

export function sanitizeRichHtml(dirty: string): string {
  return sanitizeHtml(dirty, OPTIONS);
}
