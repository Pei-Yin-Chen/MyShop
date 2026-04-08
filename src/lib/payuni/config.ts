import { computePayuniExpireDateYyyyMmDd } from "@/lib/payuni/expire-date";

function trimEnv(v: string | undefined): string {
  return String(v ?? "").trim();
}

export function getAppBaseUrl(): string {
  const explicit = trimEnv(process.env.NEXT_PUBLIC_APP_URL);
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = trimEnv(process.env.VERCEL_URL);
  if (vercel) return `https://${vercel.replace(/\/$/, "")}`;
  return "http://localhost:3000";
}

export type PayuniConfig = {
  merId: string;
  hashKey: string;
  hashIv: string;
  sandbox: boolean;
  apiVersion: string;
  uppUrl: string;
};

export function getPayuniConfig(): PayuniConfig | null {
  const merId = trimEnv(process.env.PAYUNI_MER_ID);
  const hashKey = trimEnv(process.env.PAYUNI_HASH_KEY);
  const hashIv = trimEnv(process.env.PAYUNI_HASH_IV);
  if (!merId || !hashKey || !hashIv) return null;

  const sandbox =
    trimEnv(process.env.PAYUNI_SANDBOX).toLowerCase() === "true" ||
    trimEnv(process.env.PAYUNI_SANDBOX) === "1";

  const apiVersion = trimEnv(process.env.PAYUNI_API_VERSION) || "2.0";

  const uppUrl = sandbox
    ? "https://sandbox-api.payuni.com.tw/api/upp"
    : "https://api.payuni.com.tw/api/upp";

  return { merId, hashKey, hashIv, sandbox, apiVersion, uppUrl };
}

/**
 * UPP EncryptInfo 選填：繳費截止日 YYYY-MM-DD、ATM 銀行代碼（逗號分隔），見 PAYUNi 文件。
 * `ExpireDate`：未設定 `PAYUNI_EXPIRE_DATE` 時為「台北下單日 + 1 日」日曆日（與 PAYUNi 1 日期限、該日 23:59:59 前有效之語意一致）。
 */
export function getPayuniUppOptionalEncryptFields(): Record<string, string> {
  const out: Record<string, string> = {};
  const expireDateOverride = trimEnv(process.env.PAYUNI_EXPIRE_DATE);
  out.ExpireDate = expireDateOverride || computePayuniExpireDateYyyyMmDd();
  const atmBankType = trimEnv(process.env.PAYUNI_ATM_BANK_TYPES);
  if (atmBankType) out.AtmBankType = atmBankType;
  return out;
}
