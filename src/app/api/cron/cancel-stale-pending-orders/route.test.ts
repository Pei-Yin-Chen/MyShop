import { GET, POST } from "@/app/api/cron/cancel-stale-pending-orders/route";
import { runCancelStalePayuniPendingOrders } from "@/lib/orders/cancel-stale-payuni-pending";

jest.mock("@/lib/orders/cancel-stale-payuni-pending", () => ({
  runCancelStalePayuniPendingOrders: jest.fn(),
}));

const runCancelMock = jest.mocked(runCancelStalePayuniPendingOrders);

function makeRequest(authHeader?: string): Request {
  const headers = new Headers();
  if (authHeader) {
    headers.set("authorization", authHeader);
  }
  return new Request("http://localhost/api/cron/cancel-stale-pending-orders", {
    method: "GET",
    headers,
  });
}

describe("排程 API：取消逾期未付款訂單", () => {
  const originalCronSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    runCancelMock.mockReset();
    process.env.CRON_SECRET = "test-secret";
  });

  afterAll(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }
  });

  it("【錯誤】未設定 CRON_SECRET 時，應回傳 401", async () => {
    delete process.env.CRON_SECRET;
    const res = await GET(makeRequest("Bearer test-secret"));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(runCancelMock).not.toHaveBeenCalled();
  });

  it("【錯誤】Authorization 與 CRON_SECRET 不符時，應回傳 401", async () => {
    const res = await GET(makeRequest("Bearer wrong-secret"));

    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
    expect(runCancelMock).not.toHaveBeenCalled();
  });

  it("【成功】授權正確且服務成功時，應回傳 200 與結果", async () => {
    runCancelMock.mockResolvedValue({
      cancelled: 2,
      orderIds: ["o1", "o2"],
      staleAfterDays: 1,
    });

    const res = await GET(makeRequest("Bearer test-secret"));

    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({
      ok: true,
      cancelled: 2,
      orderIds: ["o1", "o2"],
      staleAfterDays: 1,
    });
    expect(runCancelMock).toHaveBeenCalledTimes(1);
  });

  it("【錯誤】服務拋錯時，應回傳 500 與錯誤訊息", async () => {
    runCancelMock.mockRejectedValue(new Error("db down"));

    const res = await POST(makeRequest("Bearer test-secret"));

    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({
      ok: false,
      error: "db down",
    });
    expect(runCancelMock).toHaveBeenCalledTimes(1);
  });
});
