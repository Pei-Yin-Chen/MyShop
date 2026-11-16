import { isPayuniPaymentSuccess } from "@/lib/payuni/payment-success";

describe("isPayuniPaymentSuccess（是否已付款）", () => {
  it("【錯誤】TradeStatus 為 0（取號未繳）時，即使 Status=SUCCESS 也應回傳 false", () => {
    expect(
      isPayuniPaymentSuccess({
        Status: "SUCCESS",
        TradeStatus: "0",
      }),
    ).toBe(false);
  });

  it("【成功】Status 為 SUCCESS 時，應回傳 true", () => {
    expect(isPayuniPaymentSuccess({ Status: "SUCCESS" })).toBe(true);
  });

  it("【成功】Status 為 OK（不分大小寫）時，應回傳 true", () => {
    expect(isPayuniPaymentSuccess({ status: "ok" })).toBe(true);
  });

  it("【成功】TradeStatus 為 1 時，應回傳 true", () => {
    expect(isPayuniPaymentSuccess({ TradeStatus: "1" })).toBe(true);
  });

  it("【錯誤】沒有任何成功欄位時，應回傳 false", () => {
    expect(isPayuniPaymentSuccess({})).toBe(false);
  });
});
