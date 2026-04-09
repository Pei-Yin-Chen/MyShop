import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/ui/badge";

/** 與 {@link badgeVariants} 一致，供訂單狀態 Badge 使用 */
export type OrderStatusBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

/** 訂單／內部備註「處理中」共用：作業進行中 → 藍系 */
export const ORDER_PROCESSING_BADGE_CLASSNAME =
  "border-sky-300/90 bg-sky-100 font-medium text-sky-950 dark:border-sky-700 dark:bg-sky-950/45 dark:text-sky-100";

/** 訂單狀態中文標籤（與後台列表、會員中心一致） */
export function orderStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "待付款";
    case "paid":
      return "已付款";
    case "processing":
      return "處理中";
    case "shipped":
      return "已出貨";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return status;
  }
}

/**
 * 訂單狀態 Badge（語意配色）：
 * 待付款＝需注意（琥珀）、已付款＝入帳（淡綠）、處理中＝進行中（藍）、已出貨＝物流（靛）、已完成＝結案（綠）、已取消＝中止（紅）。
 */
export function orderStatusBadgeVariant(status: string): OrderStatusBadgeVariant {
  return orderStatusBadgeProps(status).variant;
}

export function orderStatusBadgeProps(status: string): {
  variant: OrderStatusBadgeVariant;
  className?: string;
} {
  switch (status) {
    case "pending":
      return { variant: "warning" };
    case "processing":
      return {
        variant: "outline",
        className: ORDER_PROCESSING_BADGE_CLASSNAME,
      };
    case "paid":
      return {
        variant: "outline",
        className:
          "border-emerald-200/90 bg-emerald-50 font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/35 dark:text-emerald-100",
      };
    case "shipped":
      return {
        variant: "outline",
        className:
          "border-indigo-200/90 bg-indigo-100 font-medium text-indigo-950 dark:border-indigo-800 dark:bg-indigo-950/45 dark:text-indigo-100",
      };
    case "completed":
      return {
        variant: "outline",
        className:
          "border-emerald-300/90 bg-emerald-100 font-medium text-emerald-950 dark:border-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-50",
      };
    case "cancelled":
      return { variant: "destructive" };
    default:
      return { variant: "outline" };
  }
}
