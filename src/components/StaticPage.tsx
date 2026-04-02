import { Footer } from "@/components/Footer";

type StaticPageProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function StaticPage({ title, description, children }: StaticPageProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-3 text-muted-foreground">{description}</p>
            ) : null}
            <div className="mt-10 space-y-8 text-[0.9375rem] leading-relaxed text-foreground">
              {children}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
