import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { FeaturedProducts } from "@/components/FeaturedProducts";
import { ProductGallery } from "@/components/ProductGallery";
import { BrandPhilosophy } from "@/components/BrandPhilosophy";
import { ShoppingRules } from "@/components/ShoppingRules";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeaturedProducts />
        <ProductGallery />
        <BrandPhilosophy />
        <ShoppingRules />
      </main>
      <Footer />
    </div>
  );
}
