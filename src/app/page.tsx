import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ProductGallery } from "@/components/ProductGallery";
import { BrandPhilosophy } from "@/components/BrandPhilosophy";
import { ShoppingRules } from "@/components/ShoppingRules";
import { Footer } from "@/components/Footer";
import { fetchFeaturedProducts } from "@/lib/supabase/fetch-products";
import { fetchHomePageContent } from "@/lib/supabase/fetch-home-page";

export default async function Home() {
  const [featuredProducts, home] = await Promise.all([
    fetchFeaturedProducts(),
    fetchHomePageContent(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero content={home.hero} />
        <FeaturedProducts products={featuredProducts} intro={home.featured_intro} />
        <ProductGallery content={home.product_gallery} />
        <BrandPhilosophy content={home.brand_philosophy} />
        <ShoppingRules content={home.shopping_rules} />
      </main>
      <Footer />
    </div>
  );
}
