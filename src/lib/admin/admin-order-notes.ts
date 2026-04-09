import { ORDER_PROCESSING_BADGE_CLASSNAME } from "@/lib/orders/order-status-display";

/** 後台訂單備註單筆長度上限（與 DB check、表單一致） */
export const ADMIN_ORDER_NOTE_MAX_CHARS = 250;

export const ORDER_ADMIN_NOTE_HANDLING_VALUES = [
  "none",
  "pending",
  "processing",
  "resolved",
] as const;
export type OrderAdminNoteHandling =
  (typeof ORDER_ADMIN_NOTE_HANDLING_VALUES)[number];

export function orderAdminNoteHandlingLabel(status: string): string {
  switch (status) {
    case "none":
      return "未設定";
    case "pending":
      return "待處理";
    case "processing":
      return "處理中";
    case "resolved":
      return "已處理";
    default:
      return status;
  }
}

/** 內部備註處理狀態：待處理＝需注意（琥珀）；處理中與訂單狀態「處理中」同色；已處理＝結案（綠）。 */
export function orderAdminNoteHandlingBadgeProps(status: string): {
  variant: "default" | "secondary" | "warning" | "outline";
  className?: string;
} {
  switch (status) {
    case "none":
      return {
        variant: "outline",
        className:
          "border-muted-foreground/35 bg-muted/50 font-normal text-muted-foreground",
      };
    case "pending":
      return { variant: "warning", className: "font-normal" };
    case "processing":
      return { variant: "outline", className: `${ORDER_PROCESSING_BADGE_CLASSNAME} font-normal` };
    case "resolved":
      return {
        variant: "secondary",
        className:
          "border-emerald-200/90 bg-emerald-100 font-normal text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100",
      };
    default:
      return { variant: "outline", className: "font-normal" };
  }
}
