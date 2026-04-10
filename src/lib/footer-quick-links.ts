import { validateCustomerServiceHref } from "@/lib/customer-service";

export type FooterQuickLinksContent = {
  aboutLabel: string;
  aboutHref: string;
};

export const DEFAULT_FOOTER_QUICK_LINKS: FooterQuickLinksContent = {
  aboutLabel: "關於我們",
  aboutHref: "/about",
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

export function normalizeFooterQuickLinks(raw: unknown): FooterQuickLinksContent {
  const d = DEFAULT_FOOTER_QUICK_LINKS;
  if (!isRecord(raw)) return { ...d };
  const aboutLabel = typeof raw.aboutLabel === "string" ? raw.aboutLabel.trim() : "";
  const aboutHref = typeof raw.aboutHref === "string" ? raw.aboutHref.trim() : "";
  return {
    aboutLabel: aboutLabel || d.aboutLabel,
    aboutHref: aboutHref || d.aboutHref,
  };
}

export function validateFooterQuickLinksContent(c: FooterQuickLinksContent): Record<string, string> {
  const e: Record<string, string> = {};
  if (!c.aboutLabel.trim()) e.aboutLabel = "請填寫「關於我們」連結文字";
  if (c.aboutLabel.length > 40) e.aboutLabel = "連結文字過長（最多 40 字）";
  const ah = validateCustomerServiceHref(c.aboutHref);
  if (ah) e.aboutHref = ah;
  return e;
}
