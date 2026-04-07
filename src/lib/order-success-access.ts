import crypto from "crypto";
import { NextResponse } from "next/server";

/**
 * 金流以 Form POST 導回本站時，瀏覽器可能不帶 SameSite Cookie，成功頁讀不到登入狀態。
 * 付款驗證成功後由伺服器簽發短期 access token，僅用於顯示該筆訂單（與 orderId + userId 綁定）。
 * Token 經 Redirect 回應 Set-Cookie（httpOnly）傳遞，成功頁網址僅需帶 orderId。
 *
 * 請設定 ORDER_SUCCESS_ACCESS_SECRET（建議隨機 32+ 字元），或沿用 SUPABASE_SERVICE_ROLE_KEY。
 */

const TTL_MS = 45 * 60 * 1000;

export const ORDER_SUCCESS_ACCESS_COOKIE_NAME = "order_success_access";
export const ORDER_SUCCESS_ACCESS_COOKIE_MAX_AGE_SEC = Math.floor(TTL_MS / 1000);

/** 判斷是否為 HTTPS（含反向代理 x-forwarded-proto） */
export function isHttpsRequest(req: Request): boolean {
  const url = new URL(req.url);
  if (url.protocol === "https:") return true;
  const fp = req.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return fp === "https";
}

/**
 * 金流以 **跨站 POST** 導回時，瀏覽器常拒絕在該回應中寫入 SameSite=Lax Cookie。
 * 正式 HTTPS 須使用 SameSite=None + Secure。
 */
export function setOrderSuccessAccessCookieOnResponse(
  res: NextResponse,
  accessToken: string,
  req: Request,
): void {
  const https = isHttpsRequest(req);
  res.cookies.set(ORDER_SUCCESS_ACCESS_COOKIE_NAME, accessToken, {
    httpOnly: true,
    secure: https,
    sameSite: https ? "none" : "lax",
    path: "/",
    maxAge: ORDER_SUCCESS_ACCESS_COOKIE_MAX_AGE_SEC,
  });
}

/**
 * 導向成功頁：HTTPS 僅 Set-Cookie（網址不帶 access）；本機 http 開發時 Cookie 常無效，改附 access query 後備。
 */
export function redirectToCheckoutSuccessWithAccess(
  req: Request,
  origin: string,
  orderId: string,
  access: string,
  opts?: { pay?: string },
): NextResponse {
  const qs = new URLSearchParams({ orderId });
  if (opts?.pay) qs.set("pay", opts.pay);
  const url = new URL(`/checkout/success?${qs}`, origin);

  if (!access) {
    return NextResponse.redirect(url);
  }

  if (isHttpsRequest(req)) {
    const res = NextResponse.redirect(url);
    setOrderSuccessAccessCookieOnResponse(res, access, req);
    return res;
  }

  if (process.env.NODE_ENV === "development") {
    url.searchParams.set("access", access);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(url);
  setOrderSuccessAccessCookieOnResponse(res, access, req);
  return res;
}

/**
 * 付款未成功／金額不符等：導向獨立頁（版面接近成功頁），Cookie／access 邏輯與成功頁相同。
 */
export function redirectToPaymentFailedWithAccess(
  req: Request,
  origin: string,
  orderId: string,
  access: string,
  opts?: { reason?: "failed" | "amt" },
): NextResponse {
  const qs = new URLSearchParams({ orderId });
  if (opts?.reason) qs.set("reason", opts.reason);
  const url = new URL(`/checkout/payment-failed?${qs}`, origin);

  if (!access) {
    return NextResponse.redirect(url);
  }

  if (isHttpsRequest(req)) {
    const res = NextResponse.redirect(url);
    setOrderSuccessAccessCookieOnResponse(res, access, req);
    return res;
  }

  if (process.env.NODE_ENV === "development") {
    url.searchParams.set("access", access);
    return NextResponse.redirect(url);
  }

  const res = NextResponse.redirect(url);
  setOrderSuccessAccessCookieOnResponse(res, access, req);
  return res;
}

function getSecret(): Buffer {
  const s =
    process.env.ORDER_SUCCESS_ACCESS_SECRET?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!s) {
    throw new Error(
      "缺少 ORDER_SUCCESS_ACCESS_SECRET 或 SUPABASE_SERVICE_ROLE_KEY，無法簽發成功頁 access",
    );
  }
  return Buffer.from(s, "utf8");
}

export function createOrderSuccessAccessToken(orderId: string, userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      orderId,
      userId,
      exp: Date.now() + TTL_MS,
    }),
    "utf8",
  ).toString("base64url");
  const sig = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyOrderSuccessAccessToken(
  token: string,
): { orderId: string; userId: string } | null {
  try {
    const dot = token.indexOf(".");
    if (dot < 0) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
    const a = Buffer.from(sig, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

    const data = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as { orderId?: string; userId?: string; exp?: number };
    if (typeof data.exp !== "number" || Date.now() > data.exp) return null;
    if (typeof data.orderId !== "string" || typeof data.userId !== "string") return null;
    return { orderId: data.orderId, userId: data.userId };
  } catch {
    return null;
  }
}
