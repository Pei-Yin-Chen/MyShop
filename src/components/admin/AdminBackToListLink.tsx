import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  href: string;
  /** 螢幕報讀器用，請寫清目的地，例如「返回商品列表」 */
  ariaLabel: string;
  /** 游標懸停提示，預設為「返回列表」 */
  title?: string;
};

/**
 * 後台詳情／表單頁左上角返回列表：與會員詳細頁相同（幽靈圖示按鈕 + ArrowLeft）。
 */
export function AdminBackToListLink({ href, ariaLabel, title = "返回列表" }: Props) {
  return (
    <Link
      href={href}
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon-sm" }),
        "shrink-0 text-muted-foreground hover:text-foreground",
      )}
      title={title}
      aria-label={ariaLabel}
    >
      <ArrowLeft className="size-4" aria-hidden />
    </Link>
  );
}
