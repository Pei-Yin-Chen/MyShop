import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { DEMO_BLOG_POSTS, getDemoPostBySlug } from "@/data/blog-demos";
import { ArrowLeft } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return DEMO_BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getDemoPostBySlug(slug);
  if (!post) return { title: "文章不存在" };
  return {
    title: `${post.title} · 烘焙誌`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getDemoPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <article className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 mb-8 text-muted-foreground"
              nativeButton={false}
              render={<Link href="/blog" />}
            >
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden />
              返回烘焙誌
            </Button>

            <header className="border-b border-border/60 pb-8">
              <time
                dateTime={post.publishedAt}
                className="text-sm font-medium text-muted-foreground"
              >
                {formatDate(post.publishedAt)}
              </time>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                {post.title}
              </h1>
              <p className="mt-4 text-muted-foreground">{post.excerpt}</p>
            </header>

            <div className="mt-10 space-y-6 text-[0.9375rem] leading-relaxed text-muted-foreground">
              {post.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}
