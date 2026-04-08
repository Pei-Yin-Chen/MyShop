import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { CategoryCreateForm } from "@/components/admin/CategoryCreateForm";
import { CategoryEditRow } from "@/components/admin/CategoryEditRow";

type CatRow = {
  id: string;
  name: string;
  sort_order: number;
};

export default async function AdminProductCategoriesPage() {
  const supabase = await createClient();
  const { data: raw, error } = await supabase
    .from("product_categories")
    .select("id, name, sort_order")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories = raw as CatRow[] | null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">商品分類</h2>
          <p className="mt-1 text-sm text-muted-foreground">一層分類，供商品選擇與前台篩選</p>
        </div>
        <Link
          href="/admin/products"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          返回商品管理
        </Link>
      </div>

      <CategoryCreateForm />

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">名稱與排序</th>
                <th className="px-4 py-3 text-right w-28">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {categories?.map((c) => (
                <CategoryEditRow key={c.id} category={c} />
              ))}
              {(!categories || categories.length === 0) && (
                <tr>
                  <td colSpan={2} className="px-6 py-10 text-center text-muted-foreground">
                    {error ? `載入失敗：${error.message}` : "尚無分類，請先新增"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
