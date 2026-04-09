/** 訂單物流狀態（與訂單狀態 badge 區隔：此為配送進度） */
export function orderLogisticsStatusLabel(input: {
  shippingMethod: "home" | "store";
  orderStatus: string;
  shippedAt: string | null;
}): string {
  if (input.shippingMethod === "store") {
    if (input.orderStatus === "cancelled") {
      return "—";
    }
    if (input.orderStatus === "pending") {
      return "待付款";
    }
    if (input.orderStatus === "completed") {
      return "已完成";
    }
    if (input.orderStatus === "shipped") {
      return "可取貨";
    }
    if (input.orderStatus === "paid" || input.orderStatus === "processing") {
      return "待備貨";
    }
    return "—";
  }
  if (input.orderStatus === "cancelled") {
    return "—";
  }
  if (input.shippedAt) {
    return "配送中";
  }
  return "尚未出貨";
}
