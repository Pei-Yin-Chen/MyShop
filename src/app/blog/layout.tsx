import { notFound } from "next/navigation";
import { BLOG_FEATURE_ENABLED } from "@/lib/site-features";

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  if (!BLOG_FEATURE_ENABLED) notFound();
  return <>{children}</>;
}
