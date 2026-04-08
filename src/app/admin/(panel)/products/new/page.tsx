import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { ProductForm, type CategoryOption } from "@/components/admin/ProductForm";

export default async function AdminNewProductPage() {
  const supabase = await createClient();
  const { data: cats } = await supabase
    .from("product_categories")
    .select("id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories = (cats ?? []) as CategoryOption[];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/products" ariaLabel="返回商品列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">新增商品</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">建立後可於編輯頁上傳與排序圖片</p>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          尚未建立任何商品分類，請先到{" "}
          <Link href="/admin/products/categories" className="font-medium underline">
            商品分類
          </Link>{" "}
          新增分類。
        </p>
      ) : (
        <ProductForm mode="create" categories={categories} />
      )}
    </div>
  );
}
