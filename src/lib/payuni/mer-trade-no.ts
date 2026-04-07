import { randomBytes } from "crypto";

const MER_TRADE_NO_RE = /^[A-Za-z0-9_-]{1,25}$/;

/**
 * PAYUNi MerTradeNo：長度 ≤25，字元 [A-Za-z0-9_-]，10 分鐘內不可重複（由平台檢查）
 */
export function generateMerTradeNo(): string {
  const ts = Date.now().toString(36);
  const rand = randomBytes(8)
    .toString("base64url")
    .replace(/[^A-Za-z0-9_-]/g, "");
  const s = `${ts}_${rand}`.slice(0, 25);
  if (!MER_TRADE_NO_RE.test(s)) {
    return generateMerTradeNo();
  }
  return s;
}
