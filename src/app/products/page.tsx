import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ProductCatalog } from "@/components/products/ProductCatalog";
import { fetchProductsForCatalog } from "@/lib/supabase/fetch-products";

export const metadata: Metadata = {
  title: "所有商品 · My Pâtisserie",
  description: "瀏覽蛋糕、麵包與甜點，依分類與篩選找到想要的品項。",
};

function CatalogFallback() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-20 text-center text-sm text-muted-foreground">
      載入商品列表…
    </div>
  );
}

async function CatalogSection() {
  const products = await fetchProductsForCatalog();
  return <ProductCatalog products={products} />;
}

export default function ProductsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<CatalogFallback />}>
          <CatalogSection />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
