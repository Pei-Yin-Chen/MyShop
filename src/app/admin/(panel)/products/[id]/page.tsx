import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminEditProductClient } from "@/components/admin/AdminEditProductClient";
import type { CategoryOption } from "@/components/admin/ProductForm";
import type { AdminProductImageRow } from "@/components/admin/ProductImageManager";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: cats }, { data: product, error }] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("products")
      .select(
        `
        id,
        name,
        description,
        price,
        category_id,
        stock_quantity,
        status,
        display_order,
        is_featured,
        product_images ( id, image_url, alt_text, sort_order )
      `,
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (error || !product) notFound();

  const categories = (cats ?? []) as CategoryOption[];
  const images = (product.product_images ?? []) as AdminProductImageRow[];
  const sortedImages = [...images].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/products" ariaLabel="返回商品列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">編輯商品</h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground break-all">{product.id}</p>
          </div>
        </div>
      </div>

      <AdminEditProductClient
        productId={product.id}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          description: product.description,
          price: product.price,
          category_id: product.category_id,
          stock_quantity: product.stock_quantity ?? 0,
          status: product.status ?? "draft",
          display_order: product.display_order,
          is_featured: product.is_featured ?? false,
        }}
        sortedImages={sortedImages}
      />
    </div>
  );
}
