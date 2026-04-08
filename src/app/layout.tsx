import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Navbar } from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "My Pâtisserie · 烘焙與甜點",
  description: "蛋糕、麵包與季節甜點，柔和風味與當日烘焙。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full min-h-0 antialiased`}
    >
      <body className="flex h-full min-h-0 flex-col overflow-x-hidden">
        <CartProvider>
          <Navbar />
          {/* flex-1 + min-h-0：與後台 flex-1 鏈銜接，避免內容撐出 body 出現雙重捲動 */}
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        </CartProvider>
      </body>
    </html>
  );
}
