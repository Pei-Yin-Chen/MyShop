/**
 * PAYUNi 付款結果（解密後 EncryptInfo）成功判斷。
 * 欄位名稱大小寫、字串／數字可能因回傳格式略有差異，故做寬鬆比對。
 */
function getField(
  d: Record<string, string>,
  name: string,
): string {
  if (d[name] !== undefined && d[name] !== null && String(d[name]) !== "") {
    return String(d[name]).trim();
  }
  const found = Object.keys(d).find((k) => k.toLowerCase() === name.toLowerCase());
  if (found && d[found] !== undefined && d[found] !== null) {
    return String(d[found]).trim();
  }
  return "";
}

/**
 * 是否「款項已入帳／授權完成」。
 * 注意：ATM／超商取號未繳款時，文件仍可能帶 Status=SUCCESS（代表交易建立成功），
 * 但 TradeStatus=0 表示尚未付款，不可當成已付款。
 */
export function isPayuniPaymentSuccess(d: Record<string, string>): boolean {
  const tradeStatusRaw = getField(d, "TradeStatus");
  if (tradeStatusRaw !== "") {
    const n = parseInt(tradeStatusRaw, 10);
    if (!Number.isNaN(n) && n === 0) return false;
  }

  const status = getField(d, "Status").toUpperCase();
  if (status === "SUCCESS" || status === "OK") return true;

  const tradeStatus = getField(d, "TradeStatus");
  if (tradeStatus === "1") return true;
  const n = parseInt(tradeStatus, 10);
  if (!Number.isNaN(n) && n === 1) return true;

  return false;
}
