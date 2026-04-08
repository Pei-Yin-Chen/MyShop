import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPayuniExpireBeforeUtc } from "@/lib/format-order-datetime";
import { cn } from "@/lib/utils";
import { payuniExpireDateRawToUtcBoundaryIso } from "@/lib/payuni/expire-at";
import {
  type PayuniPaymentDetailStored,
  shouldShowPayuniOfflinePaymentDetail,
} from "@/lib/payuni/payment-detail";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4 text-sm">
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="font-medium text-foreground break-all text-right sm:text-left">
        {value}
      </span>
    </div>
  );
}

export function PayuniPaymentDetailSection({
  detail,
  payuniExpireAtUtc,
  title = "繳費資訊（統一金流）",
  className,
}: {
  detail: PayuniPaymentDetailStored | null | undefined;
  /** 訂單欄位 `payuni_expire_at`（UTC）；有則優先於 detail 內字串顯示台北時間 */
  payuniExpireAtUtc?: string | null;
  title?: string;
  className?: string;
}) {
  if (!detail || !shouldShowPayuniOfflinePaymentDetail(detail)) return null;

  const d = detail;
  const expireUtcIso =
    payuniExpireAtUtc?.trim() ||
    (d.expireDate?.trim()
      ? payuniExpireDateRawToUtcBoundaryIso(d.expireDate.trim())
      : null);
  const isCvs = Boolean(d.store);
  const kindLabel = isCvs ? "超商代碼繳費" : "ATM 虛擬帳號";

  return (
    <Card
      className={cn(
        "border-border/60 shadow-sm border-amber-500/30 bg-amber-500/[0.06]",
        className,
      )}
    >
      <CardHeader className="space-y-1 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        <p className="text-xs text-muted-foreground">{kindLabel}</p>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {d.bankType ? <Row label="銀行代碼" value={d.bankType} /> : null}
        {d.payNo ? (
          <Row label={isCvs ? "繳費代碼" : "繳費帳號"} value={d.payNo} />
        ) : null}
        {expireUtcIso ? (
          <Row
            label="繳費期限"
            value={`${formatPayuniExpireBeforeUtc(expireUtcIso)} 前`}
          />
        ) : null}
        {d.store ? <Row label="超商通路" value={d.store} /> : null}
        {d.payBank ? <Row label="付款銀行代碼" value={d.payBank} /> : null}
        {d.account5No ? <Row label="付款帳號後 5 碼" value={d.account5No} /> : null}
        {d.payTime ? <Row label="付款時間" value={d.payTime} /> : null}
        {d.message ? (
          <p className="text-xs text-muted-foreground pt-1 border-t border-border/60 mt-2">
            {d.message}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
