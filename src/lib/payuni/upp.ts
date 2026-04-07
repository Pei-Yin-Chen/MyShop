import type { PayuniConfig } from "./config";
import { encryptPayuniPayload, hashPayuniEncryptInfo } from "./crypto";

export type UppEncryptFields = {
  MerID: string;
  MerTradeNo: string;
  TradeAmt: number;
  Timestamp: number;
  ProdDesc: string;
  ReturnURL?: string;
  NotifyURL?: string;
  BackURL?: string;
  UsrMail?: string;
  Lang?: string;
  /** 付款頁交易截止秒數（60–600） */
  TradeLExpireSec?: number;
  /** 超商／ATM 繳費有效日期 YYYY-MM-DD */
  ExpireDate?: string;
  /** ATM 指定銀行代碼，逗號分隔，例：822,004,013 */
  AtmBankType?: string;
  Credit?: 1;
  ICash?: 1;
  Aftee?: 1;
  LinePay?: 1;
  JKoPay?: 1;
  ATM?: 1;
  CVS?: 1;
  CreditUnionPay?: 1;
  CreditInst?: string;
  ApplePay?: 1;
  GooglePay?: 1;
  SamsungPay?: 1;
};

export function buildUppPostBody(
  cfg: PayuniConfig,
  encryptFields: UppEncryptFields,
): { MerID: string; Version: string; EncryptInfo: string; HashInfo: string } {
  const record: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(encryptFields)) {
    if (v === undefined || v === null || v === "") continue;
    record[k] = v;
  }

  const encryptInfo = encryptPayuniPayload(record, cfg.hashKey, cfg.hashIv);
  const hashInfo = hashPayuniEncryptInfo(encryptInfo, cfg.hashKey, cfg.hashIv);

  return {
    MerID: cfg.merId,
    Version: cfg.apiVersion,
    EncryptInfo: encryptInfo,
    HashInfo: hashInfo,
  };
}
