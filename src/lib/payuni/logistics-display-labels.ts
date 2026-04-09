/** PAYUNi 物流查詢回傳：以中文為主，必要時附代碼 */

export function formatPayuniGoodsTypeDisplay(value: string): string {
  switch (value.trim()) {
    case "1":
      return "常溫（代碼 1）";
    case "2":
      return "冷凍（代碼 2）";
    case "3":
      return "冷藏（代碼 3）";
    default:
      return value.trim() || "—";
  }
}

/** 取件／退貨服務方式（依 PAYUNi 文件常見值） */
export function formatPayuniServiceTypeDisplay(value: string): string {
  switch (value.trim()) {
    case "1":
      return "取貨付款（代碼 1）";
    case "3":
      return "取貨不付款（代碼 3）";
    case "4":
      return "退貨付款（代碼 4）";
    case "5":
      return "退貨不付款（代碼 5）";
    default:
      return value.trim() ? `未知（代碼 ${value.trim()}）` : "—";
  }
}

export function formatPayuniShipTypeDisplay(value: string): string {
  switch (value.trim()) {
    case "1":
      return "7-ELEVEN（代碼 1）";
    case "2":
      return "黑貓宅配（代碼 2）";
    default:
      return value.trim() ? `未知（代碼 ${value.trim()}）` : "—";
  }
}

export function formatPayuniTradeTypeDisplay(value: string): string {
  switch (value.trim()) {
    case "1":
      return "正物流（代碼 1）：賣方／物流中心 → 買方或指定收件地點";
    case "2":
      return "逆物流（代碼 2）：退貨等，貨件由買方端退回賣方或物流中心";
    default:
      return value.trim() ? `未知（代碼 ${value.trim()}）` : "—";
  }
}
