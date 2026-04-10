import DOMPurify from "isomorphic-dompurify";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  metaDescription: string | null;
  bodyHtml: string;
};

/** 站內說明頁（/about、/faq 等）共用版型與內文樣式 */
export function RichTextSitePage({ title, metaDescription, bodyHtml }: Props) {
  const safeHtml = DOMPurify.sanitize(bodyHtml);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {metaDescription ? (
              <p className="mt-3 text-muted-foreground">{metaDescription}</p>
            ) : null}
            <div
              className={cn(
                "mt-10 max-w-none text-foreground leading-relaxed",
                "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
                "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic",
                "[&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-foreground [&_h1]:mt-8 [&_h1]:mb-3 [&_h1:first-child]:mt-0",
                "[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground md:[&_h2]:text-2xl [&_h2]:mt-8 [&_h2]:mb-3 [&_h2:first-child]:mt-0",
                "[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2",
                "[&_p]:mb-4 [&_p]:text-foreground",
                "[&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1",
              )}
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
