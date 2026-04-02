import { redirect } from "next/navigation";
import { Footer } from "@/components/Footer";
import { createClient } from "@/lib/supabase/server";
import { MemberTabsNav } from "@/app/member/member-tabs-nav";

type ProfileRow = {
  full_name: string | null;
};

export default async function MemberLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirectTo=/member");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle<ProfileRow>();

  const name = profile?.full_name?.trim() || user.email || "會員";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10 lg:py-14">
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">會員中心</h1>
            <p className="mt-1 text-sm text-muted-foreground">{name}，歡迎回來。</p>
          </header>
          <MemberTabsNav />
          <section className="mt-6 min-w-0">{children}</section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

