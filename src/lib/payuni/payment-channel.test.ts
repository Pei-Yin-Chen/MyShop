import {
  extractPayuniPaymentType,
  formatPayuniPaymentTypeForDisplay,
} from "@/lib/payuni/payment-channel";

describe("extractPayuniPaymentType（解析付款方式）", () => {
  it("數字 PaymentType=2 應對應成 VACC（ATM）", () => {
    expect(extractPayuniPaymentType({ PaymentType: "2" })).toBe("VACC");
  });

  it("PaymentType=1 且 AuthType=4 應對應成 APPLEPAY", () => {
    expect(
      extractPayuniPaymentType({ PaymentType: "1", AuthType: "4" }),
    ).toBe("APPLEPAY");
  });

  it("PaymentType=1 且沒有錢包 AuthType 時，應預設為 CREDIT", () => {
    expect(extractPayuniPaymentType({ PaymentType: "1" })).toBe("CREDIT");
  });

  it("沒有 PaymentType 時，應從通路旗標讀取（如 LINEPAY=1）", () => {
    expect(extractPayuniPaymentType({ LINEPAY: "1" })).toBe("LINEPAY");
  });

  it("沒有任何可辨識欄位時，應回傳 null", () => {
    expect(extractPayuniPaymentType({})).toBeNull();
  });
});

describe("formatPayuniPaymentTypeForDisplay（顯示用文字）", () => {
  it("已知通路代碼應轉成中文顯示名稱", () => {
    expect(formatPayuniPaymentTypeForDisplay("VACC")).toBe("ATM 轉帳");
    expect(formatPayuniPaymentTypeForDisplay("LINEPAY")).toBe("LINE Pay");
  });

  it("舊資料的數字代碼應轉成顯示名稱", () => {
    expect(formatPayuniPaymentTypeForDisplay("2")).toBe("ATM 轉帳");
  });

  it("空值或空白應回傳 null", () => {
    expect(formatPayuniPaymentTypeForDisplay(null)).toBeNull();
    expect(formatPayuniPaymentTypeForDisplay("  ")).toBeNull();
  });
});
