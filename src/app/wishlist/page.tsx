import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { WishlistContent } from "@/components/wishlist/WishlistContent";

export const metadata: Metadata = {
  title: "願望清單 · My Pâtisserie",
  description: "查看您收藏的商品。",
};

export default function WishlistPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <WishlistContent />
      </main>
      <Footer />
    </div>
  );
}
