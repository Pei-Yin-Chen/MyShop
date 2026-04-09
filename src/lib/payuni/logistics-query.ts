import type { PayuniConfig } from "@/lib/payuni/config";
import {
  decryptPayuniPayload,
  encryptPayuniPayload,
  hashPayuniEncryptInfo,
  verifyPayuniHash,
} from "@/lib/payuni/crypto";

/** 物流查詢 API 固定版本（與 UPP 的 Version 不同） */
export const PAYUNI_LOGISTICS_QUERY_VERSION = "1.1";

export type PayuniLgsType = "B2C" | "C2C" | "HOME" | "C2B";

export function getPayuniLogisticsQueryUrl(sandbox: boolean): string {
  return sandbox
    ? "https://sandbox-api.payuni.com.tw/api/logistics/query"
    : "https://api.payuni.com.tw/api/logistics/query";
}

export function buildLogisticsQueryEncryptFields(
  merId: string,
  input: {
    lgsType: PayuniLgsType;
    shipTradeNo?: string;
    returnOdno?: string;
    tradeType?: 1 | 2;
  },
): Record<string, string | number> {
  const ts = Math.floor(Date.now() / 1000);
  const out: Record<string, string | number> = {
    MerID: merId,
    Timestamp: ts,
    LgsType: input.lgsType,
  };
  if (input.lgsType === "C2B") {
    const r = input.returnOdno?.trim() ?? "";
    if (r) out.ReturnOdno = r;
  } else {
    const s = input.shipTradeNo?.trim() ?? "";
    if (s) out.ShipTradeNo = s;
    if (input.lgsType === "HOME" && input.tradeType != null) {
      out.TradeType = input.tradeType;
    }
  }
  return out;
}

export function buildPayuniLogisticsQueryPostBody(
  cfg: PayuniConfig,
  encryptFields: Record<string, string | number>,
): { MerID: string; Version: string; EncryptInfo: string; HashInfo: string } {
  const encryptInfo = encryptPayuniPayload(encryptFields, cfg.hashKey, cfg.hashIv);
  const hashInfo = hashPayuniEncryptInfo(encryptInfo, cfg.hashKey, cfg.hashIv);
  return {
    MerID: cfg.merId,
    Version: PAYUNI_LOGISTICS_QUERY_VERSION,
    EncryptInfo: encryptInfo,
    HashInfo: hashInfo,
  };
}

function parsePayuniGatewayResponseBody(text: string): Record<string, string> {
  const trimmed = text.trim();
  if (!trimmed) return {};
  if (trimmed.startsWith("{")) {
    const j = JSON.parse(trimmed) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(j).map(([k, v]) => [k, v == null ? "" : String(v)]),
    );
  }
  const u = new URLSearchParams(trimmed);
  const o: Record<string, string> = {};
  u.forEach((v, k) => {
    o[k] = v;
  });
  return o;
}

export type PayuniLogisticsQueryResult =
  | { ok: true; payload: Record<string, string> }
  | { ok: false; error: string };

/**
 * 呼叫 PAYUNi 物流查詢 API，回傳解密後 EncryptInfo 鍵值（皆為字串）。
 */
export async function executePayuniLogisticsQuery(
  cfg: PayuniConfig,
  encryptFields: Record<string, string | number>,
): Promise<PayuniLogisticsQueryResult> {
  const post = buildPayuniLogisticsQueryPostBody(cfg, encryptFields);
  const url = getPayuniLogisticsQueryUrl(cfg.sandbox);

  const body = new URLSearchParams({
    MerID: post.MerID,
    Version: post.Version,
    EncryptInfo: post.EncryptInfo,
    HashInfo: post.HashInfo,
  });

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "payuni",
      },
      body: body.toString(),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `無法連線至 PAYUNi：${msg}` };
  }

  const rawText = await res.text();
  let outer: Record<string, string>;
  try {
    outer = parsePayuniGatewayResponseBody(rawText);
  } catch {
    return { ok: false, error: "無法解析 PAYUNi 回應格式" };
  }

  if (!res.ok && !outer.EncryptInfo && !outer.encryptInfo) {
    return {
      ok: false,
      error: outer.Message || outer.message || `PAYUNi HTTP ${res.status}`,
    };
  }

  const encryptHex =
    outer.EncryptInfo ?? outer.encryptInfo ?? "";
  const hashInfo = outer.HashInfo ?? outer.hashInfo ?? "";
  if (!encryptHex || !hashInfo) {
    return {
      ok: false,
      error: outer.Message || outer.message || "回應缺少 EncryptInfo 或 HashInfo",
    };
  }

  if (!verifyPayuniHash(encryptHex, hashInfo, cfg.hashKey, cfg.hashIv)) {
    return { ok: false, error: "回應 Hash 驗證失敗" };
  }

  let decrypted: Record<string, string>;
  try {
    decrypted = decryptPayuniPayload(encryptHex, cfg.hashKey, cfg.hashIv);
  } catch {
    return { ok: false, error: "無法解密 PAYUNi 回應" };
  }

  const st = (decrypted.Status ?? decrypted.status ?? "").trim().toUpperCase();
  if (st && st !== "SUCCESS") {
    const msg = decrypted.Message ?? decrypted.message ?? st;
    return { ok: false, error: msg || "查詢失敗" };
  }

  return { ok: true, payload: decrypted };
}
