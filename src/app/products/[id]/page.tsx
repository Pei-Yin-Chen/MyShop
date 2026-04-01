import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Breadcrumbs } from "@/components/products/Breadcrumbs";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { ProductInfo } from "@/components/products/ProductInfo";
import { RelatedProducts } from "@/components/products/RelatedProducts";
import { Separator } from "@/components/ui/separator";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return {};

  return {
    title: `${product.name} · My Pâtisserie`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const breadcrumbItems = [
    { label: "所有商品", href: "/products" },
    { label: product.category, href: `/products?category=${product.category}` },
    { label: product.name },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-grow bg-background">
        <div className="container mx-auto px-4 py-8 lg:py-12">
          {/* 麵包屑 */}
          <div className="mb-8">
            <Breadcrumbs items={breadcrumbItems} />
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            {/* 左側：圖庫 */}
            <ProductImageGallery 
              images={product.gallery || [product.image]} 
              name={product.name} 
            />

            {/* 右側：基本資訊 */}
            <ProductInfo product={product} />
          </div>

          {/* 詳細資料區塊 */}
          <div className="mt-20 lg:mt-28">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_320px] lg:gap-20">
              <div className="space-y-8">
                <h2 className="text-2xl font-semibold tracking-tight">詳細介紹</h2>
                <div className="prose prose-stone max-w-none text-muted-foreground leading-relaxed">
                  <p className="whitespace-pre-wrap">{product.fullDescription || product.description}</p>
                </div>
              </div>

              {/* 規格列表 */}
              {product.details && product.details.length > 0 && (
                <div className="rounded-2xl border border-border/80 bg-card/50 p-6 shadow-sm">
                  <h3 className="mb-5 font-semibold text-foreground">商品規格</h3>
                  <dl className="space-y-4 text-sm">
                    {product.details.map((detail, i) => (
                      <div key={i} className="flex flex-col gap-1">
                        <dt className="font-medium text-muted-foreground">{detail.label}</dt>
                        <dd className="text-foreground">{detail.value}</dd>
                        {i < product.details.length - 1 && <Separator className="mt-3 opacity-50" />}
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* 推薦商品 */}
          <div className="mt-24 border-t border-border/60 pt-20 lg:mt-32">
            <RelatedProducts currentId={product.id} category={product.category} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export async function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }));
}
