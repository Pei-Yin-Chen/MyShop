import type { VariantProps } from "class-variance-authority";

import { badgeVariants } from "@/components/ui/badge";

/** 與 {@link badgeVariants} 一致，供訂單狀態 Badge 使用 */
export type OrderStatusBadgeVariant = NonNullable<
  VariantProps<typeof badgeVariants>["variant"]
>;

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
 * 訂單狀態對應 Badge variant：待付款使用 warning（有底色），避免誤用 outline 看起來像純文字。
 */
export function orderStatusBadgeVariant(status: string): OrderStatusBadgeVariant {
  switch (status) {
    case "pending":
      return "warning";
    case "paid":
    case "processing":
    case "shipped":
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}
