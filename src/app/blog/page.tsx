import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DEMO_BLOG_POSTS } from "@/data/blog-demos";

export const metadata: Metadata = {
  title: "部落格 · My Pâtisserie",
  description: "最新消息、品牌故事與活動文章（示範內容）。",
};

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("zh-Hant", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export default function BlogPage() {
  const sorted = [...DEMO_BLOG_POSTS].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              部落格
            </h1>
            <p className="mt-3 text-muted-foreground">
              示範文章列表，正式上線後可改接 CMS 或資料庫。
            </p>
          </div>

          <ul className="mx-auto mt-12 grid max-w-3xl list-none gap-6 p-0">
            {sorted.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Card className="border-border/60 transition-shadow group-hover:shadow-md">
                    <CardHeader className="pb-2">
                      <time
                        dateTime={post.publishedAt}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {formatDate(post.publishedAt)}
                      </time>
                      <CardTitle className="text-lg group-hover:text-primary group-focus-visible:text-primary">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <span className="mt-4 inline-block text-sm font-medium text-primary">
                        閱讀全文
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
