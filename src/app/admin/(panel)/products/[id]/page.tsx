import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminEditProductClient } from "@/components/admin/AdminEditProductClient";
import type { CategoryOption } from "@/components/admin/ProductForm";
import type { AdminProductImageRow } from "@/components/admin/ProductImageManager";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">編輯商品</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{product.id}</p>
        </div>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          返回列表
        </Link>
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
        }}
        sortedImages={sortedImages}
      />
    </div>
  );
}
