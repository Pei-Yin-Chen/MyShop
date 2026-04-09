import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/Navbar";
import { AppToaster } from "@/components/AppToaster";
import { fetchSiteSettings } from "@/lib/supabase/fetch-site-settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const site = await fetchSiteSettings();
  return {
    title: site.siteTitle,
    description: site.siteDescription || undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const site = await fetchSiteSettings();

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-0 antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-x-hidden">
        <CartProvider>
          <AppToaster />
          <Navbar initialSiteTitle={site.siteTitle} initialSiteLogoUrl={site.siteLogoUrl} />
          {/* flex-1 + min-h-0：與後台 flex-1 鏈銜接，避免內容撐出 body 出現雙重捲動 */}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
